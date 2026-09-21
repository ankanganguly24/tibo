# Tibo timeline

This is the running project record. Update it when scope changes, a capability
ships, or a user gives us evidence that changes the priority. Keep the newest
entry at the top.

## Current status — 21 September 2026

### Done

- Product narrowed to a local-first decision ledger for coding-agent changes.
- TypeScript CLI scaffolded with `scan` and `scan --json` commands.
- Working-tree and untracked-file diffs are collected locally.
- Dependency additions and environment-variable references are detected.
- Findings have stable IDs and support keep, reject, later, and why decisions.
- Confirmed decisions persist in `.tibo/decisions.json` and
  `.tibo/decisions.md`.
- Root tests pass and the CLI builds successfully.
- Tibo's landing page is colocated in `website/` and deployed at
  `https://tiborun.vercel.app`.

### In progress

**Evidence-rich dependency findings.** A user identified the highest-signal
version of the dependency check: show the package and version, the diff lines
that added it, every usage location, and whether the repository already has an
existing package or internal utility that covers the same job.

The current detector catches the new dependency, but does not yet provide all
of that evidence. This is the next implementation slice.

### Next

1. Add dependency evidence to the finding model and both terminal/JSON output.
2. Resolve import and usage locations from the changed files.
3. Search the repository's manifest and source tree for overlapping packages
   or utilities, with links to the evidence rather than guesses.
4. Add fixtures and tests for a genuinely new dependency, an unnecessary
   duplicate, and a package whose usage cannot be resolved.
5. Only then move to schema changes, module overlap, and Git scope checks.

### Pending / deliberately later

- Codex handoff summaries and unresolved-question output.
- GitHub Action and pull-request reports.
- Optional model-assisted explanations with a strict evidence boundary.
- Adapters for other coding agents.
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
