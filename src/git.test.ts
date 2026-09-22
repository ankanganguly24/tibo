import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { detect } from "./detect.js";
import { workingDiff } from "./git.js";

function runGit(root: string, args: string[]): void {
  execFileSync("git", args, { cwd: root, stdio: "ignore" });
}

test("workingDiff includes staged tracked changes", () => {
  const root = mkdtempSync(join(tmpdir(), "tibo-staged-diff-"));
  try {
    writeFileSync(join(root, "package.json"), '{"dependencies":{}}\n');
    runGit(root, ["init", "-q"]);
    runGit(root, ["config", "user.email", "tibo-test@example.com"]);
    runGit(root, ["config", "user.name", "Tibo test"]);
    runGit(root, ["add", "package.json"]);
    runGit(root, ["commit", "-qm", "baseline"]);
    writeFileSync(join(root, "package.json"), '{"dependencies":{"stripe":"^16.0.0"}}\n');
    runGit(root, ["add", "package.json"]);

    const diff = workingDiff(root);
    assert.match(diff, /\+\+\+ b\/package\.json/);
    assert.match(diff, /stripe/);
    assert.equal(detect(diff, root).find((finding) => finding.kind === "dependency")?.summary, "dependency added  stripe ^16.0.0");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
