import { createHash } from "node:crypto";
import type { Evidence, Finding } from "./types.js";

const addedLines = (diff: string) => diff.split("\n").filter((line) => line.startsWith("+") && !line.startsWith("+++"));
const currentFile = (line: string) => line.match(/^\+\+\+ b\/(.+)$/)?.[1];
const stableId = (kind: string, value: string) => createHash("sha1").update(`${kind}:${value}`).digest("hex").slice(0, 12);

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
  let oldPackage: Record<string, unknown> | undefined;
  let newPackage: Record<string, unknown> | undefined;
  try { oldPackage = JSON.parse(oldPackageText); } catch {}
  try { newPackage = JSON.parse(newPackageText); } catch {}
  const oldDeps = { ...(oldPackage?.dependencies as Record<string, string> | undefined), ...(oldPackage?.devDependencies as Record<string, string> | undefined) };
  const newDeps = { ...(newPackage?.dependencies as Record<string, string> | undefined), ...(newPackage?.devDependencies as Record<string, string> | undefined) };
  for (const [name, version] of Object.entries(newDeps)) if (!(name in oldDeps)) findings.push({ id: stableId("dependency", name), kind: "dependency", summary: `dependency added  ${name} ${version}`, evidence: [{ path: "package.json", detail: `Added manifest entry: ${name}` }], confidence: "high", limitation: "Presence in a manifest does not show whether the dependency is necessary or safe." });
  return dedupe(findings);
}

function dedupe(findings: Finding[]): Finding[] { return [...new Map(findings.map((finding) => [finding.id, finding])).values()]; }

export function renderFindings(findings: Finding[]): string {
  if (!findings.length) return "No new structural decisions found.\n";
  return [`${findings.length} unconfirmed decision${findings.length === 1 ? "" : "s"}`, "", ...findings.flatMap((finding, index) => [`  ${index + 1}. ${finding.summary}`, ...finding.evidence.map((evidence) => `     ${evidence.path} · ${evidence.detail}`), ""]), "  [k] keep   [r] reject   [l] later   [w] why", ""].join("\n");
}
