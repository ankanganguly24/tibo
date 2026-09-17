# Tibo product brief

## User

Solo engineers and vibe coders whose repositories have outgrown one-shot prompting.

## Core job

Help a developer structure a problem, understand the relevant project, and make a safe change with only the context needed for that step.

## Product modes

### Problem mode

Turn an ambiguous request into a problem brief containing outcomes, facts, assumptions, constraints, options, risks, and the smallest useful next decision.

### Learn mode

Explain a concept from the repository’s real code, link it to files and decisions, and end with a small check or experiment so the developer can verify understanding.

### Build mode

Turn an accepted problem into a compact task packet, support the coding-agent session, and produce verification and handoff receipts.

## Primary outcome

Reduce irrelevant context and repeated explanation while helping the developer move from uncertainty to a verified action.

## Secondary outcomes

- Detect drift between project guidance and code.
- Make unresolved decisions visible.
- Improve session-to-session handoff.
- Create a reproducible record of verification.
- Make project-specific learning faster and more grounded.

## Product test

For a representative problem-to-change flow, Tibo should reduce the estimated context sent to the agent while maintaining or improving task completion, verification, and developer understanding.

## Failure conditions

- Tibo selects the wrong files and hides an important constraint.
- Tibo reports token savings that do not reflect actual input.
- Tibo treats passing tests as proof of product correctness.
- Tibo creates more process overhead than it removes.
- Tibo silently guesses a missing architectural decision.
- Tibo answers a learning question with generic prose instead of project evidence.
- Tibo expands vague problem statements into unnecessary project plans.
