import { createHash } from "node:crypto";
import type { Evidence, Finding } from "./types.js";

const addedLines = (diff: string) => diff.split("\n").filter((line) => line.startsWith("+") && !line.startsWith("+++"));
const currentFile = (line: string) => line.match(/^\+\+\+ b\/(.+)$/)?.[1];
const stableId = (kind: string, value: string) => createHash("sha1").update(`${kind}:${value}`).digest("hex").slice(0, 12);

function manifestDependencies(fragment: string): Record<string, string> {
  try {
    const parsed = JSON.parse(fragment) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
    return { ...(parsed.dependencies ?? {}), ...(parsed.devDependencies ?? {}) };
  } catch {
    // A normal npm edit often reformats package.json. The diff sides are then
    // JSON fragments rather than complete documents, so extract dependency
    // entries from the two manifest sections instead of parsing the fragment.
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

export function detect(diff: string): Finding[] {
  const findings: Finding[] = [];
  let oldPackageText = "";
  let newPackageText = "";
  let file = "unknown";
  for (const line of diff.split("\n")) {
    const path = currentFile(line);
    if (path) file = path;
    if (line.startsWith("+") && !line.startsWith("+++")) {
      if (file === "package.json") newPackageText += `${line.slice(1)}\n`;
      const env = line.match(/\bprocess\.env\.([A-Z][A-Z0-9_]*)\b|\bprocess\.env\[['"]([A-Z][A-Z0-9_]*)['"]\]/);
      if (env) {
        const name = env[1] ?? env[2];
        findings.push({ id: stableId("env", `${file}:${name}`), kind: "env", summary: `new environment var   ${name}`, evidence: [{ path: file, detail: `Reads process.env.${name}` }], confidence: "medium", limitation: "A diff cannot prove whether deployment configuration already defines this variable." });
      }
      if (/\b(CREATE|ALTER|DROP)\s+(TABLE|INDEX|COLUMN|TYPE)\b/i.test(line) || /migrations?\//i.test(file)) {
        findings.push({ id: stableId("schema", `${file}:${line.trim()}`), kind: "schema", summary: "schema or persistence change", evidence: [{ path: file, detail: line.slice(1).trim() }], confidence: "high", limitation: "This identifies persistence-related edits but does not assess migration safety or rollback behavior." });
      }
    }
    if (line.startsWith("-") && !line.startsWith("---") && file === "package.json") oldPackageText += `${line.slice(1)}\n`;
  }
  const oldDeps = manifestDependencies(oldPackageText);
  const newDeps = manifestDependencies(newPackageText);
  for (const [name, version] of Object.entries(newDeps)) if (!(name in oldDeps)) findings.push({ id: stableId("dependency", name), kind: "dependency", summary: `dependency added  ${name} ${version}`, evidence: [{ path: "package.json", detail: `Added manifest entry: ${name}` }], confidence: "high", limitation: "Presence in a manifest does not show whether the dependency is necessary or safe." });
  return dedupe(findings);
}

function dedupe(findings: Finding[]): Finding[] { return [...new Map(findings.map((finding) => [finding.id, finding])).values()]; }

export function renderFindings(findings: Finding[]): string {
  if (!findings.length) return "No new structural decisions found.\n";
  return [`${findings.length} unconfirmed decision${findings.length === 1 ? "" : "s"}`, "", ...findings.flatMap((finding, index) => [`  ${index + 1}. ${finding.summary}`, ...finding.evidence.map((evidence) => `     ${evidence.path} · ${evidence.detail}`), ""]), "  [k] keep   [r] reject   [l] later   [w] why", ""].join("\n");
}
