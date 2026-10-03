import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";
import process from "node:process";

const script = resolve("scripts/deploy-analysis-processor.mjs");
for (const scenario of ["check", "deploy", "worker-failure"]) {
  test(`release sequence: ${scenario}`, () => {
    const cwd = mkdtempSync(join(tmpdir(), "echo-release-test-"));
    try {
      mkdirSync(join(cwd, "node_modules/.bin"), { recursive: true });
      writeFileSync(
        join(cwd, "node_modules/.bin/supabase"),
        `#!/usr/bin/env node
const fs = require('node:fs');
fs.appendFileSync('calls', JSON.stringify(process.argv.slice(2)) + '\\n');
if (process.env.FAIL_WORKER && process.argv[2] === 'functions') process.exit(1);
`,
        { mode: 0o755 },
      );
      const mockFetch = `globalThis.fetch = async (_url, options) => {
        if (options.method !== 'OPTIONS') throw new Error('Health check must not consume paid work');
        return new Response(null, {status: 204});
      };`;
      const result = spawnSync(
        process.execPath,
        [
          "--import",
          `data:text/javascript,${encodeURIComponent(mockFetch)}`,
          script,
          scenario === "check" ? "check" : "deploy",
        ],
        {
          cwd,
          encoding: "utf8",
          env: {
            PATH: process.env.PATH,
            SUPABASE_PROJECT_REF: "test",
            SUPABASE_DB_PASSWORD: "secret-test-password",
            NEXT_PUBLIC_SUPABASE_URL: "https://example.test",
            ...(scenario === "worker-failure" ? { FAIL_WORKER: "1" } : {}),
          },
        },
      );
      const calls = readFileSync(join(cwd, "calls"), "utf8").trim().split("\n").map(JSON.parse);
      assert.equal(result.status, scenario === "worker-failure" ? 1 : 0, result.stderr);
      assert.equal(calls[0].includes("--dry-run"), true);
      assert.equal(calls.length, scenario === "check" ? 1 : scenario === "worker-failure" ? 2 : 3);
      if (scenario !== "check") assert.deepEqual(calls[1].slice(0, 2), ["functions", "deploy"]);
      if (scenario === "deploy") assert.deepEqual(calls[2].slice(0, 3), ["db", "push", "--linked"]);
      assert.equal(result.stdout.includes("secret-test-password"), false);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });
}
