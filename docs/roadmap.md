# Roadmap

The roadmap describes what we are building and the proof required to move
between phases. [`timeline.md`](timeline.md) records what has actually shipped,
what is being worked on, and why priorities changed.

Tibo is successful when an engineer can answer one question quickly: **“What
did the agent decide here, and do I agree with it?”** Every phase below must
make that answer more useful without turning Tibo into a generic linter or a
hosted code analysis service.

## How to use this roadmap

The phases are deliberately sequential. Each one earns the next by proving a
small user flow before adding more detectors or integrations.

1. **Choose one decision type.** Start with the smallest change an agent can
   make quietly, such as adding a dependency.
2. **Extract evidence.** Show file paths, line numbers, diff context, and
   repository matches. A detector is incomplete if it only emits a label.
3. **Ask for a decision.** The user keeps, rejects, or defers the finding.
   Tibo records the response without changing code.
4. **Preserve the decision.** The ledger must explain the evidence later and
   prevent accepted work from being raised again without a meaningful change.
5. **Add a new surface only after the loop holds.** New detector categories,
   Codex handoff, and CI reports all reuse the same finding and ledger contract.

### What the checkboxes mean

- **Shipped** means the behavior exists in the repository, has a test or
  fixture where a regression is possible, and is documented for a user.
- **In progress** means the behavior is the current implementation slice; it
  may be incomplete and should not be presented as supported.
- **Pending** means it has a defined reason to wait, a dependency on an
  earlier phase, or a risk that has not been measured yet.
- **Deferred** means it is intentionally outside the current product promise,
  not forgotten work.

### Evidence contract for every future detector

Every finding must answer four things: **what changed, where it changed, why
Tibo raised it, and what the user can decide now**. If Tibo cannot support one
of those answers from local repository evidence, the output must say what is
unknown. This rule applies equally to terminal output, JSON, the ledger, CI
reports, and any future model-assisted explanation.

## Phase 1 — Make one decision reviewable

**User:** a solo engineer has just let an agent change a TypeScript repository.

**Outcome:** `tibo scan` presents a short inbox of structural decisions. Each
finding has a stable ID, evidence, and a keep/reject/later decision that is
remembered in `.tibo/`.

### Shipped

- [x] Define the finding, decision, and ledger schemas.
- [x] Read tracked and untracked working-tree changes locally.
- [x] Detect newly added dependencies and environment-variable references.
- [x] Render interactive terminal decisions and machine-readable JSON.
- [x] Record decisions non-interactively with `tibo decide` for agent skills.
- [x] Persist confirmed decisions in `.tibo/decisions.json` and
  `.tibo/decisions.md`.
- [x] Build and test the CLI with no account, API key, or model call.

### Next slice: dependency evidence

- [x] Show package name, requested version, and the exact manifest diff lines.
- [x] Find every import or usage location introduced by the change, including
  file path and line number where available.
- [x] Search the repository for possible existing dependencies or internal
  utilities using bounded lexical evidence; never claim equivalence.
- [x] Explain why the finding was raised using only the evidence Tibo found;
  never claim that two packages are equivalent without showing the match.
- [x] Include the evidence in terminal output and `scan --json`.
- [x] Preserve line-level evidence in the rendered ledger entry so a later
  session can review the same decision.

### Exit criteria

Given a fixture that adds a mail package, a reviewer can see the package,
version, changed lines, usage sites, and any existing mail utility, then keep
or reject it. A fixture with no resolvable usage must say that evidence is
missing rather than inventing a conclusion.

## Phase 2 — Cover the decisions agents make next

**User:** the same engineer changes persistence, public interfaces, or module
boundaries and needs the same evidence-first review.

**Outcome:** Tibo catches high-impact structural changes while keeping finding
volume low. Every detector produces a concrete location and a reason a human
can verify.

### Schema and persistence changes

