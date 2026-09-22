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

Reads the working tree, Git diff, and package manifests. It includes untracked
files while ignoring dependencies and Git internals.

## Detectors

Detectors are narrow and explainable. The current implementation covers added
dependencies and environment-variable references. Schema, module, interface,
and scope detectors are planned work. Each detector returns evidence and
limitations, not a natural-language verdict.

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

The ledger stores a finding's human state and timestamp in
`.tibo/decisions.json` and the reviewable `.tibo/decisions.md` file. A later
run recognizes the stable finding ID and does not ask the same question again.

## Model boundary

The core does not require a model. A future provider may explain a finding or help group related evidence, but provider output must never bypass structural evidence or approval states.
