# Contributing to Tibo

Tibo is a small tool for making AI-assisted coding more focused and more accountable. A contribution should improve one of three outcomes:

- Less irrelevant context
- Better evidence that a change is correct
- Easier continuation by the next session or engineer

## Before opening a change

Please describe:

1. The developer problem.
2. The current workaround.
3. The proposed behavior.
4. The measurable outcome.
5. The failure case the change must handle.

## Quality bar

- Work locally by default.
- Do not add a model or hosted-service dependency without a deterministic fallback.
- Keep generated files concise and reviewable.
- Add a fixture for behavior that affects context selection or verification.
- Report limitations and false positives.
- Do not claim token savings without explaining how they were estimated.

## Pull requests

Every pull request should include:

- Problem and user outcome
- Scope and non-goals
- Example input and output
- Tests or fixture changes
- Context-size impact
- Security or privacy impact
- Documentation updates
