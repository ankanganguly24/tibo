# Tibo

**Your coding agent makes decisions you never approved.**
Tibo lists them.

> **Trust, but observe.**

~~~text
$ tibo

3 unconfirmed decisions

  1. dependency added      nodemailer ^6.9
     src/email/send.ts · not present before this change

  2. new environment var   SMTP_FROM
     src/email/config.ts · read at startup, no default

  3. parallel module       src/utils/mail.ts
     duplicates the role of src/email/send.ts

  [k] keep  [r] reject  [l] later  [w] why
~~~

Nothing leaves your machine. No account, API key, or model call is required.

~~~bash
npx @goankan/tibo
~~~

## Try the first slice

~~~bash
npm install
npm run build
node dist/index.js scan
~~~

Run it from a Git repository with a working-tree change. Tibo also includes
untracked files in the local scan, so a newly created file is visible before
it is staged. Use `node dist/index.js scan --json` for machine-readable output. Use `node dist/index.js summary --json` to give a fresh agent the project decision history.

## Why

The failure everyone notices is the agent writing bad code. You see it and fix it.

The expensive failure is the agent writing reasonable code that quietly makes a decision: a library you did not choose, a schema change you did not discuss, a new environment variable, or a second implementation of something the project already has. Each choice can pass review. The risk appears later, when nobody remembers who made the decision or whether it was intentional.

This problem is becoming more visible as agent-written code increases. A 2026 study of roughly 33,000 agent-authored pull requests found recurring rejection patterns including agent misalignment, duplicate work, and unwanted feature implementations ([study](https://arxiv.org/abs/2601.15195)). Faros AI's 2026 telemetry across 22,000 developers and 4,000 teams reported higher throughput alongside increases in bugs, incidents, review time, and code churn ([report](https://www.faros.ai/research/ai-acceleration-whiplash)).

Tibo addresses the decision layer. It reads a Git diff, detects structural signals, names the decisions it can support with evidence, and asks you to keep, reject, or defer each one. Confirmed decisions become a small ledger that the next session can read without making you explain the project again.

## What Tibo detects today

- Newly added dependencies, versions, added import locations, and possible repository matches
- New environment variables and configuration reads
- Basic schema and migration changes, including destructive-change warnings
- New or changed exported functions, classes, constants, types, and interfaces
- Possible overlap between newly added modules and existing files
- Decisions you explicitly confirm, reject, or defer

Planned detectors will cover public interfaces, module overlap, and change
scope after the evidence contract is proven. Tibo reports evidence and
uncertainty; it does not pretend that a heuristic is proof of intent.

## What Tibo does not do

- It does not read your code with a model.
- It does not require tests, although tests are useful evidence when they exist.
- It does not tell you that a change is good. It tells you what changed and what you agreed to.
- It does not replace code review or architectural judgment.
- It does not require a new workflow, account, dashboard, or hosted service.
- It never says “done” merely because a command passed.

## Who it is for

- Solo engineers using Codex or another coding agent
- Vibe coders whose projects have outgrown one-shot prompting
- Small teams that need decisions to survive between sessions
- Maintainers who want a quieter, more useful review surface

## The ledger

The ledger is Tibo's durable artifact. It records only decisions that matter to future work:

~~~yaml
- id: dependency.mailer
  decision: keep
  subject: nodemailer@^6.9
  evidence:
    - src/email/send.ts
  reason: "Chosen for the existing SMTP adapter"
  confirmed_at: 2026-09-18
~~~

A fresh agent session can run `tibo summary` to see kept, rejected, deferred, and unresolved work. The ledger should get smaller and more useful over time, not become another project manual.

## Scope

Tibo starts with TypeScript and JavaScript repositories. The first release is a small CLI with deterministic output, a reviewable ledger, and Git-aware diff analysis. Codex integration is first-class through repository artifacts such as AGENTS.md; other agents can consume the same files.

## Status

Pre-1.0 and honest about it. The local scanner, evidence-rich findings,
decision ledger, portable agent-review skill, published npm package, and
fresh-agent handoff are in place. The next major capabilities are richer route
and scope detectors plus team review surfaces. See the
[roadmap](docs/roadmap.md).

## Documentation

- [Architecture](docs/architecture.md)
- [Roadmap](docs/roadmap.md)
- [Timeline](docs/timeline.md)
- [Agent integrations](docs/integrations.md)
- [Contributing](CONTRIBUTING.md)

## Website

The landing page lives in [`website/`](website/). It is a separate Next.js
App Router app inside this repository so the project can use Tibo to build and
document Tibo. It is deployed at [tiborun.vercel.app](https://tiborun.vercel.app).
Deploy the `website/` directory as the Vercel project root and set
`NEXT_PUBLIC_SITE_URL=https://tiborun.vercel.app` in the production environment.

~~~bash
cd website
npm install
npm run dev
~~~

## Agent integrations

Tibo includes a portable review skill for Codex and Claude Code. It runs the
local CLI, presents evidence from `scan --json`, and records explicit decisions
with `tibo decide`. Install it from [`skills/tibo-review/`](skills/tibo-review/)
and see the [integration guide](docs/integrations.md).

The skill also supports optional remediation: after you reject a finding and
approve a repair plan, the host agent makes the smallest change, runs tests, and
runs Tibo again. Tibo never edits files by itself.

## Development direction

The first implementation should prove one narrow loop:

~~~text
git diff
  -> structural signals
  -> evidence-backed decision list
  -> keep / reject / later
  -> durable ledger
  -> next-session context
~~~

No hosted service is needed for that loop. A future integration may add richer language assistance, but the ledger must remain understandable and usable without a model.

## License

MIT. See [LICENSE](LICENSE).
