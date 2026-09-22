import test from "node:test";
import assert from "node:assert/strict";
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
