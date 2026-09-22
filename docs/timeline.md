# Tibo timeline

This is the running project record. Update it when scope changes, a capability
ships, or a user gives us evidence that changes the priority. Keep the newest
entry at the top.

## Current status — 22 September 2026

### Done

- Product narrowed to a local-first decision ledger for coding-agent changes.
- TypeScript CLI scaffolded with `scan` and `scan --json` commands.
- Working-tree and untracked-file diffs are collected locally.
- Dependency additions, environment-variable references, schema changes,
  newly exported symbols, and possible new-module overlap are detected;
  destructive statements are marked high severity.
- Dependency findings include manifest, added usage, and possible repository
  matches with line numbers where available.
- Findings have stable IDs and support keep, reject, later, and why decisions.
- `tibo decide` records decisions for non-interactive agent skills.
- A portable `tibo-review` skill is included for Codex and Claude Code.
- The skill supports explicit-approval remediation followed by tests and a rescan.
- `tibo summary` reports ledger decisions and current unresolved findings for a fresh session.
- Confirmed decisions persist in `.tibo/decisions.json` and
  `.tibo/decisions.md`.
- Root tests pass and the CLI builds successfully.
- Tibo's landing page is colocated in `website/` and deployed at
  `https://tiborun.vercel.app`.

### In progress

**Phase 3 handoff.** The scan, decision command, ledger, portable skill, and
remediation workflow are working. `tibo summary` now gives a fresh agent the
confirmed, rejected, deferred, and unresolved state. The next work is richer
schema safety and public/module boundary detection.

### Next selected workstream

The following four areas are now selected for implementation after the real
movie-app dogfood pass:

1. **More detectors:** routes, CLI commands, event names, serialized fields,
   stronger import-graph module evidence, and rollback compatibility checks.
2. **Real agent validation:** install and exercise the portable skill in actual
   Codex and Claude environments, recording any host-specific differences.
3. **Team review surfaces:** add a base-commit mode first, then a GitHub Action
   and pull-request reports that reuse the same JSON findings contract.
4. **Optional model assistance:** define an evidence-only explanation provider;
   no model may create findings, approve decisions, or receive unrestricted
   repository contents.

The movie-app dogfood repository is the validation gate for these changes.

### Pending / deliberately later

- Hosted storage or a Tibo account.
- Mandatory API keys.
- Autonomous edits without explicit approval.
- Token-savings or productivity claims without measurements.

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
