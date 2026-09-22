import test from "node:test";
import assert from "node:assert/strict";
import { renderSummary, summarize } from "./summary.js";
import type { Finding, LedgerEntry } from "./types.js";

const finding = (id: string, decision?: Finding["decision"]): Finding => ({
  id,
  kind: "env",
  summary: `finding ${id}`,
  evidence: [{ path: "src/config.ts", line: 2, detail: "reads an environment variable" }],
  confidence: "medium",
  limitation: "deployment configuration is unknown",
  decision,
});

const entry = (id: string, decision: LedgerEntry["decision"]): LedgerEntry => ({ ...finding(id, decision), decision, decidedAt: "2026-09-22T00:00:00.000Z" });

test("summarizes ledger decisions and current unresolved findings", () => {
  const summary = summarize([finding("open"), finding("kept", "keep")], [entry("old-keep", "keep"), entry("old-reject", "reject"), entry("old-later", "later")]);
  assert.equal(summary.decisions.keep.length, 1);
  assert.equal(summary.decisions.reject.length, 1);
  assert.equal(summary.decisions.later.length, 1);
  assert.deepEqual(summary.unresolved.map((item) => item.id), ["open"]);
});

test("renders a compact human summary", () => {
  const output = renderSummary(summarize([finding("open")], [entry("accepted", "keep")]));
  assert.match(output, /Kept: 1/);
  assert.match(output, /accepted · finding accepted/);
  assert.match(output, /Unreviewed: 1/);
  assert.match(output, /open · finding open/);
});
