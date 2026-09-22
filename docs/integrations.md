# Agent integrations

Tibo has one local evidence engine and a portable review skill. The skill works
in hosts that load `SKILL.md`, including Codex and Claude Code; it does not add a
second detector implementation.

## Install the skill

Copy `skills/tibo-review/` into the host's skill directory:

- Codex: `~/.codex/skills/tibo-review/`
- Claude Code: `.claude/skills/tibo-review/` in the repository, or the user's
  configured Claude skills directory.

Build Tibo once, or use the published CLI. The skill
runs `npx --yes @goankan/tibo@0.1.1 scan --json` and `npx --yes @goankan/tibo@0.1.1 decide ...` locally, then uses the host agent
only to explain the returned evidence and collect the human decision.

## Trust boundary

The CLI decides what evidence exists. The host model may summarize that evidence
using the task context, but it must not invent repository matches, approve a
finding, or replace the evidence contract. No repository contents leave the
machine through Tibo.

## Optional remediation

A rejected finding is only a recorded decision. If the engineer separately
approves a repair, the host agent can use the finding evidence to make a narrow
edit, run tests, and run Tibo again. The original rejection remains in the
ledger; Tibo itself never edits source files.

## npm package

The next package release is `@goankan/tibo@0.1.1`. Publish it before asking
users or agent skills to run the pinned commands below:

```bash
npm publish --access public
```

Then users can run:

```bash
npx --yes @goankan/tibo@0.1.1 scan
```

Until the first npm release, use `npm run build` followed by
`node dist/index.js scan` from a checkout.
