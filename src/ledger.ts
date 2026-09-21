import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { Decision, Finding, LedgerEntry } from "./types.js";

const dir = (cwd: string) => join(cwd, ".tibo");
const jsonPath = (cwd: string) => join(dir(cwd), "decisions.json");
const markdownPath = (cwd: string) => join(dir(cwd), "decisions.md");

export function loadLedger(cwd: string): LedgerEntry[] {
  try { return JSON.parse(readFileSync(jsonPath(cwd), "utf8")) as LedgerEntry[]; } catch { return []; }
}

export function applyLedger(findings: Finding[], entries: LedgerEntry[]): Finding[] {
  const states = new Map(entries.map((entry) => [entry.id, entry]));
  return findings.map((finding) => ({ ...finding, decision: states.get(finding.id)?.decision ?? "unreviewed" }));
}

export function recordDecision(cwd: string, finding: Finding, decision: Exclude<Decision, "unreviewed">): LedgerEntry {
  const entries = loadLedger(cwd).filter((entry) => entry.id !== finding.id);
  const entry: LedgerEntry = { ...finding, decision, decidedAt: new Date().toISOString() };
  mkdirSync(dir(cwd), { recursive: true });
  writeFileSync(jsonPath(cwd), JSON.stringify([...entries, entry], null, 2) + "\n");
  writeFileSync(markdownPath(cwd), renderLedger([...entries, entry]));
  return entry;
}

function renderLedger(entries: LedgerEntry[]): string {
  const lines = ["# Tibo decision ledger", "", "This file records decisions confirmed while reviewing agent-authored diffs.", ""];
  for (const entry of entries) lines.push(`## ${entry.summary}`, `- Decision: **${entry.decision}**`, `- Evidence: ${entry.evidence.map((evidence) => `\`${evidence.path}\` — ${evidence.detail}`).join("; ")}`, `- Finding: \`${entry.id}\``, `- Recorded: ${entry.decidedAt}`, "");
  return lines.join("\n");
}

export function ledgerExists(cwd: string): boolean { return existsSync(jsonPath(cwd)); }
