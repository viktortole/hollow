#!/usr/bin/env node
/**
 * Hollow version bumper.
 *
 * Single source of truth: pass the new version on the command line and this
 * script syncs it across:
 *   - package.json
 *   - src-tauri/Cargo.toml
 *   - src-tauri/tauri.conf.json
 *
 * Three files are kept in lockstep because the desktop installer's "About"
 * dialog reads tauri.conf.json, the JS bundle reads package.json, and Cargo
 * publishes the rust crate version. If any drift, users see contradictory
 * version numbers.
 *
 * Usage:
 *   node scripts/bump-version.mjs 1.2.3
 *
 * Or via npm:
 *   npm run version:bump -- 1.2.3
 *
 * What the script will NOT do (deliberately):
 *   - Edit CHANGELOG.md (you write release notes by hand)
 *   - Run `git tag` (review your diff first)
 *   - Push (always your call)
 */

import { readFile, writeFile } from "node:fs/promises";
import { argv, exit } from "node:process";
import { join } from "node:path";

const SEMVER_RE = /^\d+\.\d+\.\d+(-[\w.-]+)?$/;

const newVersion = argv[2];
if (!newVersion) {
  console.error("Usage: node scripts/bump-version.mjs <new-version>");
  console.error("Example: node scripts/bump-version.mjs 1.2.3");
  exit(1);
}
if (!SEMVER_RE.test(newVersion)) {
  console.error(`"${newVersion}" is not a valid semver string (e.g. 1.2.3 or 1.2.3-rc.1).`);
  exit(1);
}

const root = process.cwd();

async function bumpJson(relPath, key) {
  const path = join(root, relPath);
  const raw = await readFile(path, "utf8");
  const parsed = JSON.parse(raw);
  const previous = key.split(".").reduce((acc, k) => acc?.[k], parsed);
  // Mutate via the same path — nested writes need a tiny helper.
  const keys = key.split(".");
  let cursor = parsed;
  for (let i = 0; i < keys.length - 1; i++) {
    cursor = cursor[keys[i]];
  }
  cursor[keys[keys.length - 1]] = newVersion;
  // Preserve trailing newline + 2-space indent (matches existing formatting).
  await writeFile(path, JSON.stringify(parsed, null, 2) + "\n", "utf8");
  return { path: relPath, previous };
}

async function bumpCargo(relPath) {
  const path = join(root, relPath);
  const raw = await readFile(path, "utf8");
  // Match the FIRST `version = "x.y.z"` line under the [package] header.
  // Scoped to the [package] section so we don't accidentally bump a dependency.
  const lines = raw.split("\n");
  let inPackage = false;
  let bumped = false;
  let previous;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*\[package\]\s*$/.test(line)) {
      inPackage = true;
      continue;
    }
    if (/^\s*\[/.test(line)) {
      inPackage = false;
      continue;
    }
    if (inPackage) {
      const m = line.match(/^(\s*version\s*=\s*")([^"]+)("\s*)$/);
      if (m) {
        previous = m[2];
        lines[i] = `${m[1]}${newVersion}${m[3]}`;
        bumped = true;
        break;
      }
    }
  }
  if (!bumped) throw new Error(`Could not find [package].version in ${relPath}`);
  await writeFile(path, lines.join("\n"), "utf8");
  return { path: relPath, previous };
}

const results = await Promise.all([
  bumpJson("package.json", "version"),
  bumpJson("src-tauri/tauri.conf.json", "version"),
  bumpCargo("src-tauri/Cargo.toml"),
]);

console.log(`Bumped Hollow → ${newVersion}\n`);
for (const r of results) {
  console.log(`  ${r.path}: ${r.previous} → ${newVersion}`);
}
console.log(`\nNext steps:`);
console.log(`  1. Move "Unreleased" CHANGELOG entries under a new "[${newVersion}] — YYYY-MM-DD" heading.`);
console.log(`  2. git add -A && git commit -m "Release v${newVersion}"`);
console.log(`  3. git tag -a v${newVersion} -m "v${newVersion}"`);
console.log(`  4. git push origin main --tags`);
console.log(`  5. The release.yml workflow will build installers and attach to a draft GitHub Release.`);
