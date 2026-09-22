# Agent integrations

Tibo has one local evidence engine and a portable review skill. The skill works
in hosts that load `SKILL.md`, including Codex and Claude Code; it does not add a
second detector implementation.

## Install the skill

Copy `skills/tibo-review/` into the host's skill directory:

- Codex: `~/.codex/skills/tibo-review/`
- Claude Code: `.claude/skills/tibo-review/` in the repository, or the user's
  configured Claude skills directory.

Build Tibo once, or install the published CLI when it is available. The skill
runs `tibo scan --json` and `tibo decide ...` locally, then uses the host agent
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

The package metadata is prepared for `@goankan/tibo@0.1.0`. After the maintainer logs in
to npm, publish it with:

```bash
npm publish --access public
```

Then users can run:

```bash
npx @goankan/tibo scan
```

Until the first npm release, use `npm run build` followed by
`node dist/index.js scan` from a checkout.
