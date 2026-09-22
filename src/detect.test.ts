import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { detect } from "./detect.js";

test("detects a dependency added by a package manifest diff", () => {
  const diff = [
    "diff --git a/package.json b/package.json",
    "--- a/package.json",
    "+++ b/package.json",
    "- {\"dependencies\":{\"typescript\":\"^5.0.0\"}}",
    "+ {\"dependencies\":{\"typescript\":\"^5.0.0\",\"nodemailer\":\"^6.9.0\"}}",
  ].join("\n");
  const findings = detect(diff);
  assert.equal(findings.length, 1);
  assert.equal(findings[0]?.summary, "dependency added  nodemailer ^6.9.0");
});

test("detects an environment variable reference", () => {
  const diff = ["+++ b/src/email/config.ts", "+export const from = process.env.SMTP_FROM;"].join("\n");
  const findings = detect(diff);
  assert.equal(findings[0]?.kind, "env");
  assert.match(findings[0]?.summary ?? "", /SMTP_FROM/);
});

test("detects a dependency from npm's reformatted manifest diff", () => {
  const diff = [
    "diff --git a/package.json b/package.json",
    "--- a/package.json",
    "+++ b/package.json",
    "-  \"dependencies\": {",
    "-    \"typescript\": \"^5.0.0\"",
    "+  \"dependencies\": {",
    "+    \"typescript\": \"^5.0.0\",",
    "+    \"@supabase/supabase-js\": \"^2.0.0\"",
    "+  },",
  ].join("\n");
  const findings = detect(diff);
  assert.equal(findings.length, 1);
  assert.equal(findings[0]?.summary, "dependency added  @supabase/supabase-js ^2.0.0");
});

test("shows the manifest line and the added import for a dependency", () => {
  const diff = [
    "diff --git a/package.json b/package.json",
    "--- a/package.json",
    "+++ b/package.json",
    "@@ -1,3 +1,4 @@",
    " {",
    "   \"dependencies\": {",
    "+    \"zod\": \"^3.0.0\"",
    "   }",
    "diff --git a/src/validate.ts b/src/validate.ts",
    "--- a/src/validate.ts",
    "+++ b/src/validate.ts",
    "@@ -1,0 +1,2 @@",
    "+import { z } from \"zod\";",
    "+export const schema = z.string();",
  ].join("\n");
  const finding = detect(diff).find((item) => item.kind === "dependency");
  assert.ok(finding);
  assert.deepEqual(finding.evidence, [
    { path: "package.json", line: 3, detail: "Added manifest entry: zod ^3.0.0" },
    { path: "src/validate.ts", line: 1, detail: "Imports or loads zod" },
  ]);
  assert.equal(finding.limitation, "Presence in a manifest does not show whether the dependency is necessary or safe.");
});

test("flags a dependency with no direct added usage without guessing", () => {
  const diff = [
    "--- a/package.json",
    "+++ b/package.json",
    "@@ -1 +1 @@",
    "-{\"dependencies\":{}}",
    "+{\"dependencies\":{\"stripe\":\"^16.0.0\"}}",
  ].join("\n");
  const finding = detect(diff)[0];
  assert.ok(finding);
  assert.match(finding.limitation, /No import or require/);
  assert.equal(finding.evidence.length, 1);
});

test("does not mistake scripts or engines for dependencies in a reformatted manifest", () => {
  const diff = [
    "--- a/package.json",
    "+++ b/package.json",
    "@@ -1,8 +1,12 @@",
    "-  \"dependencies\": {}",
    "+{",
    "+  \"name\": \"tibo\",",
    "+  \"scripts\": {",
    "+    \"build\": \"tsc -p tsconfig.json\"",
    "+  },",
    "+  \"engines\": {",
    "+    \"node\": \">=20\"",
    "+  },",
    "+  \"dependencies\": {",
    "+    \"stripe\": \"^16.0.0\"",
    "+  }",
    "+}",
  ].join("\n");
  const findings = detect(diff).filter((item) => item.kind === "dependency");
  assert.equal(findings.length, 1);
  assert.equal(findings[0]?.summary, "dependency added  stripe ^16.0.0");
});


test("tracks lines in an untracked-file style diff without a hunk header", () => {
  const diff = [
    "diff --git a/src/config.ts b/src/config.ts",
    "+++ b/src/config.ts",
    "+export const first = process.env.FIRST_KEY;",
    "+export const second = process.env.SECOND_KEY;",
  ].join("\n");
  const findings = detect(diff).filter((item) => item.kind === "env");
  assert.equal(findings[0]?.evidence[0]?.line, 1);
  assert.equal(findings[1]?.evidence[0]?.line, 2);
});


