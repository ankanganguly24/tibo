# Tibo repository instructions

## Product boundary

Tibo is a local-first, Codex-first workflow assistant. It compiles compact task context and produces verification and handoff artifacts.

## Engineering rules

- Keep repository analysis local by default.
- Do not add a hosted service or model dependency to the first release.
- Prefer deterministic analysis over model-generated guesses.
- Every feature must define a measurable developer outcome.
- Every generated artifact must reduce context, prevent a mistake, or improve handoff.
- Never mark a task complete only because code was generated.
- Preserve a clear distinction between estimates and measured values.
- Keep the CLI usable without a Tibo account.

## Required workflow

1. Read the relevant files before editing.
2. State the task boundary and acceptance criteria.
3. Make the smallest change that proves the behavior.
4. Run the narrowest meaningful checks.
5. Record what passed, what failed, and what remains uncertain.

## Current scope

The first release includes repository mapping, task packet generation, token estimation, diff checks, verification receipts, and handoff packets. Avoid expanding into hosted collaboration, autonomous orchestration, or broad project management until the local loop is proven.
