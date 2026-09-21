import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

export function git(args: string[], cwd = process.cwd()): string {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

export function workingDiff(cwd = process.cwd()): string {
  try {
    const tracked = git(["diff", "--no-ext-diff", "--unified=0", "--no-color"], cwd);
    const untracked = git(["status", "--porcelain=v1", "--untracked-files=all"], cwd)
      .split("\n")
      .filter((line) => line.startsWith("?? "))
      .map((line) => line.slice(3))
      .filter((path) => !path.startsWith("node_modules/") && !path.startsWith(".git/"))
      .map((path) => {
        try {
          const content = execFileSync("git", ["show", ":" + path], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
          return content;
        } catch {
          try {
            const content = readFileSync(`${cwd}/${path}`, "utf8").slice(0, 200_000);
            return `diff --git a/${path} b/${path}\n+++ b/${path}\n${content.split("\n").map((line) => `+${line}`).join("\n")}`;
          } catch { return ""; }
        }
      }).join("\n");
    return `${tracked}\n${untracked}`;
  }
  catch { return ""; }
}

export function isGitRepository(cwd = process.cwd()): boolean {
  try { git(["rev-parse", "--show-toplevel"], cwd); return true; } catch { return false; }
}
