# Architecture

Tibo has a deterministic local core and a thin host-agent skill:

~~~text
Git repository
  -> working-tree scanner
  -> diff and line normalizer
  -> structural detectors
  -> evidence-backed findings
  -> terminal / JSON output
  -> human decision
  -> .tibo ledger
  -> optional host-agent remediation
  -> rescan and test

Fresh agent session
  -> tibo summary
  -> current ledger + unresolved findings

Codex or Claude skill
  -> runs scan --json
  -> explains only returned evidence
  -> runs decide <id> <decision>
~~~

## Scanner

The scanner reads tracked and untracked working-tree changes through Git. It
ignores `.git`, dependency directories, and generated output. It preserves file
paths and line numbers, including synthetic diffs for untracked files.

For dependency findings, the scanner also reads a bounded set of local
JavaScript, TypeScript, and JSON files to find possible related packages or
internal utilities. These are lexical matches and are never treated as proof of
equivalence.

## Detectors

Current detectors are narrow and explainable:

- **Dependency:** newly added manifest entries, requested versions, added
  import or load sites, and possible repository matches.
- **Environment:** new `process.env` reads using dot or bracket notation.
- **Schema:** SQL and migration-path changes, ORM model/index/constraint
  declarations, and seed or fixture writes, with a high-severity marker for
  potentially destructive operations and nearby rollback evidence when it exists.
- **Interface:** new or changed exported TypeScript and JavaScript symbols.
- **Module:** low-confidence overlap for newly added files using filename
  tokens, direct relative imports, shared exports, and referenced symbols.

Routes, CLI commands, event names, serialized fields, and requested-scope
analysis remain planned. Each detector returns evidence, confidence, severity,
and a limitation instead of a natural-language verdict.

### Detector policy

The policy is explicit and lives in the detector code. It is not a model score:

| Detector | Confidence | Default severity | Why |
| --- | --- | --- | --- |
| Dependency | high | medium | The manifest addition is directly observable; necessity is unknown. |
| Environment | medium | medium | The new read is observable; deployment configuration is outside the diff. |
| Schema | high | medium | The persistence edit is observable; destructive operations become high severity. |
| Interface | medium | medium | The export change is observable; consumer compatibility is unknown. |
| Module | low | low | Filename, import, and symbol overlap are review prompts, not proof. |

Every JSON finding includes both `confidence` and `severity`. A future policy
change must update the table, the schema, and detector tests together.

## Findings

Findings have stable IDs so the same decision can be recognized across runs:

~~~ts
type Finding = {
  id: string;
  kind: 'dependency' | 'env' | 'schema' | 'interface' | 'module';
  summary: string;
  evidence: Array<{ path: string; line?: number; detail: string }>;
  confidence: 'high' | 'medium' | 'low';
  severity?: 'low' | 'medium' | 'high';
  limitation: string;
  decision?: 'unreviewed' | 'keep' | 'reject' | 'later';
};
~~~

The machine-readable contract is defined in
[`schemas/finding.schema.json`](../schemas/finding.schema.json). `tibo summary
--json` provides the session-level contract for ledger decisions and unresolved
findings.

## Ledger and decisions

The ledger stores a finding's human state and timestamp in
`.tibo/decisions.json` and the reviewable `.tibo/decisions.md` file. Evidence
paths and line numbers are retained. `tibo decide <id> <keep|reject|later>`
lets agent skills record a decision without taking ownership away from the
engineer. A later scan recognizes the stable finding ID and does not ask the
same question again; deferred findings remain in the ledger for a future
summary.

Ledger entries are safe to maintain by hand when needed: edit the matching
entry in `.tibo/decisions.json`, then regenerate the Markdown view by recording
the next decision. To intentionally revisit a decision, remove that entry from
the JSON ledger and run a fresh scan; do not change source code to reset review
state. The stable format is an array of finding-shaped entries with a required
decision and ISO timestamp.

## Agent skill boundary

The portable `skills/tibo-review/SKILL.md` is the workflow adapter for Codex and
Claude Code. It runs the local CLI, presents the JSON findings, asks the human
for a decision, and records it. It does not duplicate detectors or send source
code to a hosted model. If the user approves remediation, the host agent makes
the edit and Tibo verifies the next diff; the core never edits source files.

## Model boundary

The core does not require a model. A future provider may explain a finding or
help group related evidence, but provider output must never bypass structural
evidence or approval states.
