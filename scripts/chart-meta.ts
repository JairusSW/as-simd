import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

function safeGit(root: string, args: string[]): string {
  try {
    return execSync(`git ${args.join(" ")}`, { cwd: root, stdio: ["ignore", "pipe", "ignore"] })
      .toString("utf8")
      .trim();
  } catch {
    return "unknown";
  }
}

function packageVersion(root: string): string {
  try {
    const pkgPath = path.join(root, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}
export function chartSubtitle(root: string): string {
  const date = new Date().toDateString();
  const version = packageVersion(root);
  const sha = safeGit(root, ["rev-parse", "--short", "HEAD"]);
  const branch = safeGit(root, ["rev-parse", "--abbrev-ref", "HEAD"]);
  return `${date} - v${version} - ${sha} - ${branch}`;
}
