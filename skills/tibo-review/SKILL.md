---
name: tibo-review
description: Review structural decisions made by a coding agent after it changes a TypeScript or JavaScript repository. Use when a coding task is complete and the user needs evidence for new dependencies, environment variables, schema edits, or other architectural changes.
---

# Tibo review

Use Tibo as a local evidence checkpoint after an agent has edited a repository.
Tibo is the source of truth for what changed. Do not recreate its detection logic
or infer conclusions that are not present in its findings.

## Start with project context

At the start of a fresh agent session, run:

```bash
npx @goankan/tibo summary --json
```

Use it to understand kept, rejected, deferred, and unresolved decisions. Do
not treat a rejected decision as an unresolved request unless the user asks to
revisit it.

## Run the review

From the repository being changed, run the available Tibo command:

```bash
npx @goankan/tibo scan --json
```

If the `tibo` binary is not installed, use the repository's local build:

```bash
node /absolute/path/to/tibo/dist/index.js summary --json
node /absolute/path/to/tibo/dist/index.js scan --json
```

Do not send the repository, diff, or secrets to a hosted service. Tibo's scan is
local and does not need an API key or model call.

## Present findings

For each finding, show:

1. The exact summary and finding ID.
2. Every evidence path and line returned by Tibo.
3. The confidence.
4. The severity.
5. The limitation, verbatim or faithfully shortened.

Group related evidence under one finding. Never call a dependency unsafe,
unnecessary, or equivalent to an existing package unless Tibo's evidence proves
that claim. If Tibo says evidence is missing, say that plainly.

Ask the user to choose `keep`, `reject`, or `later` for each unresolved finding.
Do not silently choose for them. If there are no findings, report that the scan
found no supported structural decisions.

## Record decisions

After the user chooses, record each decision with its stable ID:

```bash
npx @goankan/tibo decide <finding-id> keep
npx @goankan/tibo decide <finding-id> reject
npx @goankan/tibo decide <finding-id> later
```

If using a local build, replace `tibo` with the same `node .../dist/index.js`
command. Confirm the command succeeded and mention that the decision is stored
in `.tibo/decisions.json` and `.tibo/decisions.md`.

## Output discipline

Keep the model explanation short. The host agent may explain why a finding could
matter using the user's task context, but it must separate that explanation from
Tibo's evidence. Do not paste the entire repository or raw diff into the model
context when the JSON finding already answers the review question.

## Optional remediation

A rejection records intent; it does not edit files. Only offer remediation after
the user explicitly rejects a finding and separately approves a repair plan that
lets the host agent change the repository.

Before editing, state a bounded repair plan using the finding's evidence. For a
rejected dependency, the plan may include removing the manifest entry, removing
its imports, updating the lockfile through the package manager, and adjusting
only directly affected code. Do not remove unrelated files or replace the
package with an unrequested alternative.

After approval:

1. Make the smallest code change that addresses the rejected finding.
2. Run the relevant tests or build command.
3. Run `npx @goankan/tibo scan --json` again.
4. Report whether the original finding disappeared, remains, or changed.
5. Keep the original rejection in the ledger as the decision record.

If the repair needs a design choice, stop and ask instead of guessing. The host
agent performs the edit; Tibo only supplies evidence and verifies the next diff.
