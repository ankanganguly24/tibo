import { createHash } from "node:crypto";
import type { Evidence, Finding } from "./types.js";

type AddedLine = { path: string; line: number; text: string };

const currentFile = (line: string) => line.match(/^\+\+\+ b\/(.+)$/)?.[1];
const stableId = (kind: string, value: string) => createHash("sha1").update(`${kind}:${value}`).digest("hex").slice(0, 12);

function manifestDependencies(fragment: string): Record<string, string> {
  try {
    const parsed = JSON.parse(fragment) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
    return { ...(parsed.dependencies ?? {}), ...(parsed.devDependencies ?? {}) };
  } catch {
    const dependencies: Record<string, string> = {};
    for (const match of fragment.matchAll(/\"(?:dependencies|devDependencies)\"\s*:\s*\{([^}]*)\}/g)) {
      for (const entry of match[1].matchAll(/\"([^\"]+)\"\s*:\s*\"([^\"]+)\"/g)) dependencies[entry[1]] = entry[2];
    }
    let section: "dependencies" | "devDependencies" | undefined;
    for (const line of fragment.split("\n")) {
      const header = line.match(/^\s{2}\"(dependencies|devDependencies)\"\s*:\s*\{/);
      if (header) {
        section = header[1] as "dependencies" | "devDependencies";
        continue;
      }
      if (section && /^\s{2}\},?\s*$/.test(line)) {
        section = undefined;
        continue;
      }
      if (section) {
        const entry = line.match(/^\s{4}\"([^\"]+)\"\s*:\s*\"([^\"]+)\"\s*,?\s*$/);
        if (entry) dependencies[entry[1]] = entry[2];
      }
    }
    return dependencies;
  }
}

function addedLines(diff: string): AddedLine[] {
  const lines: AddedLine[] = [];
  let file = "unknown";
  let newLine = 0;
  for (const raw of diff.split("\n")) {
    const path = currentFile(raw);
    if (path) {
      file = path;
      newLine = 0;
      continue;
    }
    const hunk = raw.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunk) {
      newLine = Number(hunk[1]);
      continue;
    }
    if (raw.startsWith("+") && !raw.startsWith("+++")) {
      lines.push({ path: file, line: newLine || 1, text: raw.slice(1) });
      if (newLine) newLine += 1;
      continue;
    }
    if (!raw.startsWith("-") && !raw.startsWith("\\") && newLine) newLine += 1;
  }
  return lines;
}

function packageUsage(name: string, lines: AddedLine[]): AddedLine[] {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(?:from\\s*[\\\"']${escaped}(?:/[^\\\"']*)?[\\\"']|require\\s*\\(\\s*[\\\"']${escaped}(?:/[^\\\"']*)?[\\\"']\\s*\\)|import\\s*\\(\\s*[\\\"']${escaped}(?:/[^\\\"']*)?[\\\"']\\s*\\)|import\\s*[\\\"']${escaped}(?:/[^\\\"']*)?[\\\"'])`);
  return lines.filter((line) => line.path !== "package.json" && pattern.test(line.text));
}

export function detect(diff: string): Finding[] {
  const findings: Finding[] = [];
  const lines = addedLines(diff);
  let oldPackageText = "";
  let newPackageText = "";
  let file = "unknown";
  for (const line of diff.split("\n")) {
    const path = currentFile(line);
    if (path) file = path;
    if (line.startsWith("+") && !line.startsWith("+++")) {
      if (file === "package.json") newPackageText += `${line.slice(1)}\n`;
    }
    if (line.startsWith("-") && !line.startsWith("---") && file === "package.json") oldPackageText += `${line.slice(1)}\n`;
  }
  for (const added of lines) {
    const env = added.text.match(/\bprocess\.env\.([A-Z][A-Z0-9_]*)\b|\bprocess\.env\[['"]([A-Z][A-Z0-9_]*)['"]\]/);
    if (env) {
      const name = env[1] ?? env[2];
      findings.push({ id: stableId("env", `${added.path}:${name}`), kind: "env", summary: `new environment var   ${name}`, evidence: [{ path: added.path, line: added.line, detail: `Reads process.env.${name}` }], confidence: "medium", limitation: "A diff cannot prove whether deployment configuration already defines this variable." });
    }
    if (/\b(CREATE|ALTER|DROP)\s+(TABLE|INDEX|COLUMN|TYPE)\b/i.test(added.text) || /migrations?\//i.test(added.path)) {
      findings.push({ id: stableId("schema", `${added.path}:${added.line}:${added.text.trim()}`), kind: "schema", summary: "schema or persistence change", evidence: [{ path: added.path, line: added.line, detail: added.text.trim() }], confidence: "high", limitation: "This identifies persistence-related edits but does not assess migration safety or rollback behavior." });
    }
  }
  const oldDeps = manifestDependencies(oldPackageText);
  const newDeps = manifestDependencies(newPackageText);
  // Context lines in a unified diff carry a leading space, so a reformatted
  // manifest is not always valid JSON on either side. Recover direct additions
  // from the added manifest lines as a final, conservative fallback.
  for (const line of lines.filter((item) => item.path === "package.json")) {
    for (const entry of line.text.matchAll(/"([^"]+)"\s*:\s*"([^"]+)"/g)) {
      if (!newDeps[entry[1]] && !["name", "version", "description", "private", "type", "license"].includes(entry[1])) newDeps[entry[1]] = entry[2];
    }
  }
  for (const [name, version] of Object.entries(newDeps)) {
    if (name in oldDeps) continue;
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const manifestLine = lines.find((line) => line.path === "package.json" && new RegExp(`\"${escapedName}\"\\s*:`).test(line.text));
    const usage = packageUsage(name, lines);
    const evidence: Evidence[] = [{ path: "package.json", ...(manifestLine ? { line: manifestLine.line } : {}), detail: `Added manifest entry: ${name} ${version}` }];
    for (const used of usage.slice(0, 5)) evidence.push({ path: used.path, line: used.line, detail: `Imports or loads ${name}` });
    const limitation = usage.length
      ? "Presence in a manifest does not show whether the dependency is necessary or safe."
      : "No import or require for this package appears in the added lines; the diff may be incomplete or usage may be indirect.";
    findings.push({ id: stableId("dependency", name), kind: "dependency", summary: `dependency added  ${name} ${version}`, evidence, confidence: "high", limitation });
  }
  return dedupe(findings);
}

function dedupe(findings: Finding[]): Finding[] { return [...new Map(findings.map((finding) => [finding.id, finding])).values()]; }

export function renderFindings(findings: Finding[]): string {
  if (!findings.length) return "No new structural decisions found.\n";
  return [`${findings.length} unconfirmed decision${findings.length === 1 ? "" : "s"}`, "", ...findings.flatMap((finding, index) => [`  ${index + 1}. ${finding.summary}`, ...finding.evidence.map((evidence) => `     ${evidence.path}${evidence.line ? `:${evidence.line}` : ""} · ${evidence.detail}`), ""]), "  [k] keep   [r] reject   [l] later   [w] why", ""].join("\n");
}
