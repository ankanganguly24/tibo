import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tiborun.vercel.app";

export const metadata: Metadata = {
  title: "Learn Tibo | Local review for coding-agent changes",
  description: "Learn how to install Tibo, review agent changes, read evidence, record decisions, use the Codex and Claude skill, and keep a project ledger.",
  keywords: ["Tibo", "coding agent review", "Codex skill", "Claude Code skill", "local code review", "AI coding workflow", "decision ledger"],
  alternates: { canonical: "/learn" },
  openGraph: {
    type: "article",
    url: `${siteUrl}/learn`,
    siteName: "Tibo",
    title: "Learn Tibo | Review coding-agent decisions with evidence",
    description: "A practical guide to scanning a diff, reviewing findings, recording decisions, and handing trustworthy context to the next AI coding session.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Learn Tibo | Review coding-agent decisions with evidence",
    description: "Install Tibo, review agent changes, and keep a compact decision ledger.",
    images: ["/og.png"],
  },
};

const detectors = [
  { name: "Dependency", what: "New manifest entries, requested versions, added import or load sites, and possible repository matches.", example: "@supabase/supabase-js ^2.0.0" },
  { name: "Environment", what: "New process.env reads using dot or bracket notation, with the file that reads the value.", example: "NEXT_PUBLIC_SUPABASE_URL" },
  { name: "Schema", what: "SQL and migration changes, including a high-severity marker for potentially destructive operations.", example: "DROP COLUMN email" },
  { name: "Interface", what: "New or changed exported functions, classes, constants, types, and interfaces.", example: "export type Session = ..." },
  { name: "Module", what: "Possible overlap for a newly added file using bounded filename and symbol evidence.", example: "src/utils/mail.ts" },
] as const;

const commands = [
  ["Install and scan", "npx @goankan/tibo scan", "Run from the repository the agent changed."],
  ["Machine output", "npx @goankan/tibo scan --json", "Give stable findings to an agent, script, or CI job."],
  ["Record a decision", "npx @goankan/tibo decide <id> keep|reject|later", "Store only the human's explicit choice."],
  ["Show project memory", "npx @goankan/tibo summary --json", "Give the next agent the ledger and unresolved findings."],
] as const;

const jsonFinding = `{
  "id": "8a2a693714dd",
  "kind": "dependency",
  "summary": "dependency added  @supabase/supabase-js ^2.0.0",
  "evidence": [
    {
      "path": "package.json",
      "detail": "Added manifest entry: @supabase/supabase-js"
    },
    {
      "path": "src/lib/supabase.ts",
      "line": 2,
      "detail": "Added import"
    }
  ],
  "confidence": "high",
  "limitation": "Presence in a manifest does not prove necessity or safety.",
  "decision": "unreviewed"
}`;

const ledgerExample = `# Tibo decisions

## 8a2a693714dd · dependency
- decision: keep
- subject: @supabase/supabase-js ^2.0.0
- evidence: package.json:12, src/lib/supabase.ts:2
- decided: 2026-09-22`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Learn Tibo: review coding-agent changes with evidence",
  description: "A practical guide to Tibo's local scanner, decision ledger, and AI-agent workflow.",
  url: `${siteUrl}/learn`,
  author: { "@type": "Person", name: "Ankan Ganguly" },
  publisher: { "@type": "Organization", name: "Tibo", url: siteUrl },
  about: ["AI coding agents", "local code review", "architecture decisions"],
};

function CodeBlock({ children }: { children: string }) {
  return <pre className="overflow-x-auto rounded-md border border-line bg-[#10100f] p-5 font-mono text-[13px] leading-7 text-[#d4d0c7]"><code>{children}</code></pre>;
}

