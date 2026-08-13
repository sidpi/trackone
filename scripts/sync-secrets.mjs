#!/usr/bin/env node
/**
 * Uploads runtime environment variables from `.dev.vars` to the Cloudflare
 * Worker as secrets.
 *
 * Why this exists: `npm run deploy` (OpenNext) does NOT push `.dev.vars`
 * values to production — the "Using secrets defined in .dev.vars" line in
 * the output comes from wrangler and only covers local runs. Without this
 * script, a key added to `.dev.vars` (e.g. GOOGLE_OAUTH_CLIENT_ID) is
 * missing at runtime on the live Worker.
 *
 * Usage: npm run secrets   (requires CLOUDFLARE_API_TOKEN)
 *
 * NEXT_PUBLIC_* keys are skipped — those are inlined at build time.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
// Spawn node directly against wrangler's JS entry — works on Windows
// without a shell (npx.cmd can't be spawned directly). The bin path is
// derived from the exported package.json entry (wrangler's exports map
// doesn't expose ./bin/wrangler.js).
const wranglerBin = join(
  dirname(require.resolve("wrangler/package.json")),
  "bin",
  "wrangler.js"
);

const lines = readFileSync(".dev.vars", "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"));

const vars = [];
for (const line of lines) {
  const eq = line.indexOf("=");
  if (eq <= 0) continue;
  const key = line.slice(0, eq).trim();
  if (!key || key.startsWith("NEXT_PUBLIC_")) continue;
  vars.push({ key, value: line.slice(eq + 1) });
}

if (vars.length === 0) {
  console.log("No runtime vars found in .dev.vars (only NEXT_PUBLIC_* or comments).");
  process.exit(0);
}

console.log(`Uploading ${vars.length} var(s) as Worker secrets…`);
for (const { key, value } of vars) {
  const result = spawnSync(process.execPath, [wranglerBin, "secret", "put", key], {
    input: value,
    stdio: ["pipe", "inherit", "inherit"],
  });
  if (result.status !== 0) {
    console.error(`Failed to upload ${key}.`);
    process.exit(result.status ?? 1);
  }
}
console.log("Done — secrets are live on the Worker.");
