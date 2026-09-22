import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import type { Evidence, Finding, Severity } from "./types.js";

type AddedLine = { path: string; line: number; text: string };

const currentFile = (line: string) => line.match(/^\+\+\+ b\/(.+)$/)?.[1];
const stableId = (kind: string, value: string) => createHash("sha1").update(`${kind}:${value}`).digest("hex").slice(0, 12);

const ignoredDirectories = new Set([".git", ".tibo", "node_modules", "dist", ".next", "coverage"]);
const capabilityStopWords = new Set(["js", "ts", "node", "core", "lib", "sdk", "api", "client", "plugin"]);
const detectorPolicy = {
  dependency: { confidence: "high" as const, severity: "medium" as Severity },
  env: { confidence: "medium" as const, severity: "medium" as Severity },
  schema: { confidence: "high" as const, severity: "medium" as Severity },
  interface: { confidence: "medium" as const, severity: "medium" as Severity },
  module: { confidence: "low" as const, severity: "low" as Severity },
};

function capabilityTokens(name: string): string[] {
  return [...new Set(name.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length >= 3 && !capabilityStopWords.has(token)))];
}

function repositoryFiles(root: string): string[] {
  const files: string[] = [];
  const visit = (directory: string) => {
    if (files.length >= 2000) return;
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (ignoredDirectories.has(entry.name)) continue;
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile() && /\.(?:js|jsx|ts|tsx|json|mjs|cjs|sql|prisma)$/.test(entry.name)) files.push(path);
    }
  };
  try { visit(root); } catch { return []; }
  return files;
}

function newFilePaths(diff: string): Set<string> {
  const paths = new Set<string>();
  let oldMissing = false;
  for (const line of diff.split("\n")) {
    if (line.startsWith("--- /dev/null")) oldMissing = true;
    else if (line.startsWith("--- a/")) oldMissing = false;
    const path = currentFile(line);
    if (path && oldMissing) paths.add(path);
  }
  return paths;
}

function moduleTokens(path: string): string[] {
  const base = path.split("/").pop()?.replace(/\.(?:jsx?|tsx?|mjs|cjs)$/, "") ?? "";
  return capabilityTokens(base).filter((token) => !["index", "test", "spec", "page", "route"].includes(token));
}

function importedModuleRefs(text: string): string[] {
  const refs = new Set<string>();
  for (const match of text.matchAll(/\bfrom\s*["']([^"']+)["']|\bimport\s*["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']\s*\)|\brequire\s*\(\s*["']([^"']+)["']\s*\)/g)) {
    const ref = match[1] ?? match[2] ?? match[3] ?? match[4];
    if (ref) refs.add(ref);
  }
  return [...refs];
}

function importedSymbols(text: string): string[] {
  const names = new Set<string>();
  for (const match of text.matchAll(/\bimport\s*\{([^}]+)\}/g)) {
    for (const name of match[1].split(",")) {
      const normalized = name.trim().split(/\s+as\s+/i)[0]?.trim();
      if (normalized && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(normalized)) names.add(normalized);
    }
  }
  for (const match of text.matchAll(/\b(?:new|extends|implements)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g)) names.add(match[1]);
  return [...names];
}

function resolveModuleReference(fromPath: string, reference: string, candidates: Set<string>): string | undefined {
  if (!reference.startsWith(".")) return undefined;
  const directory = fromPath.includes("/") ? fromPath.slice(0, fromPath.lastIndexOf("/")) : ".";
  const base = join(directory, reference).replace(/\\/g, "/");
  const options = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.jsx`, `${base}.mjs`, `${base}/index.ts`, `${base}/index.tsx`, `${base}/index.js`];
  return options.find((option) => candidates.has(option));
}

function moduleOverlapEvidence(path: string, cwd: string, changedPaths: Set<string>, addedText: string): Evidence[] {
  const tokens = moduleTokens(path);
  if (!tokens.length) return [];
  const newExports = exportNames(addedText);
  const newImports = importedModuleRefs(addedText);
  const newImportedSymbols = importedSymbols(addedText);
  const reExportedImported = newImportedSymbols.filter((name) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\bexport\\s*\\{[^}]*\\b${escaped}\\b[^}]*\\}`).test(addedText);
  });
  const evidence: Evidence[] = [];
  const files = repositoryFiles(cwd);
  const candidates = new Set(files.map((absolute) => relative(cwd, absolute) || absolute));
  for (const absolute of files) {
    const candidate = relative(cwd, absolute) || absolute;
    if (changedPaths.has(candidate) || candidate === path) continue;
    const overlap = moduleTokens(candidate).filter((token) => tokens.includes(token));
    let candidateContent = "";
    try { candidateContent = readFileSync(absolute, "utf8"); } catch { continue; }
    const candidateExports = exportNames(candidateContent);
    const sharedSymbols = [...new Set([...newExports, ...newImportedSymbols])].filter((name) => candidateExports.includes(name));
    const directImport = newImports.map((reference) => resolveModuleReference(path, reference, candidates)).find((resolved) => resolved === candidate);
    if (directImport && (overlap.length || reExportedImported.length)) evidence.push({ path: candidate, detail: "Possible overlapping module; new file imports this existing module and shares a module signal" });
    else if (sharedSymbols.length && (!directImport || reExportedImported.length)) evidence.push({ path: candidate, detail: `Possible overlapping module; shares exported symbol: ${sharedSymbols[0]}` });
    else if (overlap.length) evidence.push({ path: candidate, detail: `Possible overlapping module; matched filename token: ${overlap[0]}` });
    if (evidence.length >= 5) break;
  }
  return evidence;
}

