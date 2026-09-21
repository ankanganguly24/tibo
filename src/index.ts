#!/usr/bin/env node
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { detect, renderFindings } from "./detect.js";
import { isGitRepository, workingDiff } from "./git.js";
import { applyLedger, loadLedger, recordDecision } from "./ledger.js";

const cwd = process.cwd();
const args = new Set(process.argv.slice(2));

if (args.has("--help") || args.has("-h")) {
  console.log("tibo — surface structural decisions in a coding-agent diff\n\nUsage:\n  tibo scan             inspect the working diff\n  tibo scan --json      print machine-readable findings\n  tibo --help           show this help");
  process.exit(0);
}

if (!isGitRepository(cwd)) { console.error("Tibo needs to run inside a Git repository."); process.exit(1); }
const findings = applyLedger(detect(workingDiff(cwd)), loadLedger(cwd)).filter((finding) => finding.decision === "unreviewed");
if (args.has("scan") || args.size === 0) {
  if (args.has("--json")) { console.log(JSON.stringify(findings, null, 2)); process.exit(0); }
  console.log(renderFindings(findings));
  if (!findings.length || !process.stdin.isTTY) process.exit(0);
  const rl = createInterface({ input, output });
  for (const finding of findings) {
    const answer = (await rl.question(`${finding.summary} [k/r/l/w] `)).trim().toLowerCase();
    if (answer === "k" || answer === "r" || answer === "l") recordDecision(cwd, finding, ({ k: "keep", r: "reject", l: "later" } as const)[answer]);
    else if (answer === "w") console.log(`Why: ${finding.limitation}`);
  }
  rl.close();
}
