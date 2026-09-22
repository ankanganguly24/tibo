# Tibo timeline

This is the running project record. Update it when scope changes, a capability
ships, or a user gives us evidence that changes the priority. Keep the newest
entry at the top.

## Current status — 22 September 2026

### Done

- Product narrowed to a local-first decision ledger for coding-agent changes.
- TypeScript CLI scaffolded with `scan` and `scan --json` commands.
- Working-tree and untracked-file diffs are collected locally.
- Dependency additions, environment-variable references, and basic schema
  changes are detected.
- Dependency findings include manifest, added usage, and possible repository
  matches with line numbers where available.
- Findings have stable IDs and support keep, reject, later, and why decisions.
- `tibo decide` records decisions for non-interactive agent skills.
- A portable `tibo-review` skill is included for Codex and Claude Code.
- The skill supports explicit-approval remediation followed by tests and a rescan.
- Confirmed decisions persist in `.tibo/decisions.json` and
  `.tibo/decisions.md`.
- Root tests pass and the CLI builds successfully.
- Tibo's landing page is colocated in `website/` and deployed at
  `https://tiborun.vercel.app`.

### In progress

**Fresh-session continuity.** The scan, decision command, ledger, and portable
skill workflow are working. Remediation is now an opt-in host-agent step that
is verified by tests and a rescan. The next useful surface is a compact summary
that lets a new agent understand confirmed, rejected, deferred, and unresolved
work.

### Next

1. Add `tibo summary` with stable JSON and readable terminal output.
2. Make the skill consume the summary at the start of a fresh session.
3. Validate the portable skill instructions in Codex and Claude Code installs.
4. Only then move to richer schema safety, module overlap, and Git scope checks.

### Pending / deliberately later

- Codex handoff summaries and unresolved-question output.
- GitHub Action and pull-request reports.
- Optional model-assisted explanations with a strict evidence boundary.
- Hosted storage, mandatory API keys, autonomous edits, and token-savings
  claims without measurements.

## Decision log

### 21 September 2026 — prioritize dependency evidence

We chose dependency evidence as the next feature because it makes a finding
reviewable. A package name alone is a warning; package, version, changed lines,
usage sites, and existing alternatives are evidence an engineer can approve or
reject. This keeps Tibo focused on surfacing decisions instead of producing a
generic list of code smells.

### Earlier — keep the first release local and structural

The first release does not send repository code to a model. Detection stays
local and deterministic; model-assisted explanations remain an explicit later
option with a strict evidence boundary.
