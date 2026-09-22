# Tibo timeline

This is the running project record. Update it when scope changes, a capability
ships, or a user gives us evidence that changes the priority. Keep the newest
entry at the top.

## Current status — 22 September 2026

### Done

- Product narrowed to a local-first decision ledger for coding-agent changes.
- TypeScript CLI scaffolded with `scan` and `scan --json` commands.
- Working-tree and untracked-file diffs are collected locally.
- Dependency additions and environment-variable references are detected.
- Dependency findings include manifest, added usage, and possible repository
  matches with line numbers where available.
- Findings have stable IDs and support keep, reject, later, and why decisions.
- `tibo decide` records decisions for non-interactive agent skills.
- A portable `tibo-review` skill is included for Codex and Claude Code.
- Confirmed decisions persist in `.tibo/decisions.json` and
  `.tibo/decisions.md`.
- Root tests pass and the CLI builds successfully.
- Tibo's landing page is colocated in `website/` and deployed at
  `https://tiborun.vercel.app`.

### In progress

**Agent workflow validation.** The first skill can run the CLI and record
explicit decisions. Repository matches are now reported as bounded lexical
evidence, never as proof of equivalence.

### Next

1. Install and dogfood the Codex skill on Tibo's own changes.
2. Validate the same portable skill instructions in Claude Code.
3. Only then move to schema safety, module overlap, and Git scope checks.

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
