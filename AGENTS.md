# Tibo repository instructions

## Product boundary

Tibo is a local-first CLI that surfaces structural decisions made by coding agents and maintains a small, reviewable decision ledger.

Tibo is not a hosted coding agent, a general project manager, a model-powered code reviewer, or an automatic quality certificate.

## Engineering rules

- Keep repository analysis local by default.
- Make the first release usable without an account, API key, or model call.
- Prefer deterministic structural detection over generated guesses.
- Every finding must include evidence and a clear confidence or limitation.
- Keep confirmed, rejected, and deferred decisions distinct.
- Never infer user approval from a passing test or a successful command.
- Do not claim that a dependency, schema, or module is wrong; report that it is new, changed, overlapping, or outside declared scope.
- Keep the ledger small enough that a human and the next agent will actually read it.

## Required workflow

1. Read the relevant files before editing.
2. State the task boundary and acceptance criteria.
3. Make the smallest change that proves the behavior.
4. Run the narrowest meaningful checks.
5. Record what passed, what failed, and what remains uncertain.
6. Update decision fixtures when detection behavior changes.

## Current scope

The first release covers TypeScript and JavaScript repositories, Git diffs, structural findings, interactive keep/reject/later decisions, and a durable ledger. Avoid hosted collaboration, model-dependent detection, broad learning features, and autonomous edits until this loop is reliable.
