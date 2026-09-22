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
