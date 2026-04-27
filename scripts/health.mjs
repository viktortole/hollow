#!/usr/bin/env node
/**
 * Hollow project health check.
 *
 * Runs every release-blocking gate in sequence and reports a unified pass/fail.
 * Designed to be run before opening a PR, before tagging a release, and as the
 * first thing a future agent does when picking up this codebase.
 *
 * Each gate is shallow on its own — typecheck, build, four architectural
 * pattern scans. The value is having ONE command that runs them all so you
 * can't forget one. Maps directly to the rules in `docs/AGENT-HANDOFF.md`.
 *
 * Pattern scans are pure JS (not shell `grep`) so the script is portable:
 * works identically on Windows, macOS, Linux, and CI runners.
 *
 * Exit code 0 = all green. Exit code 1 = at least one gate failed; details
 * printed inline.
 */

import { execSync } from "node:child_process";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { argv, exit, cwd } from "node:process";

const verbose = argv.includes("--verbose") || argv.includes("-v");
const ROOT = cwd();

/** Walk a tree, yield every file path relative to ROOT. Skips node_modules + dist + gen. */
async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === "gen" || entry.name === "target") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

/**
 * Scan files under a root for lines matching a regex. Returns an array of
 * `{path, line, content}` hits.
 *
 * @param {string} rootDir Absolute root to scan.
 * @param {RegExp} pattern Multi-line regex tested per-line; must NOT have /g flag.
 * @param {(path:string)=>boolean} pathFilter Optional filter on relative path.
 * @param {(path:string,line:string)=>boolean} ignoreLine Optional per-line allowlist.
 */
async function scan(rootDir, pattern, pathFilter = () => true, ignoreLine = () => false) {
  const hits = [];
  for await (const path of walk(rootDir)) {
    const rel = relative(ROOT, path).split(sep).join("/");
    if (!pathFilter(rel)) continue;
    let body;
    try {
      body = await readFile(path, "utf8");
    } catch {
      continue;
    }
    const lines = body.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i]) && !ignoreLine(rel, lines[i])) {
        hits.push(`${rel}:${i + 1}: ${lines[i].trim()}`);
      }
    }
  }
  return hits;
}

const checks = [
  {
    name: "TypeScript",
    run: () => {
      try {
        execSync("npx tsc --noEmit", { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
        return { ok: true };
      } catch (e) {
        const out = (e.stdout?.toString() ?? "") + (e.stderr?.toString() ?? "");
        return { ok: false, lines: out.split("\n").filter((l) => l.includes("error TS")).slice(0, 12) };
      }
    },
  },
  {
    name: "Vite build",
    run: () => {
      try {
        execSync("npm run build --silent", { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
        return { ok: true };
      } catch (e) {
        const out = (e.stdout?.toString() ?? "") + (e.stderr?.toString() ?? "");
        return { ok: false, lines: out.split("\n").slice(-15) };
      }
    },
  },
  {
    name: "Arch — only useFastingClock has the fasting clock setInterval",
    run: async () => {
      const hits = await scan(
        join(ROOT, "src"),
        /\bsetInterval\b/,
        (rel) => /^src\/(components|features|hooks)\//.test(rel),
        (rel) =>
          rel.endsWith("useFastingClock.ts") ||
          rel.endsWith("UndoSnackbar.tsx") ||
          rel.endsWith("README.md")
      );
      return hits.length === 0 ? { ok: true } : { ok: false, lines: hits };
    },
  },
  {
    name: "Arch — only platform/desktop imports @tauri-apps/api/window",
    run: async () => {
      const hits = await scan(
        join(ROOT, "src"),
        /@tauri-apps\/api\/window|getCurrentWindow|LogicalSize|LogicalPosition/,
        // Code files only — README mentions of the rule are not violations.
        (rel) => /\.(tsx?|jsx?)$/.test(rel) && !rel.startsWith("src/platform/")
      );
      return hits.length === 0 ? { ok: true } : { ok: false, lines: hits };
    },
  },
  {
    name: "Arch — no z-[N] / z-NN preset / rounded-2xl|xl|lg literals",
    run: async () => {
      const hits = await scan(
        join(ROOT, "src"),
        /z-\[\d+\]|\bz-(?:0|10|20|30|40|50|60|70|80|90|100|auto)\b|\brounded-(?:2xl|xl|lg)\b/,
        (rel) => /\.(tsx?|jsx?)$/.test(rel),
        (rel) =>
          rel.endsWith("utilities.css") ||
          rel.endsWith("tokens.css") ||
          rel.endsWith("stages.ts")
      );
      return hits.length === 0 ? { ok: true } : { ok: false, lines: hits };
    },
  },
  {
    name: "Arch — no useStore() without a selector (whole-store re-render footgun)",
    run: async () => {
      const hits = await scan(
        join(ROOT, "src"),
        /\buseStore\(\s*\)/,
        (rel) => /\.tsx?$/.test(rel)
      );
      return hits.length === 0 ? { ok: true } : { ok: false, lines: hits };
    },
  },
];

let failed = 0;
const startedAt = Date.now();

for (const check of checks) {
  process.stdout.write(`  · ${check.name} ... `);
  const result = await check.run();
  if (result.ok) {
    console.log("✓");
  } else {
    failed++;
    console.log("✗");
    const lines = (result.lines ?? []).filter(Boolean);
    for (const line of lines.slice(0, 12)) console.log(`      ${line}`);
    if (!verbose && lines.length > 12) console.log(`      ... +${lines.length - 12} more (run with --verbose)`);
  }
}

const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
console.log("");
if (failed === 0) {
  console.log(`All ${checks.length} health checks passed in ${elapsed}s.`);
  exit(0);
} else {
  console.log(`${failed} of ${checks.length} health checks FAILED (in ${elapsed}s).`);
  exit(1);
}
