import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn Tibo — review agent decisions with evidence",
  description: "Detailed guides for running Tibo, reading findings, using the decision ledger, and handing evidence back to an AI coding agent.",
  alternates: { canonical: "/learn" },
};

const finding = `{
  "id": "8a2a693714dd",
  "kind": "dependency",
  "summary": "dependency added  @supabase/supabase-js ^2.0.0",
  "evidence": [
    { "path": "package.json", "detail": "Added manifest entry" }
  ],
  "confidence": "high",
  "decision": "unreviewed"
}`;

const ledger = `# Tibo decisions

## 8a2a693714dd · dependency
- decision: keep
- subject: @supabase/supabase-js ^2.0.0
- evidence: package.json, src/lib/supabase.ts
- decided: 2026-09-22`;

export default function LearnPage() {
  return <main>
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-7 lg:px-8">
      <a href="/" className="flex items-center gap-2 font-mono text-sm font-semibold tracking-[-0.02em]"><img src="/logo.svg" alt="" className="h-5 w-5" />tibo<span className="text-amber">.</span></a>
      <nav className="flex items-center gap-6 text-sm text-[#aaa69d]"><a href="/" className="transition-colors hover:text-paper">Home</a><a href="/learn#agent" className="transition-colors hover:text-paper">For agents</a><a href="https://github.com/ankanganguly24/tibo" target="_blank" rel="noreferrer" className="transition-colors hover:text-paper">GitHub ↗</a></nav>
    </header>

    <section className="mx-auto max-w-5xl px-6 pb-20 pt-20 lg:px-8 lg:pb-28 lg:pt-28">
      <p className="mb-7 font-mono text-xs uppercase tracking-[0.18em] text-[#8d8a82]">Tibo learn</p>
      <h1 className="max-w-3xl text-5xl font-medium leading-[1.02] tracking-[-0.055em] text-paper sm:text-7xl">A short guide to reviewing what your agent decided.</h1>
      <p className="mt-8 max-w-2xl text-xl leading-8 text-[#aaa69d]">Tibo is a local evidence layer. It does not judge the whole patch. It names structural decisions, shows where they came from, and gives you a durable answer for the next session.</p>
      <div className="mt-9 flex flex-wrap gap-3"><a href="/" className="rounded-md bg-amber px-5 py-3 text-sm font-semibold text-ink">Back to the overview</a><a href="https://github.com/ankanganguly24/tibo/blob/main/README.md" target="_blank" rel="noreferrer" className="rounded-md border border-line px-5 py-3 text-sm font-semibold text-paper">Read the reference docs ↗</a></div>
    </section>

    <section className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-28"><div className="grid gap-10 md:grid-cols-[.65fr_1.35fr] md:gap-16"><div><p className="font-mono text-xs text-amber">01 · First review</p><h2 className="mt-5 text-3xl font-medium tracking-[-0.04em]">Run it after the agent stops.</h2></div><div className="space-y-6 text-lg leading-8 text-[#aaa69d]"><p>Run Tibo from the repository that the agent changed. It reads the Git diff and untracked files on your machine.</p><pre className="overflow-x-auto rounded-md border border-line bg-[#10100f] p-5 font-mono text-sm leading-7 text-[#d4d0c7]"><code>{`npx @goankan/tibo scan
npx @goankan/tibo scan --json`}</code></pre><p>The first command is for a human review. The JSON form is for an agent, a script, or a CI check that needs stable fields.</p></div></div></div></section>

    <section className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-28"><div className="grid gap-10 md:grid-cols-[.65fr_1.35fr] md:gap-16"><div><p className="font-mono text-xs text-amber">02 · Evidence</p><h2 className="mt-5 text-3xl font-medium tracking-[-0.04em]">Read the evidence before the story.</h2></div><div className="space-y-6 text-lg leading-8 text-[#aaa69d]"><p>Each finding has an ID, a kind, a summary, evidence paths, confidence, and a limitation. The limitation tells you what a diff cannot prove.</p><pre className="overflow-x-auto rounded-md border border-line bg-[#10100f] p-5 font-mono text-xs leading-6 text-[#d4d0c7]"><code>{finding}</code></pre><p>A high-confidence manifest addition still does not prove that the dependency is necessary. Tibo keeps that boundary visible.</p></div></div></div></section>

    <section id="agent" className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-28"><div className="grid gap-10 md:grid-cols-[.65fr_1.35fr] md:gap-16"><div><p className="font-mono text-xs text-amber">03 · For an AI agent</p><h2 className="mt-5 text-3xl font-medium tracking-[-0.04em]">Give the agent a contract it can parse.</h2></div><div className="space-y-6 text-lg leading-8 text-[#aaa69d]"><p>Use <code>scan --json</code> when Codex or Claude is reviewing its own work. The host agent may explain the result, but it must not invent evidence or silently approve a finding.</p><pre className="overflow-x-auto rounded-md border border-line bg-[#10100f] p-5 font-mono text-sm leading-7 text-[#d4d0c7]"><code>{`1. Run: npx @goankan/tibo scan --json
2. For each finding: show summary, evidence, confidence, limitation.
3. Ask the human: keep, reject, or later.
4. Record only the explicit answer:
   npx @goankan/tibo decide <id> keep|reject|later
5. Run summary before the next task.`}</code></pre><p>The portable review instructions live in <code>skills/tibo-review/SKILL.md</code>. Copy them into the host skill directory when you want this loop inside Codex or Claude.</p></div></div></div></section>

    <section className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-28"><div className="grid gap-10 md:grid-cols-[.65fr_1.35fr] md:gap-16"><div><p className="font-mono text-xs text-amber">04 · Decisions</p><h2 className="mt-5 text-3xl font-medium tracking-[-0.04em]">Rejecting records a decision. It does not delete code.</h2></div><div className="space-y-6 text-lg leading-8 text-[#aaa69d]"><p>A decision is a durable review result. If you reject a dependency, Tibo records that rejection. It does not edit your source files. A separately approved host agent can make the repair, run tests, and scan again.</p><pre className="overflow-x-auto rounded-md border border-line bg-[#10100f] p-5 font-mono text-sm leading-7 text-[#d4d0c7]"><code>{`npx @goankan/tibo decide 8a2a693714dd reject
npx @goankan/tibo summary --json`}</code></pre><p>The ledger is small on purpose. It is context for the next session, not a second issue tracker.</p></div></div></div></section>

    <section className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-28"><div className="grid gap-10 md:grid-cols-[.65fr_1.35fr] md:gap-16"><div><p className="font-mono text-xs text-amber">05 · The ledger</p><h2 className="mt-5 text-3xl font-medium tracking-[-0.04em]">Make the next session cheaper to start.</h2></div><div className="space-y-6 text-lg leading-8 text-[#aaa69d]"><p>At the start of a later task, ask the agent to read the summary. It sees decisions you already made without replaying every old conversation.</p><pre className="overflow-x-auto rounded-md border border-line bg-[#10100f] p-5 font-mono text-xs leading-6 text-[#d4d0c7]"><code>{ledger}</code></pre><p>Tibo keeps the ledger in <code>.tibo/decisions.json</code> and renders a human-readable Markdown view beside it.</p></div></div></div></section>

    <section className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-28"><div className="max-w-2xl"><p className="font-mono text-xs uppercase tracking-[0.18em] text-[#66635c]">Limits</p><h2 className="mt-4 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Evidence is not intent.</h2><p className="mt-5 text-lg leading-8 text-[#aaa69d]">Tibo can show that a package, environment variable, migration, export, or possible overlap appeared in the change. It cannot prove whether the product decision was correct. That last decision stays with the engineer.</p></div></div></section>

    <footer className="border-t border-line"><div className="mx-auto flex max-w-5xl flex-col gap-5 px-6 py-9 text-sm text-[#77736b] sm:flex-row sm:items-center sm:justify-between lg:px-8"><span className="font-mono">@goankan/tibo · MIT · Built in public</span><div className="flex items-center gap-5"><a href="/" className="transition-colors hover:text-paper">Home</a><a href="https://github.com/ankanganguly24/tibo" target="_blank" rel="noreferrer" className="transition-colors hover:text-paper">GitHub ↗</a></div></div></footer>
  </main>;
}
