# Tibo

## The smallest useful context for your coding agent.

Tibo is a local-first, Codex-first workflow assistant for solo engineers and vibe coders.

It helps a coding agent answer four questions before and after a change:

1. **What is the smallest part of this repository I need to understand?**
2. **What decisions and constraints must I preserve?**
3. **Did the change stay within the requested scope?**
4. **What evidence proves that the work is ready to hand off?**

Tibo exists because AI coding gets expensive and unreliable in a predictable way: the repository grows, the context gets noisy, the agent starts guessing, and every new session repeats the same explanation.

Tibo turns a task into a compact, inspectable work packet and turns the resulting change into a verification receipt.

```text
task
  -> repository map
  -> relevant context packet
  -> Codex implementation
  -> scoped diff and checks
  -> verification receipt
  -> handoff packet
```

## Who this is for

Tibo is for:

- Solo engineers building products with Codex
- Vibe coders whose projects have become too large for ad hoc prompting
- Small teams sharing work between coding-agent sessions
- Developers who want speed without losing ownership of decisions

Tibo is not a hosted coding agent, an IDE replacement, or a project-management system. It works beside the tools you already use and keeps the important state in your repository.

## The problem

AI coding agents are good at producing code. They are less reliable at preserving the invisible context around that code:

- Existing architecture and patterns
- Decisions made in previous sessions
- Commands that actually verify the project
- Files that are in scope versus files that are merely nearby
- Constraints that should stop an implementation from improvising
- The difference between “the command passed” and “the feature is correct”

Most teams respond by adding more instructions, more Markdown, and longer prompts. That can create a second problem: context itself becomes a source of noise, cost, and drift.

Tibo treats context as an engineering resource. It should be selected, measured, refreshed, and verified.

## What Tibo does

### 1. Builds a repository map

Tibo inspects the repository locally and records useful structure:

- Languages and frameworks
- Package scripts and test commands
- Application entry points
- Existing configuration
- Important domains and modules
- Current Git state
- Project instructions and decisions

It does not upload the repository to a Tibo server.

### 2. Compiles a task packet

Given a task such as:

> Add password reset using the existing authentication patterns. Do not change the database model without asking.

Tibo creates a small packet containing:

- Goal and acceptance criteria
- Relevant files and why they matter
- Existing patterns to follow
- Commands to run
- Known constraints
- Open decisions
- Estimated context size

Example:

```text
Tibo task packet

Selected files:       14
Repository files:     400
Estimated context:    5,240 tokens
Excluded from packet: 386 files

Found pattern:        src/auth/tokens.ts
Required checks:      npm test, npm run typecheck
Open decision:        reuse token table or create a new model
```

### 3. Keeps Codex inside the task boundary

Tibo provides repository instructions and a Codex workflow for using the packet, recording assumptions, and stopping when a real decision is missing.

The agent remains responsible for reasoning and implementation. Tibo is responsible for making the work boundary visible and measurable.

### 4. Produces a verification receipt

After the agent changes the repository, Tibo checks:

- Acceptance criteria
- Changed-file scope
- Required commands
- Test and typecheck results
- Unresolved assumptions
- Potential context or architecture drift

The output is evidence, not a claim that the agent “did a good job.”

### 5. Creates a handoff packet

The next session or engineer should not need to reconstruct the entire conversation. Tibo records:

- What changed
- Why it changed
- Which decisions were made
- Which checks passed
- What remains uncertain
- The next safe action

## The first user experience

```bash
tibo init
tibo scope "add password reset using the existing authentication patterns"
tibo verify
tibo handoff
```

The first release is deliberately local and deterministic. It should work without a paid model API, hosted database, or Tibo account.

## Why Codex first

Tibo is designed around Codex’s repository workflow:

- `AGENTS.md` provides project-level instructions
- A Tibo skill explains the scope → context → implementation → verification loop
- A local CLI performs deterministic repository analysis
- Generated packets and receipts remain reviewable files
- A future MCP adapter can expose repository-map and receipt queries interactively

The CLI is the source of truth. A native Codex plugin or MCP server can come later without changing the repository artifacts.

## Context efficiency

Tibo’s primary metric is context reduction:

```text
context reduction =
1 - selected context tokens / baseline context tokens
```

The benchmark must also report:

- Task completion rate
- Relevant-file precision
- Unrelated-file change rate
- Verification pass rate
- Handoff recovery time
- Estimated context and output tokens

Tibo will publish fixture versions, task descriptions, assumptions, and limitations with every benchmark. It will not claim savings from an unreproducible screenshot.

## Example workflow

```text
1. A developer asks for a feature.
2. Tibo maps the repository and identifies likely entry points.
3. Tibo creates a compact task packet.
4. Codex reads the packet and implements the task.
5. Tibo inspects the diff and runs the required checks.
6. Tibo reports what passed, what changed unexpectedly, and what remains open.
7. Tibo writes a handoff packet for the next session.
```

## Design principles

1. **Local by default.** Repository content stays on the developer’s machine.
2. **Small context beats large context.** More files do not automatically mean more understanding.
3. **The agent can reason; the tool must measure.** Tibo should not pretend a prompt is an enforcement mechanism.
4. **Evidence beats confidence.** A completed command and a checked criterion are different things.
5. **Decisions are first-class artifacts.** Unresolved choices should be visible instead of silently guessed.
6. **The repository is the handoff boundary.** Important state should survive a new session and a new engineer.
7. **No magic completion.** Tibo never marks work complete only because code was generated.

## Status

This repository is the product and engineering baseline. The implementation is intentionally starting with a narrow vertical slice:

- Repository scanner
- Context packet compiler
- Token estimate and benchmark fixtures
- Git diff scope checks
- Verification receipt
- Handoff packet
- Codex project instructions

The first target is a useful 15-day release with the quality bar of a much larger project: clear contracts, deterministic fixtures, meaningful tests, and honest limitations.

## Non-goals

- Replacing Codex, Claude Code, Cursor, or an IDE
- Building another general-purpose agent runtime
- Uploading repositories to a hosted Tibo service
- Generating enormous project documentation for its own sake
- Claiming that context files alone solve software quality
- Making autonomous changes without a visible diff and verification step

## Roadmap

### Phase 1 — Local proof

- Repository scanner
- Task packet format
- File relevance rules
- Token estimation
- CLI output

### Phase 2 — Verification

- Acceptance criteria
- Git diff scope checks
- Test and typecheck execution
- Verification receipts
- Failure fixtures

### Phase 3 — Codex workflow

- `AGENTS.md` bootstrap
- Tibo Codex skill
- Session handoff
- Decision and assumption tracking

### Phase 4 — Quality and adoption

- Golden repository benchmark
- Context reduction report
- Drift detection
- GitHub Actions
- Cross-agent adapters
- Optional MCP integration

## Contributing

Tibo is built in public. Contributions should make the workflow more useful, more measurable, or more trustworthy.

Before proposing a feature, explain:

- Which developer pain it solves
- Why the pain cannot be handled by existing repository instructions
- What deterministic evidence will show that it works
- How it affects context size, correctness, or handoff

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).