- [ ] Detect additions and changes to SQL migrations, ORM schemas, indexes,
  constraints, and seed data.
- [ ] Classify destructive operations such as `DROP`, narrowing a column, or
  removing a constraint separately from additive changes.
- [ ] Point to the migration/schema file and the changed statement; include
  rollback or compatibility evidence only when it exists in the repository.

### Public behavior and module boundaries

- [ ] Detect new or changed exported functions, types, routes, CLI commands,
  event names, and serialized fields.
- [ ] Detect a new module whose role overlaps an existing module using imports,
  filenames, exports, and referenced symbols as evidence.
- [ ] Report the existing owner and the new owner side by side so the user can
  decide whether the split is intentional.

### Change scope and confidence

- [ ] Compare the changed files with the requested Git scope where a base or
  branch is available.
- [ ] Flag unrelated architectural changes separately from required edits.
- [ ] Add severity and confidence fields with documented rules, not a hidden
  model score.

### Exit criteria

Fixtures cover additive and destructive schema changes, public API changes,
intentional module splits, accidental duplicates, and unrelated file edits.
Each fixture has an expected finding set and evidence assertions. False
positive examples are kept beside the detector tests and count against the
phase if they regress.

## Phase 3 — Make the next agent session remember the work

**User:** an engineer opens a fresh Codex session after making decisions in a
previous session.

**Outcome:** the agent can read a compact, trustworthy project state without
the engineer repeating the whole history or sending the repository elsewhere.

### Repository contract

- [ ] Make Tibo's `AGENTS.md` a real reference implementation with commands,
  evidence rules, and examples of accepted and rejected decisions.
- [ ] Define the stable format of `.tibo/decisions.md` and unresolved
  questions so other agents can read it without a Tibo-specific SDK.
- [ ] Document how to review, edit, and intentionally reset a ledger entry.

### Handoff loop

- [ ] Add a concise `tibo summary` for the next session: confirmed decisions,
  unresolved findings, changed scope, and evidence links.
- [ ] Let Codex consume the summary through files already in the repository;
  no hosted memory or mandatory integration.
- [ ] Keep interactive review and CI mode behavior identical at the finding
  and ledger level.
- [ ] Explore problem structuring only when it produces a decision or an
  unresolved question that the ledger can preserve.

### Exit criteria

After one session accepts a dependency and defers a schema change, a fresh
session can run the summary command and understand both decisions with their
evidence. Re-running the scan does not re-ask accepted decisions or silently
erase deferred work.

## Phase 4 — Put the evidence where teams already review code

**User:** a small team wants Tibo findings in pull requests without giving a
hosted service access to its repository.

**Outcome:** Tibo remains useful locally and can publish deterministic,
reviewable output in existing GitHub workflows.

### CI and review surfaces

- [ ] Add a GitHub Action that runs on a pull request with a declared base
  commit and fails only on configured severity or unresolved decisions.
- [ ] Produce Markdown and HTML reports with file/line links, evidence, and
  ledger status; avoid a wall of raw diff text.
- [ ] Support `--json` as the stable integration contract and document version
  compatibility.
- [ ] Add an explicit baseline mode so teams can introduce Tibo without
  approving every pre-existing architectural choice.

### Integrations and optional assistance

- [ ] Add adapters for other coding agents only after the file/ledger contract
  is stable.
- [ ] Consider model-assisted explanations as an opt-in layer that receives
  extracted evidence, never unrestricted repository code.
- [ ] Measure runtime, finding precision, and review time before making claims
  about token or productivity savings.

### Exit criteria

A small repository can run Tibo in CI, review a linked report, approve or
reject a finding locally, and keep the baseline and ledger behavior
deterministic across machines.

## Explicitly deferred

- Hosted repository storage or a Tibo account
- Mandatory API keys or model providers
- A broad project-learning mode
- Autonomous code edits or automatic dependency replacement
- Token-savings claims without measured end-to-end evidence
