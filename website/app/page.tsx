"use client";

import { useState } from "react";

const terminal = `$ tibo

3 unconfirmed decisions

  1. dependency added      nodemailer ^6.9
     src/email/send.ts · not present before this change

  2. new environment var   SMTP_FROM
     src/email/config.ts · read at startup, no default

  3. parallel module       src/utils/mail.ts
     duplicates the role of src/email/send.ts

  [k] keep   [r] reject   [l] later   [w] why`;

function CopyCommand() {
  const [copied, setCopied] = useState(false);
  async function copy() { await navigator.clipboard.writeText("npx tibo"); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
  return <button onClick={copy} className="group flex items-center gap-3 rounded-md border border-line bg-[#11110f] px-4 py-3 font-mono text-sm text-paper transition-colors hover:border-[#5a574f]" aria-label="Copy npx tibo to clipboard"><span className="text-amber">$</span><span>npx tibo</span><span className="ml-2 border-l border-line pl-3 text-xs text-[#8d8a82] group-hover:text-paper">{copied ? "copied" : "copy"}</span></button>;
}

const steps = [
  ["01", "It reads the diff", "Structural detection, locally. New dependencies, schema changes, env vars, new exports, duplicate modules. No model, no embeddings, nothing uploaded."],
  ["02", "You clear the inbox", "Keep, reject, or defer. Three keys. A decision confirmed once is never raised again."],
  ["03", "The ledger remembers", <>Confirmed decisions land in <code>.tibo/decisions.md</code>, with the evidence. The next session reads that instead of asking you to explain the project again.</>],
] as const;

export default function Home() {
  return <main>
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-7 lg:px-8">
      <a href="#top" className="flex items-center gap-2 font-mono text-sm font-semibold tracking-[-0.02em]"><img src="/logo.svg" alt="" className="h-5 w-5" />tibo<span className="text-amber">.</span></a>
      <nav className="flex items-center gap-6 text-sm text-[#aaa69d]"><a href="#how" className="transition-colors hover:text-paper">How it works</a><a href="https://github.com/ankanganguly24/tibo" target="_blank" rel="noreferrer" className="transition-colors hover:text-paper">GitHub ↗</a></nav>
    </header>

    <section id="top" className="mx-auto max-w-5xl px-6 pb-20 pt-20 lg:px-8 lg:pb-28 lg:pt-32">
      <div className="fade-in max-w-3xl"><p className="mb-7 font-mono text-xs uppercase tracking-[0.18em] text-[#8d8a82]">Open source · local first · MIT</p><h1 className="max-w-3xl text-5xl font-medium leading-[1.02] tracking-[-0.055em] text-paper sm:text-7xl">Your coding agent makes decisions you never approved.</h1><p className="mt-5 text-3xl tracking-[-0.04em] text-[#aaa69d] sm:text-4xl">Tibo lists them.</p><p className="mt-8 max-w-xl text-lg leading-8 text-[#aaa69d]">Reads your diff. Names what the agent decided on its own. Keeps a ledger of what you confirm. Runs locally — no account, no API key, no model call.</p><div className="mt-9 flex flex-wrap items-center gap-3"><a href="https://github.com/ankanganguly24/tibo" target="_blank" rel="noreferrer" className="rounded-md bg-amber px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-[#ffc34e]">Star on GitHub <span aria-hidden>↗</span></a><a href="https://github.com/ankanganguly24/tibo#readme" target="_blank" rel="noreferrer" className="rounded-md border border-line px-5 py-3 text-sm font-semibold text-paper transition-colors hover:border-[#5a574f]">Read the docs</a></div></div>
      <div className="mt-16 overflow-hidden rounded-lg border border-line bg-[#10100f] shadow-2xl shadow-black/20 lg:mt-20"><div className="flex items-center gap-2 border-b border-line px-5 py-3"><span className="h-2 w-2 rounded-full bg-[#4b4944]"/><span className="h-2 w-2 rounded-full bg-[#4b4944]"/><span className="h-2 w-2 rounded-full bg-[#4b4944]"/><span className="ml-3 font-mono text-[11px] text-[#66635c]">tibo · decision inbox</span></div><pre className="min-w-[650px] overflow-x-auto p-6 font-mono text-[12px] leading-[1.75] text-[#d4d0c7] sm:p-9 sm:text-[13px]"><code>{terminal.split("\n").map((line, i) => <span key={i} className={line.includes("dependency added") || line.includes("new environment var") || line.includes("parallel module") || line.includes("[k]") ? "text-amber" : ""}>{line}{"\n"}</span>)}</code></pre></div><div className="mt-5 flex items-center gap-3"><CopyCommand/><span className="text-sm text-[#66635c]">Works with the repo you already have.</span></div>
    </section>

    <section className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-24 lg:px-8 lg:py-32"><div className="max-w-2xl"><p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-[#66635c]">The problem</p><h2 className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl">The failure you don&apos;t see</h2><div className="mt-8 space-y-6 text-lg leading-8 text-[#aaa69d]"><p>The failure everyone knows is the agent writing bad code. You see it, you fix it.</p><p>The failure that costs you is the agent writing reasonable code that quietly decides something. A library you didn&apos;t pick. A column you didn&apos;t design. A second way of doing something you already had one way of doing. Each one passes review. They only become a problem in aggregate, weeks later, when nobody remembers who decided what.</p></div></div></div></section>

    <section className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-24 lg:px-8 lg:py-28"><p className="mb-10 font-mono text-xs uppercase tracking-[0.18em] text-[#66635c]">Evidence</p><div className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3"><article className="bg-ink p-6 sm:p-8"><p className="text-3xl font-medium tracking-[-0.05em] text-amber">33,707</p><p className="mt-6 text-base leading-7 text-paper">Unplanned conceptual changes are the primary driver of agent interaction failure.</p><p className="mt-8 font-mono text-[11px] leading-5 text-[#77736b]">Study of agent-authored pull requests, MSR 2026</p></article><article className="bg-ink p-6 sm:p-8"><p className="text-3xl font-medium tracking-[-0.05em] text-amber">+54%</p><p className="mt-6 text-base leading-7 text-paper">bugs per developer</p><p className="mt-8 font-mono text-[11px] leading-5 text-[#77736b]">Faros AI 2026 telemetry, 22,000 developers</p></article><article className="bg-ink p-6 sm:p-8"><p className="text-3xl font-medium tracking-[-0.05em] text-amber">+861%</p><p className="mt-6 text-base leading-7 text-paper">code churn</p><p className="mt-8 font-mono text-[11px] leading-5 text-[#77736b]">Faros AI 2026 telemetry, 22,000 developers</p></article></div></div></section>

    <section id="how" className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-24 lg:px-8 lg:py-32"><p className="mb-10 font-mono text-xs uppercase tracking-[0.18em] text-[#66635c]">How it works</p><div className="grid gap-12 md:grid-cols-3 md:gap-8">{steps.map(([number,title,body]) => <article key={number} className="border-t border-[#4b4944] pt-5"><p className="font-mono text-xs text-amber">{number}</p><h3 className="mt-8 text-xl font-medium tracking-[-0.03em]">{title}</h3><p className="mt-4 text-base leading-7 text-[#aaa69d]">{body}</p></article>)}</div></div></section>

    <section className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-24 lg:px-8 lg:py-28"><div className="max-w-2xl"><p className="mb-8 font-mono text-xs uppercase tracking-[0.18em] text-[#66635c]">What it doesn&apos;t do</p><ul className="space-y-4 text-xl tracking-[-0.02em] text-[#aaa69d]"><li>Doesn&apos;t read your code with a model.</li><li>Doesn&apos;t need tests.</li><li>Doesn&apos;t need you to adopt a workflow.</li><li>Doesn&apos;t tell you a change is good.</li><li>Never says &quot;done.&quot;</li></ul></div></div></section>

    <section id="learn" className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-24 lg:px-8 lg:py-28"><div className="max-w-2xl"><p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-[#66635c]">Learn</p><h2 className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Small guides for working with coding agents.</h2><p className="mt-5 text-lg leading-8 text-[#aaa69d]">Practical notes for keeping an agent inside the work you actually meant to do.</p></div><div className="mt-12 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3"><a href="https://github.com/ankanganguly24/tibo#readme" target="_blank" rel="noreferrer" className="group bg-ink p-6 transition-colors hover:bg-[#11110f] sm:p-8"><p className="font-mono text-xs text-[#77736b]">Guide 01</p><h3 className="mt-10 text-xl font-medium tracking-[-0.03em] group-hover:text-amber">Coming soon</h3><p className="mt-3 text-sm leading-6 text-[#aaa69d]">A guide to be published here.</p></a><a href="https://github.com/ankanganguly24/tibo#readme" target="_blank" rel="noreferrer" className="group bg-ink p-6 transition-colors hover:bg-[#11110f] sm:p-8"><p className="font-mono text-xs text-[#77736b]">Guide 02</p><h3 className="mt-10 text-xl font-medium tracking-[-0.03em] group-hover:text-amber">Coming soon</h3><p className="mt-3 text-sm leading-6 text-[#aaa69d]">A guide to be published here.</p></a><a href="https://github.com/ankanganguly24/tibo#readme" target="_blank" rel="noreferrer" className="group bg-ink p-6 transition-colors hover:bg-[#11110f] sm:p-8"><p className="font-mono text-xs text-[#77736b]">Guide 03</p><h3 className="mt-10 text-xl font-medium tracking-[-0.03em] group-hover:text-amber">Coming soon</h3><p className="mt-3 text-sm leading-6 text-[#aaa69d]">A guide to be published here.</p></a></div></div></section>

    <footer className="border-t border-line"><div className="mx-auto flex max-w-5xl flex-col gap-5 px-6 py-9 text-sm text-[#77736b] sm:flex-row sm:items-center sm:justify-between lg:px-8"><span className="font-mono">npx tibo · MIT · Built in public</span><div className="flex items-center gap-5"><a href="#learn" className="transition-colors hover:text-paper">Learn</a><a href="https://github.com/ankanganguly24/tibo" target="_blank" rel="noreferrer" className="transition-colors hover:text-paper">GitHub ↗</a></div></div></footer>
  </main>;
}
