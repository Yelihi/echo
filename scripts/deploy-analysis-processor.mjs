/* global console, fetch, process */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";

const MODE_CHECK = "check";
const MODE_DEPLOY = "deploy";
const FUNCTION_NAME = "process-analysis-job";

const mode = parseMode(process.argv[2]);
loadDotEnvLocal();

const env = readRequiredEnv([
  "SUPABASE_PROJECT_REF",
  "SUPABASE_DB_PASSWORD",
  "NEXT_PUBLIC_SUPABASE_URL",
  "PROCESS_ANALYSIS_SECRET",
]);

await runSupabase(["db", "push", "--dry-run", "--linked", "--password", env.SUPABASE_DB_PASSWORD]);

if (mode === MODE_CHECK) {
  console.log("\nAnalysis processor check completed. No remote changes were applied.");
  process.exit(0);
}

await runSupabase(["db", "push", "--linked", "--password", env.SUPABASE_DB_PASSWORD]);
await runSupabase([
  "functions",
  "deploy",
  FUNCTION_NAME,
  "--project-ref",
  env.SUPABASE_PROJECT_REF,
  "--no-verify-jwt",
  "--use-api",
]);
await smokeTest(env);

console.log("\nAnalysis processor deploy completed.");

function parseMode(value) {
  if (value === MODE_CHECK || value === MODE_DEPLOY) {
    return value;
  }

  console.error("Usage: node scripts/deploy-analysis-processor.mjs <check|deploy>");
  process.exit(1);
}

function loadDotEnvLocal() {
  const envPath = join(process.cwd(), ".env.local");

  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = stripQuotes(trimmed.slice(separatorIndex + 1).trim());

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function stripQuotes(value) {
  const startsAndEndsWithSingleQuote = value.startsWith("'") && value.endsWith("'");
  const startsAndEndsWithDoubleQuote = value.startsWith('"') && value.endsWith('"');

  if (startsAndEndsWithSingleQuote || startsAndEndsWithDoubleQuote) {
    return value.slice(1, -1);
  }

  return value;
}

function readRequiredEnv(keys) {
  const values = {};
  const missingKeys = [];

  for (const key of keys) {
    const value = process.env[key]?.trim();

    if (!value) {
      missingKeys.push(key);
      continue;
    }

    values[key] = value;
  }

  if (missingKeys.length > 0) {
    console.error(`Missing required environment variables: ${missingKeys.join(", ")}`);
    console.error("Set them in .env.local or in the current shell before running this command.");
    process.exit(1);
  }

  return values;
}

function runSupabase(args) {
  return runCommand(resolveSupabaseBin(), args, { redactArgsAfter: "--password" });
}

function resolveSupabaseBin() {
  const binName = process.platform === "win32" ? "supabase.cmd" : "supabase";
  return join(process.cwd(), "node_modules", ".bin", binName);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n$ ${formatCommand(command, args, options)}`);

    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

function formatCommand(command, args, options) {
  const redactedArgs = [...args];
  const passwordIndex = redactedArgs.indexOf(options.redactArgsAfter);

  if (passwordIndex !== -1 && redactedArgs[passwordIndex + 1]) {
    redactedArgs[passwordIndex + 1] = "<redacted>";
  }

  return [command, ...redactedArgs].join(" ");
}

async function smokeTest(env) {
  const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${FUNCTION_NAME}`;

  console.log(`\n$ POST ${url}`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.PROCESS_ANALYSIS_SECRET}`,
    },
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Smoke test failed with ${response.status}: ${text}`);
  }

  console.log(text || "{}");
}
