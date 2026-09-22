#!/usr/bin/env node
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { detect, renderFindings } from "./detect.js";
import { isGitRepository, workingDiff } from "./git.js";
import { applyLedger, loadLedger, recordDecision } from "./ledger.js";
import { renderSummary, summarize } from "./summary.js";

const cwd = process.cwd();
const argv = process.argv.slice(2);
const command = argv[0];
const args = new Set(argv);

if (args.has("--help") || args.has("-h")) {
  console.log("tibo — surface structural decisions in a coding-agent diff\n\nUsage:\n  tibo scan                         inspect the working diff\n  tibo scan --json                  print machine-readable findings\n  tibo summary [--json]             show ledger and unresolved work\n  tibo decide <id> <keep|reject|later>  record a reviewed finding\n  tibo --help                       show this help");
  process.exit(0);
}

if (!isGitRepository(cwd)) { console.error("Tibo needs to run inside a Git repository."); process.exit(1); }

if (command === "decide") {
  const findingId = argv[1];
  const decision = argv[2];
  if (!findingId || !decision || !["keep", "reject", "later"].includes(decision)) {
    console.error("Usage: tibo decide <finding-id> <keep|reject|later>");
    process.exit(1);
  }
  const finding = detect(workingDiff(cwd), cwd).find((item) => item.id === findingId);
  if (!finding) {
    console.error(`Finding ${findingId} is not present in the current working diff.`);
    process.exit(1);
  }
  recordDecision(cwd, finding, decision as "keep" | "reject" | "later");
  console.log(`Recorded ${decision} for ${finding.summary} (${finding.id}).`);
  process.exit(0);
}

const ledger = loadLedger(cwd);
const currentFindings = applyLedger(detect(workingDiff(cwd), cwd), ledger);
if (command === "summary") {
  const summary = summarize(currentFindings, ledger);
  if (args.has("--json")) console.log(JSON.stringify(summary, null, 2));
  else console.log(renderSummary(summary));
  process.exit(0);
}
const findings = currentFindings.filter((finding) => finding.decision === "unreviewed");
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
