// Production build used by Vercel (`npm run vercel-build`).
//
// 1. Resolves the database URLs, tolerating common setup mistakes:
//    - accepts Neon/Vercel integration names (DATABASE_URL_UNPOOLED, POSTGRES_*)
//    - strips quotes/whitespace pasted into the dashboard
//    - derives DIRECT_URL from the pooled DATABASE_URL when it is missing
// 2. Applies pending migrations, then builds Next.js.
//
// Secrets are never printed — only which variable names were found.

import { execSync } from "node:child_process";

const clean = (value) => {
  const v = value?.trim().replace(/^["']+|["']+$/g, "").trim();
  return v ? v : undefined;
};

const firstSet = (names) => {
  for (const name of names) {
    const value = clean(process.env[name]);
    if (value) return { name, value };
  }
  return undefined;
};

function fail(message) {
  console.error(`\n✖ Build stopped: ${message}\n`);
  console.error(
    [
      "Fix: Vercel → your project → Settings → Environment Variables, add (for Production, Preview, Development):",
      "  DATABASE_URL = your Neon *pooled* connection string (host contains -pooler)",
      "  DIRECT_URL   = your Neon *direct* connection string (optional — derived automatically if missing)",
      "Do not wrap values in quotes. Then Deployments → ⋯ → Redeploy.",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

/** Neon direct URL = pooled URL without "-pooler" and without pooler-only params. */
function toDirectUrl(pooledUrl) {
  const url = new URL(pooledUrl);
  url.hostname = url.hostname.replace("-pooler.", ".");
  for (const param of ["pgbouncer", "pool_timeout", "connection_limit"]) url.searchParams.delete(param);
  return url.toString();
}

const pooled = firstSet(["DATABASE_URL", "POSTGRES_PRISMA_URL", "POSTGRES_URL"]);
const direct = firstSet(["DIRECT_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING"]);

const present = [
  "DATABASE_URL",
  "DIRECT_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "POSTGRES_URL_NON_POOLING",
].filter((n) => clean(process.env[n]));
console.log(`Database env vars found: ${present.length ? present.join(", ") : "none"}`);

if (!pooled) fail("no database connection string is set (DATABASE_URL is missing).");

for (const { name, value } of [pooled, direct].filter(Boolean)) {
  if (!/^postgres(ql)?:\/\//.test(value)) fail(`${name} must start with postgresql:// — check for typos.`);
  try {
    new URL(value);
  } catch {
    fail(`${name} is not a valid URL — re-copy it from Neon.`);
  }
}

const env = {
  ...process.env,
  DATABASE_URL: pooled.value,
  DIRECT_URL: direct?.value ?? toDirectUrl(pooled.value),
};
console.log(
  `Using ${pooled.name} for the app and ${direct ? direct.name : `a direct URL derived from ${pooled.name}`} for migrations.`,
);

const run = (cmd) => execSync(cmd, { stdio: "inherit", env });
run("prisma generate");
run("prisma migrate deploy");
run("next build");
