# Architecture

Tibo is a local CLI with four small layers:

~~~text
Git repository
  -> scanner
  -> structural detectors
  -> finding normalizer
  -> interactive ledger writer
~~~

## Scanner

Reads the working tree, Git diff, package manifests, configuration references, and repository instructions. It should avoid reading unrelated file contents until a detector needs them.

## Detectors

Detectors are narrow and explainable. Initial detectors cover dependencies, environment variables, schema or persistence changes, module overlap, public interfaces, and scope drift. Each detector returns evidence and limitations, not a natural-language verdict.

## Findings

Findings have stable IDs so the same decision can be recognized across runs:

~~~ts
type Finding = {
  id: string;
  kind: 'dependency' | 'env' | 'schema' | 'module' | 'interface' | 'scope';
  summary: string;
  evidence: Array<{ path: string; line?: number; detail: string }>;
  confidence: 'high' | 'medium' | 'low';
  limitation: string;
};
~~~

## Ledger

The ledger stores a finding's human state and reason. It is append-oriented and reviewable in Git. A later run can mark a finding resolved without deleting the history of the decision.

## Model boundary

The core does not require a model. A future provider may explain a finding or help group related evidence, but provider output must never bypass structural evidence or approval states.
