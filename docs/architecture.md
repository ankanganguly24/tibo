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
- **Schema:** SQL and migration-path changes, with a high-severity marker for
  potentially destructive operations.

Public interfaces, module overlap, richer schema safety, and requested-scope
analysis are planned. Each detector returns evidence, confidence, and a
limitation instead of a natural-language verdict.

## Findings

Findings have stable IDs so the same decision can be recognized across runs:

~~~ts
type Finding = {
  id: string;
  kind: 'dependency' | 'env' | 'schema' | 'interface';
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
