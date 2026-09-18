# Contributing to Tibo

Tibo is a small local CLI that makes coding-agent decisions visible and
reviewable. Contributions should improve detection, evidence, approval, or
session-to-session continuity.

## Before opening a change

Please describe:

1. The developer problem.
2. The structural signal or decision it exposes.
3. The proposed behavior.
4. The evidence a user will see.
5. The false-positive or false-negative case the change must handle.

## Quality bar

- Work locally by default.
- Do not add a model or hosted-service dependency to the core loop.
- Keep findings concise, stable, and linked to repository evidence.
- Add a decision fixture for new detection behavior.
- Report limitations and false positives.
- Do not claim intent, correctness, or token savings that Tibo cannot measure.
- Preserve explicit keep, reject, and later states.

## Pull requests

Every pull request should include:

- Problem and user outcome
- Scope and non-goals
- Example input and output
- Tests or fixture changes
- False-positive and false-negative considerations
- Security or privacy impact
- Documentation updates