test("reports possible existing package and utility matches as evidence", () => {
  const root = mkdtempSync(join(tmpdir(), "tibo-related-"));
  mkdirSync(join(root, "src"));
  writeFileSync(join(root, "package.json"), JSON.stringify({ dependencies: { "@sendgrid/mail": "^8.0.0" } }));
  writeFileSync(join(root, "src", "mailer.ts"), "export function sendMail() { return true; }\n");
  const diff = [
    "--- a/package.json",
    "+++ b/package.json",
    "@@ -1 +1 @@",
    "-{\"dependencies\":{\"@sendgrid/mail\":\"^8.0.0\"}}",
    "+{\"dependencies\":{\"@sendgrid/mail\":\"^8.0.0\",\"@acme/mail-client\":\"^1.0.0\"}}",
  ].join("\n");
  try {
    const finding = detect(diff, root).find((item) => item.kind === "dependency");
    assert.ok(finding);
    assert.ok(finding.evidence.some((item) => item.detail.includes("@sendgrid/mail")));
    assert.match(finding.limitation, /lexical evidence/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});


test("detects multiple environment variables on one added line", () => {
  const diff = [
    "+++ b/src/auth.ts",
    "+export const client = [process.env.SUPABASE_URL, process.env.SUPABASE_KEY];",
  ].join("\n");
  const findings = detect(diff).filter((item) => item.kind === "env");
  assert.deepEqual(findings.map((item) => item.summary), [
    "new environment var   SUPABASE_URL",
    "new environment var   SUPABASE_KEY",
  ]);
});


test("classifies destructive migration statements separately", () => {
  const diff = [
    "+++ b/db/migrations/004_remove_legacy.sql",
    "@@ -1,0 +1,2 @@",
    "+ALTER TABLE orders DROP COLUMN legacy_status;",
    "+CREATE INDEX orders_user_idx ON orders (user_id);",
  ].join("\n");
  const findings = detect(diff).filter((item) => item.kind === "schema");
  assert.equal(findings[0]?.summary, "destructive schema or persistence change");
  assert.equal(findings[0]?.severity, "high");
  assert.equal(findings[1]?.summary, "schema or persistence change");
  assert.equal(findings[1]?.severity, "medium");
});


test("detects newly exported TypeScript symbols", () => {
  const diff = [
    "+++ b/src/auth/session.ts",
    "@@ -1,0 +1,2 @@",
    "+export type Session = { userId: string };",
    "+export function createSession(userId: string) { return { userId }; }",
  ].join("\n");
  const findings = detect(diff).filter((item) => item.kind === "interface");
  assert.deepEqual(findings.map((item) => item.summary), [
    "new exported symbol   Session",
    "new exported symbol   createSession",
  ]);
  assert.equal(findings[0]?.severity, "medium");
});

test("reports possible module overlap for a newly added file", () => {
  const root = mkdtempSync(join(tmpdir(), "tibo-module-"));
  mkdirSync(join(root, "src"));
  writeFileSync(join(root, "src", "order-service.ts"), "export function createOrder() {}\n");
  const diff = [
    "diff --git a/src/order-service-v2.ts b/src/order-service-v2.ts",
    "new file mode 100644",
    "--- /dev/null",
    "+++ b/src/order-service-v2.ts",
    "@@ -0,0 +1,1 @@",
    "+export function createOrderV2() {}",
  ].join("\n");
  try {
    const finding = detect(diff, root).find((item) => item.kind === "module");
    assert.ok(finding);
    assert.match(finding.summary, /order-service-v2/);
    assert.ok(finding.evidence.some((item) => item.path === "src/order-service.ts"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("includes a nearby rollback file as schema evidence", () => {
  const root = mkdtempSync(join(tmpdir(), "tibo-schema-"));
  mkdirSync(join(root, "db", "migrations"), { recursive: true });
  writeFileSync(join(root, "db", "migrations", "003_down.sql"), "-- rollback\n");
  const diff = [
    "diff --git a/db/migrations/003_up.sql b/db/migrations/003_up.sql",
    "--- /dev/null",
    "+++ b/db/migrations/003_up.sql",
    "@@ -0,0 +1,1 @@",
    "+ALTER TABLE orders DROP COLUMN legacy_status;",
  ].join("\n");
  try {
    const finding = detect(diff, root).find((item) => item.kind === "schema");
    assert.ok(finding);
    assert.ok(finding.evidence.some((item) => item.path === "db/migrations/003_down.sql"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});


test("distinguishes a changed exported symbol from a new one", () => {
  const diff = [
    "--- a/src/auth/session.ts",
    "+++ b/src/auth/session.ts",
    "@@ -1 +1 @@",
    "-export function createSession(userId: string) { return { userId }; }",
    "+export function createSession(userId: string, provider = 'supabase') { return { userId, provider }; }",
  ].join("\n");
  const finding = detect(diff).find((item) => item.kind === "interface");
  assert.equal(finding?.summary, "changed exported symbol   createSession");
  assert.match(finding?.limitation ?? "", /consumers remain compatible/);
});

test("uses direct imports and shared exports as module overlap evidence", () => {
  const root = mkdtempSync(join(tmpdir(), "tibo-module-graph-"));
  mkdirSync(join(root, "src"));
  writeFileSync(join(root, "src", "order-service.ts"), "export function createOrder() { return true; }\n");
  writeFileSync(join(root, "src", "order-types.ts"), "export type Order = { id: string };\n");
  const diff = [
    "diff --git a/src/order-service-v2.ts b/src/order-service-v2.ts",
    "new file mode 100644",
    "--- /dev/null",
    "+++ b/src/order-service-v2.ts",
    "@@ -0,0 +1,3 @@",
    "+import { createOrder } from './order-service';",
    "+export { createOrder };",
    "+export function placeOrder() { return createOrder(); }",
  ].join("\n");
  try {
    const finding = detect(diff, root).find((item) => item.kind === "module");
    assert.ok(finding);
    assert.ok(finding.evidence.some((item) => item.detail.includes("imports this existing module")));
    assert.equal(finding.severity, "low");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("detects ORM indexes, constraints, and seed writes", () => {
  const diff = [
    "+++ b/prisma/schema.prisma",
    "@@ -1,0 +1,5 @@",
    "+model Order {",
    "+  id String @id",
    "+  userId String",
    "+  @@index([userId])",
    "+}",
    "+++ b/db/seeds/orders.ts",
    "@@ -1,0 +1,1 @@",
    "+await prisma.order.createMany({ data: orders });",
  ].join("\n");
  const findings = detect(diff).filter((item) => item.kind === "schema");
  assert.equal(findings.length, 4);
  assert.ok(findings.some((item) => item.evidence[0]?.detail.includes("ORM schema")));
  assert.ok(findings.some((item) => item.evidence[0]?.detail.includes("Seed or fixture")));
  assert.ok(findings.every((item) => item.severity === "medium" && item.confidence === "high"));
});

test("detects SQL constraints and seed inserts", () => {
  const diff = [
    "+++ b/db/migrations/007_constraints.sql",
    "@@ -1,0 +1,2 @@",
    "+ALTER TABLE orders ADD CONSTRAINT orders_user_fk FOREIGN KEY (user_id) REFERENCES users(id);",
    "+INSERT INTO orders (id, user_id) VALUES ('1', 'u1');",
  ].join("\n");
  const findings = detect(diff).filter((item) => item.kind === "schema");
  assert.equal(findings.length, 2);
  assert.ok(findings[0]?.evidence[0]?.detail.includes("ADD CONSTRAINT"));
  assert.ok(findings[1]?.evidence[0]?.detail.includes("INSERT INTO"));
});

test("assigns a documented severity and confidence policy to every detector", () => {
  const diff = [
    "+++ b/src/config.ts",
    "+export const url = process.env.PUBLIC_URL;",
    "+++ b/src/session.ts",
    "+export function createSession() { return true; }",
    "+++ b/db/migrations/006.sql",
    "+CREATE INDEX session_user_idx ON sessions (user_id);",
  ].join("\n");
  const findings = detect(diff);
  assert.ok(findings.length >= 3);
  assert.ok(findings.every((item) => ["low", "medium", "high"].includes(item.severity)));
  assert.ok(findings.every((item) => ["low", "medium", "high"].includes(item.confidence)));
});

test("does not create structural findings for unrelated documentation changes", () => {
  const diff = [
    "+++ b/README.md",
    "@@ -1,0 +1,2 @@",
    "+# Movie app",
    "+This explains how to buy a ticket.",
    "+++ b/styles.css",
    "@@ -1,0 +1,1 @@",
    "+.button { color: white; }",
  ].join("\n");
  assert.deepEqual(detect(diff), []);
});
