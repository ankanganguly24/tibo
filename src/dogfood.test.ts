import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { detect } from "./detect.js";
import { workingDiff } from "./git.js";
import { applyLedger, recordDecision } from "./ledger.js";

function runGit(root: string, args: string[]): void {
  execFileSync("git", args, { cwd: root, stdio: "ignore" });
}

function makeMovieAppFixture(): string {
  const root = mkdtempSync(join(tmpdir(), "tibo-movie-app-"));
  mkdirSync(join(root, "src"), { recursive: true });
  mkdirSync(join(root, "db", "migrations"), { recursive: true });
  mkdirSync(join(root, "db", "seeds"), { recursive: true });
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "movie-app", dependencies: { react: "^18.0.0" } }, null, 2) + "\n");
  writeFileSync(join(root, "src", "order-service.ts"), "export function createOrder(movieId: string) { return { movieId }; }\n");
  writeFileSync(join(root, "src", "config.ts"), "export const appName = 'movies';\n");
  runGit(root, ["init", "-q"]);
  runGit(root, ["config", "user.email", "tibo-test@example.com"]);
  runGit(root, ["config", "user.name", "Tibo test"]);
  runGit(root, ["add", "."]);
  runGit(root, ["commit", "-qm", "baseline"]);

  const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as { dependencies: Record<string, string> };
  packageJson.dependencies["@supabase/supabase-js"] = "^2.0.0";
  writeFileSync(join(root, "package.json"), JSON.stringify(packageJson, null, 2) + "\n");
  writeFileSync(join(root, "src", "auth.ts"), "import { createClient } from '@supabase/supabase-js';\nexport const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);\n");
  writeFileSync(join(root, "src", "order-service-v2.ts"), "import { createOrder } from './order-service';\nexport { createOrder };\nexport function placeOrder(movieId: string) { return createOrder(movieId); }\n");
  writeFileSync(join(root, "db", "migrations", "002_add_orders.sql"), "CREATE TABLE orders (id TEXT PRIMARY KEY, movie_id TEXT NOT NULL);\nCREATE INDEX orders_movie_idx ON orders (movie_id);\nALTER TABLE orders DROP COLUMN legacy_status;\n");
  writeFileSync(join(root, "db", "seeds", "orders.ts"), "await prisma.order.createMany({ data: [{ id: '1', movieId: 'm1' }] });\n");
  return root;
}

test("dogfoods a movie-app agent change across every supported detector", () => {
  const root = makeMovieAppFixture();
  try {
    const findings = detect(workingDiff(root), root);
    const kinds = new Set(findings.map((finding) => finding.kind));
    assert.deepEqual([...kinds].sort(), ["dependency", "env", "interface", "module", "schema"]);
    assert.ok(findings.some((finding) => finding.kind === "dependency" && finding.evidence.some((item) => item.path === "src/auth.ts")));
    assert.ok(findings.some((finding) => finding.kind === "env" && finding.summary.includes("NEXT_PUBLIC_SUPABASE_URL")));
    assert.ok(findings.some((finding) => finding.kind === "schema" && finding.evidence.some((item) => item.detail.includes("CREATE INDEX"))));
    assert.ok(findings.some((finding) => finding.kind === "schema" && finding.evidence.some((item) => item.detail.includes("Seed or fixture"))));
    assert.ok(findings.some((finding) => finding.kind === "module" && finding.evidence.some((item) => item.detail.includes("imports this existing module"))));
    assert.ok(findings.every((finding) => finding.severity && finding.confidence && finding.limitation));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("dogfoods the fresh-agent handoff through the CLI summary", () => {
  const root = makeMovieAppFixture();
  try {
    const findings = detect(workingDiff(root), root);
    const dependency = findings.find((finding) => finding.kind === "dependency");
    const schema = findings.find((finding) => finding.kind === "schema");
    assert.ok(dependency);
    assert.ok(schema);
    recordDecision(root, dependency, "keep");
    recordDecision(root, schema, "later");
    const output = execFileSync(process.execPath, [join(process.cwd(), "dist", "index.js"), "summary", "--json"], { cwd: root, encoding: "utf8" });
    const summary = JSON.parse(output) as { decisions: { keep: Array<{ id: string }>; later: Array<{ id: string }> }; unresolved: Array<{ id: string }> };
    assert.ok(summary.decisions.keep.some((entry) => entry.id === dependency.id));
    assert.ok(summary.decisions.later.some((entry) => entry.id === schema.id));
    assert.ok(!summary.unresolved.some((entry) => entry.id === dependency.id));
    const skill = readFileSync(join(process.cwd(), "skills", "tibo-review", "SKILL.md"), "utf8");
    assert.match(skill, /tibo summary --json/);
    assert.match(skill, /tibo scan --json/);
    assert.match(skill, /tibo decide <finding-id> keep/);
    assert.match(skill, /approves a repair plan/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