export default function LearnPage() {
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-7 lg:px-8">
      <a href="/" className="flex items-center gap-2 font-mono text-sm font-semibold tracking-[-0.02em]"><img src="/logo.svg" alt="" className="h-5 w-5" />tibo<span className="text-amber">.</span></a>
      <nav className="flex items-center gap-5 text-sm text-[#aaa69d] sm:gap-6"><a href="/" className="transition-colors hover:text-paper">Home</a><a href="#quickstart" className="hidden transition-colors hover:text-paper sm:inline">Start here</a><a href="#agent" className="hidden transition-colors hover:text-paper sm:inline">For agents</a><a href="https://github.com/ankanganguly24/tibo" target="_blank" rel="noreferrer" className="transition-colors hover:text-paper">GitHub ↗</a></nav>
    </header>

    <section className="mx-auto max-w-5xl px-6 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
      <p className="mb-7 font-mono text-xs uppercase tracking-[0.18em] text-[#8d8a82]">Tibo documentation · 10 minute read</p>
      <h1 className="max-w-4xl text-5xl font-medium leading-[1.02] tracking-[-0.055em] text-paper sm:text-7xl">Review what your coding agent decided.</h1>
      <p className="mt-8 max-w-3xl text-xl leading-8 text-[#aaa69d]">This is the complete practical guide to Tibo. Start with the quick scan, learn how to read evidence, then add the review skill to Codex or Claude so every agent task leaves a clear decision trail.</p>
      <div className="mt-9 flex flex-wrap gap-3"><a href="#quickstart" className="rounded-md bg-amber px-5 py-3 text-sm font-semibold text-ink">Start the guide</a><a href="https://github.com/ankanganguly24/tibo" target="_blank" rel="noreferrer" className="rounded-md border border-line px-5 py-3 text-sm font-semibold text-paper">View source on GitHub ↗</a></div>
      <div className="mt-12 grid gap-3 text-sm text-[#aaa69d] sm:grid-cols-3"><a href="#mental-model" className="rounded-md border border-line p-4 transition-colors hover:border-[#5a574f]"><span className="font-mono text-xs text-amber">01</span><span className="mt-3 block text-paper">Understand the loop</span></a><a href="#evidence" className="rounded-md border border-line p-4 transition-colors hover:border-[#5a574f]"><span className="font-mono text-xs text-amber">02</span><span className="mt-3 block text-paper">Read a finding</span></a><a href="#agent" className="rounded-md border border-line p-4 transition-colors hover:border-[#5a574f]"><span className="font-mono text-xs text-amber">03</span><span className="mt-3 block text-paper">Connect an agent</span></a></div>
    </section>

    <section id="quickstart" className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-28"><div className="grid gap-12 md:grid-cols-[.7fr_1.3fr] md:gap-16"><div><p className="font-mono text-xs text-amber">01 · Quick start</p><h2 className="mt-5 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Use Tibo in the repository your agent just changed.</h2><p className="mt-5 text-base leading-7 text-[#aaa69d]">Tibo is a CLI. It does not need an account, API key, hosted workspace, or model call. It reads tracked and untracked working-tree changes locally.</p></div><div className="space-y-7"><CodeBlock>{`# From your changed repository
npx @goankan/tibo scan

# Ask for stable JSON instead
npx @goankan/tibo scan --json`}</CodeBlock><div className="grid gap-4 sm:grid-cols-3"><div className="border-t border-[#4b4944] pt-4"><p className="font-mono text-xs text-amber">Input</p><p className="mt-2 text-sm leading-6 text-[#aaa69d]">Git diff plus untracked files</p></div><div className="border-t border-[#4b4944] pt-4"><p className="font-mono text-xs text-amber">Output</p><p className="mt-2 text-sm leading-6 text-[#aaa69d]">Evidence-backed findings</p></div><div className="border-t border-[#4b4944] pt-4"><p className="font-mono text-xs text-amber">State</p><p className="mt-2 text-sm leading-6 text-[#aaa69d]">A local decision ledger</p></div></div></div></div></div></section>

    <section id="mental-model" className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-28"><div className="max-w-2xl"><p className="font-mono text-xs text-amber">02 · Mental model</p><h2 className="mt-5 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Tibo is a checkpoint after the agent, before the decision disappears.</h2><p className="mt-5 text-lg leading-8 text-[#aaa69d]">The core is deliberately boring and explainable. A Git change goes through narrow structural detectors. Each detector returns evidence, confidence, and a limitation. You decide. The ledger gives the next session the answer.</p></div><div className="mt-12 overflow-x-auto rounded-md border border-line bg-[#10100f] p-6 font-mono text-sm leading-8 text-[#d4d0c7] sm:p-8"><code>agent changes files{`\n`}    ↓{`\n`}Git working tree{`\n`}    ↓{`\n`}diff and line normalizer{`\n`}    ↓{`\n`}structural detectors{`\n`}    ↓{`\n`}evidence-backed findings{`\n`}    ↓{`\n`}you choose keep / reject / later{`\n`}    ↓{`\n`}.tibo/decisions.json + decisions.md{`\n`}    ↓{`\n`}next session runs tibo summary</code></div><p className="mt-6 max-w-2xl text-base leading-7 text-[#aaa69d]">The host agent can explain returned evidence and make an explicitly approved repair. Tibo itself never edits source files and never silently approves a finding.</p></div></section>

    <section id="features" className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-28"><div className="max-w-2xl"><p className="font-mono text-xs text-amber">03 · Supported changes</p><h2 className="mt-5 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">What Tibo can detect today</h2><p className="mt-5 text-lg leading-8 text-[#aaa69d]">The first release focuses on TypeScript and JavaScript repositories. The output is intentionally smaller than a generic linter.</p></div><div className="mt-12 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2">{detectors.map((detector, index) => <article key={detector.name} className="bg-ink p-6 sm:p-8"><div className="flex items-center justify-between"><p className="font-mono text-xs text-amber">0{index + 1}</p><code className="text-xs text-[#77736b]">{detector.example}</code></div><h3 className="mt-8 text-xl font-medium">{detector.name}</h3><p className="mt-3 text-base leading-7 text-[#aaa69d]">{detector.what}</p></article>)}</div><p className="mt-6 text-sm leading-6 text-[#77736b]">Possible matches are lexical evidence, not proof that two packages or modules are equivalent. Tibo says what it found and what it cannot know from a diff.</p></div></section>

    <section id="evidence" className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-28"><div className="grid gap-12 md:grid-cols-[.7fr_1.3fr] md:gap-16"><div><p className="font-mono text-xs text-amber">04 · Read a finding</p><h2 className="mt-5 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Evidence first. Story second.</h2><p className="mt-5 text-base leading-7 text-[#aaa69d]">Every finding answers four questions: what changed, where it changed, why Tibo raised it, and what remains unknown.</p></div><div className="space-y-6"><CodeBlock>{jsonFinding}</CodeBlock><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-md border border-line p-5"><p className="font-mono text-xs text-amber">Evidence</p><p className="mt-3 text-sm leading-6 text-[#aaa69d]">Paths and lines you can open and verify.</p></div><div className="rounded-md border border-line p-5"><p className="font-mono text-xs text-amber">Limitation</p><p className="mt-3 text-sm leading-6 text-[#aaa69d]">The boundary between a signal and a conclusion.</p></div></div></div></div></div></section>

    <section id="before-after" className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-28"><div className="max-w-2xl"><p className="font-mono text-xs text-amber">05 · Before and after</p><h2 className="mt-5 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">A review becomes useful when it names the decision.</h2><p className="mt-5 text-lg leading-8 text-[#aaa69d]">A package name alone creates suspicion. Evidence gives an engineer something concrete to approve, reject, or defer.</p></div><div className="mt-12 grid gap-5 md:grid-cols-2"><article className="rounded-md border border-[#4b2929] bg-[#15100f] p-6 sm:p-8"><p className="font-mono text-xs uppercase tracking-[0.16em] text-[#d67e72]">Before · vague review</p><blockquote className="mt-8 text-xl leading-8 text-[#ded0c8]">“The agent added Supabase. Is that okay?”</blockquote><ul className="mt-8 space-y-3 text-sm leading-6 text-[#aaa69d]"><li>• No version</li><li>• No import location</li><li>• No indication of existing alternatives</li><li>• No durable answer for the next session</li></ul></article><article className="rounded-md border border-[#4b4a2f] bg-[#11120e] p-6 sm:p-8"><p className="font-mono text-xs uppercase tracking-[0.16em] text-amber">After · Tibo review</p><blockquote className="mt-8 text-xl leading-8 text-[#eee8dc]">“@supabase/supabase-js ^2.0.0 was added to package.json and imported in src/lib/supabase.ts:2. Keep, reject, or later?”</blockquote><ul className="mt-8 space-y-3 text-sm leading-6 text-[#aaa69d]"><li>• Exact package and requested version</li><li>• Evidence paths and line numbers</li><li>• Confidence and limitation</li><li>• Decision stored in the ledger</li></ul></article></div></div></section>

    <section id="workflow" className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-28"><div className="max-w-2xl"><p className="font-mono text-xs text-amber">06 · Everyday workflow</p><h2 className="mt-5 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Four commands cover the loop.</h2></div><div className="mt-12 overflow-hidden rounded-md border border-line"><div className="divide-y divide-line">{commands.map(([title, command, description]) => <div key={title} className="grid gap-3 bg-[#10100f] p-5 sm:grid-cols-[1fr_1.3fr_1.2fr] sm:items-center sm:p-6"><p className="text-sm font-medium text-paper">{title}</p><code className="overflow-x-auto text-xs text-amber sm:text-sm">{command}</code><p className="text-sm leading-6 text-[#aaa69d]">{description}</p></div>)}</div></div><p className="mt-6 text-sm leading-6 text-[#77736b]">If you are working from a checkout instead of npm, build with <code>npm run build</code> and use <code>node dist/index.js</code> in place of <code>npx @goankan/tibo</code>.</p></div></section>

    <section id="ledger" className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-28"><div className="grid gap-12 md:grid-cols-[.7fr_1.3fr] md:gap-16"><div><p className="font-mono text-xs text-amber">07 · Decisions and ledger</p><h2 className="mt-5 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Rejecting records intent. It does not delete code.</h2><p className="mt-5 text-base leading-7 text-[#aaa69d]">Keep means you accepted the decision. Reject means you do not want to approve it. Later leaves the question visible. None of these commands edits the repository.</p></div><div className="space-y-6"><CodeBlock>{`npx @goankan/tibo decide 8a2a693714dd reject
npx @goankan/tibo summary --json`}</CodeBlock><CodeBlock>{ledgerExample}</CodeBlock><p className="text-base leading-7 text-[#aaa69d]">The JSON ledger is stored at <code>.tibo/decisions.json</code>. The Markdown view at <code>.tibo/decisions.md</code> is for humans and future agent sessions. Stable finding IDs stop the same decision from being asked again without a meaningful change.</p></div></div></div></section>

    <section id="agent" className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-28"><div className="max-w-2xl"><p className="font-mono text-xs text-amber">08 · Codex and Claude</p><h2 className="mt-5 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Give an AI agent a safe review contract.</h2><p className="mt-5 text-lg leading-8 text-[#aaa69d]">Tibo includes a portable skill at <code>skills/tibo-review/SKILL.md</code>. Copy it into Codex or Claude Code. The host agent explains returned evidence and asks for your decision; Tibo remains the source of truth.</p></div><div className="mt-12 grid gap-5 md:grid-cols-2"><div><p className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-[#66635c]">Codex</p><CodeBlock>{`mkdir -p ~/.codex/skills/tibo-review
cp -R skills/tibo-review/* \\
  ~/.codex/skills/tibo-review/`}</CodeBlock></div><div><p className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-[#66635c]">Claude Code</p><CodeBlock>{`mkdir -p .claude/skills/tibo-review
cp -R skills/tibo-review/* \\
  .claude/skills/tibo-review/`}</CodeBlock></div></div><div className="mt-8 rounded-md border border-line bg-[#10100f] p-6 sm:p-8"><p className="font-mono text-xs text-amber">The host-agent contract</p><ol className="mt-5 space-y-4 text-base leading-7 text-[#aaa69d]"><li><span className="mr-3 font-mono text-paper">1.</span>Run <code>tibo scan --json</code> after the agent changes files.</li><li><span className="mr-3 font-mono text-paper">2.</span>Show each summary, evidence path, confidence, and limitation.</li><li><span className="mr-3 font-mono text-paper">3.</span>Ask the human for keep, reject, or later. Never choose silently.</li><li><span className="mr-3 font-mono text-paper">4.</span>Record the explicit answer with <code>tibo decide</code>.</li><li><span className="mr-3 font-mono text-paper">5.</span>Only after separate approval, make a narrow repair, test it, and scan again.</li></ol></div></div></section>

    <section id="best-practices" className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-28"><div className="max-w-2xl"><p className="font-mono text-xs text-amber">09 · Best practices</p><h2 className="mt-5 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Keep the review small enough to trust.</h2></div><div className="mt-12 grid gap-5 md:grid-cols-2"><article className="border-t border-[#4b4944] pt-5"><h3 className="text-xl font-medium">Run at the boundary</h3><p className="mt-3 text-base leading-7 text-[#aaa69d]">Scan when an agent says a task is complete and before you commit. The context is fresh and the diff is still easy to understand.</p></article><article className="border-t border-[#4b4944] pt-5"><h3 className="text-xl font-medium">Treat evidence as a prompt</h3><p className="mt-3 text-base leading-7 text-[#aaa69d]">Open the referenced file and line. A finding tells you where to look; it does not replace engineering judgment.</p></article><article className="border-t border-[#4b4944] pt-5"><h3 className="text-xl font-medium">Use later instead of guessing</h3><p className="mt-3 text-base leading-7 text-[#aaa69d]">If you need product context, defer the finding. Do not accept a choice just to clear the inbox.</p></article><article className="border-t border-[#4b4944] pt-5"><h3 className="text-xl font-medium">Keep the ledger reviewable</h3><p className="mt-3 text-base leading-7 text-[#aaa69d]">Record the reason in the surrounding project context when a choice matters. Reset an entry intentionally instead of deleting history casually.</p></article></div></div></section>

    <section id="limits" className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-28"><div className="grid gap-12 md:grid-cols-[.7fr_1.3fr] md:gap-16"><div><p className="font-mono text-xs text-amber">10 · Boundaries</p><h2 className="mt-5 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">What Tibo does not claim.</h2></div><ul className="space-y-4 text-lg leading-8 text-[#aaa69d]"><li>It does not read your repository with a model.</li><li>It does not prove that a dependency is necessary or safe.</li><li>It does not understand product intent from a diff alone.</li><li>It does not replace tests, code review, or architectural judgment.</li><li>It does not edit files when you reject a finding.</li><li>It does not send repository contents to a hosted service.</li></ul></div></div></section>

    <section id="roadmap" className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-28"><div className="max-w-2xl"><p className="font-mono text-xs text-amber">11 · Roadmap</p><h2 className="mt-5 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">What comes next is evidence, not more noise.</h2><p className="mt-5 text-lg leading-8 text-[#aaa69d]">The roadmap is intentionally staged. Next are richer route, event, serialized-field, module-graph, and rollback detectors; real Codex and Claude validation; team review surfaces; and an optional evidence-only explanation provider.</p></div><div className="mt-10 flex flex-wrap gap-3 text-sm"><a href="https://github.com/ankanganguly24/tibo/blob/main/docs/roadmap.md" target="_blank" rel="noreferrer" className="rounded-md border border-line px-4 py-3 text-paper transition-colors hover:border-[#5a574f]">Read the full roadmap ↗</a><a href="https://github.com/ankanganguly24/tibo/blob/main/docs/timeline.md" target="_blank" rel="noreferrer" className="rounded-md border border-line px-4 py-3 text-paper transition-colors hover:border-[#5a574f]">View the timeline ↗</a><a href="https://github.com/ankanganguly24/tibo/blob/main/docs/architecture.md" target="_blank" rel="noreferrer" className="rounded-md border border-line px-4 py-3 text-paper transition-colors hover:border-[#5a574f]">Read architecture ↗</a></div></div></section>

    <section id="faq" className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-28"><div className="max-w-2xl"><p className="font-mono text-xs uppercase tracking-[0.18em] text-[#66635c]">FAQ</p><h2 className="mt-4 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Common questions</h2></div><div className="mt-10 divide-y divide-line border-y border-line">{[
        ["Does Tibo need OpenAI, OpenRouter, or another model?", "No. Detection is local and deterministic. The Codex or Claude skill can explain the returned evidence, but Tibo does not require a model call."],
        ["Will reject remove the code?", "No. Reject only records your decision. A host agent can make a repair only after you separately approve that repair plan."],
        ["Does it work with untracked files?", "Yes. Tibo includes untracked files in the local scan so a newly created file can be reviewed before it is staged."],
        ["What languages are supported?", "The first release focuses on TypeScript and JavaScript repositories and their common manifests, environment reads, migrations, and exports."],
        ["Where does the history live?", "In .tibo/decisions.json and .tibo/decisions.md inside the repository. There is no hosted account or required dashboard."],
      ].map(([question, answer]) => <details key={question} className="group py-5"><summary className="cursor-pointer list-none pr-8 text-lg font-medium text-paper marker:content-none">{question}<span className="float-right font-mono text-amber transition-transform group-open:rotate-45">+</span></summary><p className="mt-4 max-w-3xl text-base leading-7 text-[#aaa69d]">{answer}</p></details>)}</div></div></section>
+
    <footer className="border-t border-line"><div className="mx-auto flex max-w-5xl flex-col gap-5 px-6 py-9 text-sm text-[#77736b] sm:flex-row sm:items-center sm:justify-between lg:px-8"><span className="font-mono">@goankan/tibo · MIT · Built in public</span><div className="flex flex-wrap gap-5"><a href="/" className="transition-colors hover:text-paper">Home</a><a href="#quickstart" className="transition-colors hover:text-paper">Start here</a><a href="https://github.com/ankanganguly24/tibo/blob/main/docs/integrations.md" target="_blank" rel="noreferrer" className="transition-colors hover:text-paper">Integration docs ↗</a></div></div></footer>
  </main>;
}
