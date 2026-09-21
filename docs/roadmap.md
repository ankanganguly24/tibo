# Roadmap

Status is tracked in [`timeline.md`](timeline.md). The timeline is the source
of truth for what is shipped, in progress, and intentionally pending.

## Phase 1 — Decision ledger proof

- [x] Define the finding and ledger schemas.
- [x] Build a TypeScript/JavaScript repository scanner.
- [x] Detect added dependencies and environment variables.
- [x] Render an interactive keep/reject/later list.
- [x] Write and reload a durable ledger.
- [ ] Make dependency findings evidence-rich: package/version, diff lines,
  usage locations, and overlapping packages already in the repository.

## Phase 2 — Structural coverage

- [ ] Add schema and persistence detection.
- [ ] Add public-interface and module-overlap signals.
- [ ] Add Git scope checks.
- [ ] Add deterministic fixtures and meaningful failure cases.

## Phase 3 — Codex workflow

- [ ] Make Tibo's AGENTS.md a useful reference implementation.
- [ ] Let Codex read confirmed decisions and unresolved questions.
- [ ] Add a concise decision summary for the next session.
- [ ] Explore problem structuring only if it strengthens the ledger loop.

## Phase 4 — Adoption

- [ ] GitHub Action for pull-request findings.
- [ ] Reviewable HTML or Markdown reports.
- [ ] Optional model-assisted explanations with a strict evidence boundary.
- [ ] Adapters for other coding agents.

## Explicitly deferred

- Hosted repository storage
- Mandatory API keys or model providers
- A broad project-learning mode
- Autonomous code edits
- Token-savings claims without measured end-to-end evidence
