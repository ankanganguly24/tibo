# Tibo product brief

## User

Solo engineers and small teams using coding agents who need to see and remember the architectural decisions those agents make.

## Problem

Coding agents can add dependencies, configuration, persistence fields, modules, and integration boundaries without making the choice visible. These changes may be locally reasonable and still create long-term drift.

## Core job

Read a Git diff, surface structural decisions with evidence, let a human keep, reject, or defer them, and preserve confirmed decisions for the next session.

## Product promise

Tibo makes hidden change visible without adding a hosted service or requiring a model call.

## Primary workflow

~~~text
diff
  -> structural detection
  -> evidence-backed finding
  -> keep / reject / later
  -> decision ledger
  -> next-session context
~~~

## Success criteria

- A developer can understand every finding without opening a second dashboard.
- Every finding links to changed files or repository evidence.
- A decision can be confirmed once and reused later.
- Detection is deterministic for the same repository and diff.
- The tool remains useful when no model, network, or account is available.
- The ledger becomes more focused as decisions are resolved.

## Failure conditions

- Tibo labels an implementation as wrong when it only has evidence that it is new.
- Tibo hides a relevant dependency, schema, or scope change.
- Tibo reports a heuristic as certainty.
- The ledger becomes a second README nobody reads.
- The tool creates more review work than it removes.
- Tibo claims model-quality or security guarantees it cannot measure.

## Deferred ideas

Problem structuring, project-grounded learning, richer context packets, and model-assisted explanations may return after the decision ledger is useful. They are not part of the first product promise.