function schemaSignal(path: string, text: string): { detail: string; destructive: boolean } | undefined {
  if (path === ".tibo" || path.startsWith(".tibo/")) return undefined;
  const schemaFile = /(?:^|\/)(?:schema|schemas|models|entities|migrations?)(?:\/|\.|$)/i.test(path)
    || /\.(?:sql|prisma|drizzle|schema)$/i.test(path);
  const seedFile = /(?:^|\/)(?:seeds?|fixtures?)(?:\/|$)|(?:^|\/)(?:seed|fixtures?)\.(?:[cm]?[jt]sx?)$/i.test(path);
  const destructive = schemaFile && (/\bDROP\s+(TABLE|INDEX|COLUMN|TYPE|CONSTRAINT)\b/i.test(text)
    || /\bALTER\s+TABLE\b.*\bDROP\b/i.test(text)
    || /\bALTER\s+TABLE\b.*\bALTER\s+COLUMN\b/i.test(text)
    || /\b(?:remove|drop)(?:Index|Constraint|Column|Table)\b/i.test(text));
  const sql = schemaFile && (/\b(CREATE|ALTER|DROP)\s+(TABLE|INDEX|UNIQUE\s+INDEX|TYPE|CONSTRAINT)\b/i.test(text)
    || /\b(?:ADD|DROP)\s+CONSTRAINT\b/i.test(text)
    || /\bINSERT\s+INTO\b/i.test(text));
  const orm = schemaFile && (/\b(?:model|enum)\s+[A-Za-z_$][A-Za-z0-9_$]*\b/.test(text)
    || /@@(?:index|unique|id|map)\b|@(?:id|unique|index|relation)\b|\b(?:references|hasMany|belongsTo|createTable|addConstraint|createIndex)\b/i.test(text)
    || /\b(?:CREATE|ALTER|DROP)\s+(?:TABLE|INDEX|TYPE|CONSTRAINT)\b/i.test(text));
  const seed = seedFile && /\b(?:INSERT\s+INTO|createMany|\.create\s*\(|\.insert\s*\(|seed\s*\()/i.test(text);
  if (!sql && !orm && !seed) return undefined;
  return {
    detail: destructive ? text.trim() || "Potentially destructive schema operation" : seed ? `Seed or fixture data write: ${text.trim()}` : orm && !sql ? "ORM schema, model, index, or constraint change" : text.trim() || "Schema or persistence statement",
    destructive,
  };
}

function rollbackEvidence(path: string, cwd: string): Evidence[] {
  const absolute = join(cwd, path);
  const directory = absolute.slice(0, absolute.lastIndexOf("/"));
  try {
    return readdirSync(directory).filter((name) => /(?:down|rollback|revert)/i.test(name)).slice(0, 3).map((name) => ({ path: relative(cwd, join(directory, name)), detail: "Possible rollback or reverse migration file" }));
  } catch { return []; }
}

function relatedEvidence(name: string, cwd: string, changedPaths: Set<string>, existingDependencies: Record<string, string>): Evidence[] {
  const tokens = capabilityTokens(name);
  if (!tokens.length) return [];
  const evidence: Evidence[] = [];
  for (const [dependency, version] of Object.entries(existingDependencies)) {
    if (dependency === name) continue;
    const overlap = capabilityTokens(dependency).filter((token) => tokens.includes(token));
    if (overlap.length) evidence.push({ path: "package.json", detail: `Existing dependency ${dependency} ${version} shares capability token: ${overlap.join(", ")}` });
  }
  for (const absolute of repositoryFiles(cwd)) {
    const path = relative(cwd, absolute) || absolute;
    if (changedPaths.has(path) || path === "package.json") continue;
    let content = "";
    try { content = readFileSync(absolute, "utf8").slice(0, 200_000).toLowerCase(); } catch { continue; }
    const pathText = path.toLowerCase();
    const overlap = tokens.filter((token) => pathText.includes(token) || content.includes(token));
    if (overlap.length) evidence.push({ path, detail: `Possible related repository code; matched token: ${overlap[0]}` });
    if (evidence.length >= 8) break;
  }
  return evidence;
}

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
  let inferredLine = 1;
  for (const raw of diff.split("\n")) {
    const path = currentFile(raw);
    if (path) {
      file = path;
      newLine = 0;
      inferredLine = 1;
      continue;
    }
    const hunk = raw.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunk) {
      newLine = Number(hunk[1]);
      inferredLine = newLine;
      continue;
    }
    if (raw.startsWith("+") && !raw.startsWith("+++")) {
      lines.push({ path: file, line: newLine || inferredLine, text: raw.slice(1) });
      if (newLine) newLine += 1;
      else inferredLine += 1;
      continue;
    }
    if (!raw.startsWith("-") && !raw.startsWith("\\")) {
      if (newLine) newLine += 1;
      else if (raw.startsWith(" ")) inferredLine += 1;
    }
  }
  return lines;
}

function packageUsage(name: string, lines: AddedLine[]): AddedLine[] {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(?:from\\s*[\\\"']${escaped}(?:/[^\\\"']*)?[\\\"']|require\\s*\\(\\s*[\\\"']${escaped}(?:/[^\\\"']*)?[\\\"']\\s*\\)|import\\s*\\(\\s*[\\\"']${escaped}(?:/[^\\\"']*)?[\\\"']\\s*\\)|import\\s*[\\\"']${escaped}(?:/[^\\\"']*)?[\\\"'])`);
  return lines.filter((line) => line.path !== "package.json" && pattern.test(line.text));
}

function exportNames(text: string): string[] {
  return [...text.matchAll(/\bexport\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var|type|interface|enum)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g)].map((match) => match[1]);
}

function removedExportNames(diff: string): Map<string, Set<string>> {
  const removed = new Map<string, Set<string>>();
  let file = "unknown";
  for (const line of diff.split("\n")) {
    const path = currentFile(line);
    if (path) file = path;
    if (line.startsWith("-") && !line.startsWith("---")) {
      const names = exportNames(line.slice(1));
      if (names.length) removed.set(file, new Set([...(removed.get(file) ?? []), ...names]));
    }
  }
  return removed;
}

export function detect(diff: string, cwd?: string): Finding[] {
  const findings: Finding[] = [];
  const lines = addedLines(diff);
  const removedExports = removedExportNames(diff);
  let oldPackageText = "";
  let newPackageText = "";
  const manifestLines: { text: string; added: boolean }[] = [];
  let file = "unknown";
  for (const line of diff.split("\n")) {
    const path = currentFile(line);
    if (path) file = path;
    if (file === "package.json" && (line.startsWith("+") || line.startsWith(" "))) {
      const added = line.startsWith("+");
      manifestLines.push({ text: line.slice(1), added });
      if (added && !line.startsWith("+++")) newPackageText += `${line.slice(1)}\n`;
    }
    if (line.startsWith("-") && !line.startsWith("---") && file === "package.json") oldPackageText += `${line.slice(1)}\n`;
  }
  for (const added of lines) {
    if (added.path === ".tibo" || added.path.startsWith(".tibo/")) continue;
    const envPattern = /\bprocess\.env\.([A-Z][A-Z0-9_]*)\b|\bprocess\.env\[['"]([A-Z][A-Z0-9_]*)['"]\]/g;
    for (const env of added.text.matchAll(envPattern)) {
      const name = env[1] ?? env[2];
      findings.push({ id: stableId("env", `${added.path}:${name}`), kind: "env", summary: `new environment var   ${name}`, evidence: [{ path: added.path, line: added.line, detail: `Reads process.env.${name}` }], ...detectorPolicy.env, limitation: "A diff cannot prove whether deployment configuration already defines this variable." });
    }
    const schema = schemaSignal(added.path, added.text);
    if (schema) {
      findings.push({
        id: stableId("schema", `${added.path}:${added.line}:${added.text.trim()}`),
        kind: "schema",
        summary: schema.destructive ? "destructive schema or persistence change" : "schema or persistence change",
        evidence: [{ path: added.path, line: added.line, detail: schema.detail }, ...(cwd ? rollbackEvidence(added.path, cwd) : [])],
        ...detectorPolicy.schema,
        severity: schema.destructive ? "high" : detectorPolicy.schema.severity,
        limitation: schema.destructive
          ? "This identifies a potentially destructive operation but does not prove whether backups, compatibility, or rollback steps exist."
          : "This identifies persistence-related edits but does not assess migration safety or rollback behavior."
      });
    }
    const exported = added.text.match(/\bexport\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var|type|interface|enum)\s+([A-Za-z_$][A-Za-z0-9_$]*)/);
    if (exported) {
      const name = exported[1];
      const changed = removedExports.get(added.path)?.has(name) ?? false;
      findings.push({
        id: stableId("interface", `${added.path}:${added.line}:${name}`),
        kind: "interface",
        summary: `${changed ? "changed" : "new"} exported symbol   ${name}`,
        evidence: [{ path: added.path, line: added.line, detail: `Exports ${name}` }],
        ...detectorPolicy.interface,
        limitation: changed
          ? "This identifies an exported symbol change but cannot prove whether consumers remain compatible."
          : "An export is a possible public interface change; this diff cannot prove whether another package or consumer imports it."
      });
    }
  }
  let oldDeps = manifestDependencies(oldPackageText);
  let newDeps = manifestDependencies(newPackageText);
  if (cwd) {
    try {
      const currentManifest = readFileSync(join(cwd, "package.json"), "utf8");
      const previousManifest = execFileSync("git", ["show", "HEAD:package.json"], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
      oldDeps = manifestDependencies(previousManifest);
      newDeps = manifestDependencies(currentManifest);
    } catch {
      // Synthetic diffs and repositories without a committed manifest use the parsed diff above.
    }
  }
  const changedPaths = new Set(lines.map((line) => line.path));
  const addedFiles = newFilePaths(diff);
  // Context lines in a unified diff carry a leading space, so a reformatted
  // manifest is not always valid JSON on either side. Recover additions only
  // while inside a dependency block; never treat scripts or engines as deps.
  let dependencySection: "dependencies" | "devDependencies" | undefined;
  for (const line of manifestLines) {
    const header = line.text.match(/"(dependencies|devDependencies)"\s*:\s*\{/);
    if (header) {
      dependencySection = header[1] as "dependencies" | "devDependencies";
      continue;
    }
    if (dependencySection && /^\s*},?\s*$/.test(line.text)) {
      dependencySection = undefined;
      continue;
    }
    if (dependencySection) {
      const entry = line.text.match(/^\s*"([^"]+)"\s*:\s*"([^"]+)"\s*,?\s*$/);
      if (line.added && entry && !newDeps[entry[1]]) newDeps[entry[1]] = entry[2];
    }
  }
  if (cwd) {
    for (const path of addedFiles) {
      const overlap = moduleOverlapEvidence(path, cwd, changedPaths, lines.filter((line) => line.path === path).map((line) => line.text).join("\n"));
      if (overlap.length) findings.push({
        id: stableId("module", path),
        kind: "module",
        summary: `possible overlapping module   ${path}`,
        evidence: [{ path, detail: "New file in the working diff" }, ...overlap],
        ...detectorPolicy.module,
        limitation: "Filename, import, and symbol overlap are review prompts, not proof that the modules have the same responsibility."
      });
    }
  }
  for (const [name, version] of Object.entries(newDeps)) {
    if (name in oldDeps) continue;
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const manifestLine = lines.find((line) => line.path === "package.json" && new RegExp(`\"${escapedName}\"\\s*:`).test(line.text));
    const usage = packageUsage(name, lines);
    const evidence: Evidence[] = [{ path: "package.json", ...(manifestLine ? { line: manifestLine.line } : {}), detail: `Added manifest entry: ${name} ${version}` }];
    for (const used of usage.slice(0, 5)) evidence.push({ path: used.path, line: used.line, detail: `Imports or loads ${name}` });
    const related = cwd ? relatedEvidence(name, cwd, changedPaths, oldDeps) : [];
    evidence.push(...related);
    const limitation = related.length
      ? "Repository matches are lexical evidence only; they do not prove that an existing dependency or utility is equivalent."
      : usage.length
        ? "Presence in a manifest does not show whether the dependency is necessary or safe."
        : "No import or require for this package appears in the added lines; the diff may be incomplete or usage may be indirect.";
    findings.push({ id: stableId("dependency", name), kind: "dependency", summary: `dependency added  ${name} ${version}`, evidence, ...detectorPolicy.dependency, limitation });
  }
  return dedupe(findings);
}

function dedupe(findings: Finding[]): Finding[] { return [...new Map(findings.map((finding) => [finding.id, finding])).values()]; }

export function renderFindings(findings: Finding[]): string {
  if (!findings.length) return "No new structural decisions found.\n";
  return [`${findings.length} unconfirmed decision${findings.length === 1 ? "" : "s"}`, "", ...findings.flatMap((finding, index) => [`  ${index + 1}. ${finding.summary}`, ...finding.evidence.map((evidence) => `     ${evidence.path}${evidence.line ? `:${evidence.line}` : ""} · ${evidence.detail}`), ""]), "  [k] keep   [r] reject   [l] later   [w] why", ""].join("\n");
}
