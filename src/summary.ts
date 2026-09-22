import type { Decision, Finding, LedgerEntry } from "./types.js";

export type Summary = {
  decisions: {
    keep: LedgerEntry[];
    reject: LedgerEntry[];
    later: LedgerEntry[];
  };
  unresolved: Finding[];
};

export function summarize(findings: Finding[], entries: LedgerEntry[]): Summary {
  const decisions = { keep: [], reject: [], later: [] } as Summary["decisions"];
  for (const entry of entries) decisions[entry.decision].push(entry);
  return {
    decisions,
    unresolved: findings.filter((finding) => (finding.decision ?? "unreviewed") === "unreviewed"),
  };
}

export function renderSummary(summary: Summary): string {
  const lines = ["Tibo project summary", ""];
  const sections: Array<[Exclude<Decision, "unreviewed">, string]> = [["keep", "Kept"], ["reject", "Rejected"], ["later", "Deferred"]];
  for (const [decision, label] of sections) {
    lines.push(`${label}: ${summary.decisions[decision].length}`);
    for (const entry of summary.decisions[decision]) lines.push(`  ${entry.id} · ${entry.summary}`);
    lines.push("");
  }
  lines.push(`Unreviewed: ${summary.unresolved.length}`);
  for (const finding of summary.unresolved) lines.push(`  ${finding.id} · ${finding.summary}`);
  lines.push("");
  return lines.join("\n");
}
