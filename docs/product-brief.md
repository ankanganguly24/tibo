# Tibo product brief

## User

Solo engineers and vibe coders whose repositories have outgrown one-shot prompting.

## Core job

Give a coding agent only the context needed for one task, then produce evidence that the resulting change stayed within scope and passed the required checks.

## Primary outcome

Reduce irrelevant context and repeated explanation while preserving developer control.

## Secondary outcomes

- Detect drift between project guidance and code.
- Make unresolved decisions visible.
- Improve session-to-session handoff.
- Create a reproducible record of verification.

## Product test

For a representative task, Tibo should reduce the estimated context sent to the agent while maintaining or improving task completion and verification outcomes.

## Failure conditions

- Tibo selects the wrong files and hides an important constraint.
- Tibo reports token savings that do not reflect actual input.
- Tibo treats passing tests as proof of product correctness.
- Tibo creates more process overhead than it removes.
- Tibo silently guesses a missing architectural decision.
