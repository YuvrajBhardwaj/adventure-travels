// One-command backend setup (specs/001-persistent-backend, quickstart §2).
// Reads adventure-travel/.env.setup (template: scripts/setup-backend.example.env) and:
//   1. fetches the Supabase API keys,
//   2. runs the 6 SQL files in order (all idempotent),
//   3. sets Supabase Auth: confirm email, site URL, redirect URLs, custom SMTP,
//   4. makes ADMIN_EMAIL an admin,
//   5. writes every key to Vercel (Production, Preview, Development) and to .env.local.
// Uses only the official Supabase Management API and Vercel REST API (no extra packages).
//
//   node scripts/setup-backend.mjs --dry-run   validate + show the plan, change nothing
//   node scripts/setup-backend.mjs             run it
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SQL_FILES = [
  "supabase-schema.sql",
  "supabase-activity-payments.sql",
  "supabase-backend.sql",
  "supabase-room-sharing.sql",
  "supabase-payments-v2.sql",
  "supabase-departures.sql",
];
const DRY = process.argv.includes("--dry-run");
const EMAIL = /^[^\s@'"\\]+@[^\s@'"\\]+\.[^\s@'"\\]+$/;

/** KEY=value lines → object. Ignores comments and blanks; strips optional quotes. */
export function parseEnv(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
  return out;
}

/** The SQL that grants admin; refuses anything that isn't a plain email (it's spliced into SQL). */
export function adminSql(email) {
  if (!EMAIL.test(email)) throw new Error(`ADMIN_EMAIL "${email}" is not a valid email`);
  return (
    "update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{\"role\":\"admin\"}' " +
    `where lower(email) = lower('${email}') returning email;`
  );
}

/** Upserts `key=value` lines into an existing .env text, keeping everything else. */
export function mergeEnv(text, vars) {
  const lines = text ? text.replace(/\s+$/, "").split(/\r?\n/) : [];
  for (const [key, value] of Object.entries(vars)) {
    const i = lines.findIndex((l) => l.startsWith(`${key}=`));
    if (i >= 0) lines[i] = `${key}=${value}`;
    else lines.push(`${key}=${value}`);
  }
  return lines.join("\n") + "\n";
}

const mask = (v) => (v ? `${String(v).slice(0, 4)}…(${String(v).length} chars)` : "(empty)");

function selfCheck() {
  assert.deepEqual(parseEnv("# c\nA=1\n B = 'two' \nC=\n"), { A: "1", B: "two", C: "" });
  assert.match(adminSql("me@example.com"), /lower\('me@example\.com'\)/);
  assert.throws(() => adminSql("x'; drop table users; --@a.b"));
  assert.equal(mergeEnv("KEEP=1\nA=old\n", { A: "new", B: "2" }), "KEEP=1\nA=new\nB=2\n");
}

async function api(url, token, { method = "GET", body } = {}) {
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  if (!res.ok) throw new Error(`${method} ${url.replace(/\?.*/, "")} → ${res.status}: ${typeof json === "string" ? json : JSON.stringify(json)}`.slice(0, 600));
  return json;
}

async function main() {
  selfCheck();
  let cfg;
  try {
    cfg = parseEnv(await readFile(path.join(APP, ".env.setup"), "utf8"));
  } catch {
    throw new Error("Missing adventure-travel/.env.setup. Copy scripts/setup-backend.example.env to .env.setup and fill it in.");
  }

  // VERCEL_TOKEN is optional: without it the database and .env.local are set up, and a later
  // run with the token loads the same keys into Vercel.
  const missing = ["SUPABASE_ACCESS_TOKEN", "SUPABASE_PROJECT_REF"].filter((k) => !cfg[k]);
  if (missing.length) throw new Error(`Fill in ${missing.join(", ")} in .env.setup`);
  const rzp = ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET"];
  if (rzp.some((k) => cfg[k]) && !rzp.every((k) => cfg[k])) throw new Error(`Fill in all of ${rzp.join(", ")}, or none`);
  if (cfg.ADMIN_EMAIL) adminSql(cfg.ADMIN_EMAIL); // validate early
  const site = (cfg.SITE_URL || "https://www.himalayanarcadventure.com").replace(/\/$/, "");
  const ref = cfg.SUPABASE_PROJECT_REF;
  const sb = `https://api.supabase.com/v1/projects/${ref}`;
  const vercelProject = JSON.parse(await readFile(path.join(APP, "..", ".vercel", "project.json"), "utf8"));
  const smtp = Boolean(cfg.SMTP_USER && cfg.SMTP_PASS);

  const plan = [
    `Supabase project ${ref}: read API keys`,
    ...SQL_FILES.map((f) => `run ${f}`),
    `Auth: confirm email on, site URL ${site}, redirects /dashboard /reset-password /login${smtp ? ", custom SMTP" : " (no SMTP given: Supabase's limited built-in mailer stays)"}`,
    cfg.ADMIN_EMAIL ? `make ${cfg.ADMIN_EMAIL} admin` : "no ADMIN_EMAIL: skip admin",
    cfg.VERCEL_TOKEN
      ? `Vercel project ${vercelProject.projectName}: write env vars to Production, Preview, Development; also .env.local`
      : "no VERCEL_TOKEN: write .env.local only (run again with the token to load Vercel)",
  ];
  console.log(`${DRY ? "DRY RUN — nothing will change.\n" : ""}Plan:\n- ${plan.join("\n- ")}`);
  if (DRY) {
    for (const f of SQL_FILES) await readFile(path.join(APP, f), "utf8"); // all present?
    console.log("\nInputs look complete. Run again without --dry-run to apply.");
    return;
  }

  // 1. Keys
  const keys = await api(`${sb}/api-keys`, cfg.SUPABASE_ACCESS_TOKEN);
  const key = (name) => keys.find((k) => k.name === name)?.api_key;
  const anon = key("anon");
  const service = key("service_role");
  if (!anon || !service) throw new Error("Couldn't read the anon/service_role keys for this project");
  console.log("✓ Supabase keys");

  // 2. Database
  for (const file of SQL_FILES) {
    await api(`${sb}/database/query`, cfg.SUPABASE_ACCESS_TOKEN, { method: "POST", body: { query: await readFile(path.join(APP, file), "utf8") } });
    console.log(`✓ ${file}`);
  }

  // 3. Auth settings — not fatal: they can be set by hand in the dashboard.
  try {
    await api(`${sb}/config/auth`, cfg.SUPABASE_ACCESS_TOKEN, {
      method: "PATCH",
      body: {
        site_url: site,
        // Live site pages, plus local dev and this project's Vercel previews (not every *.vercel.app site).
        uri_allow_list: [
          ...["/dashboard", "/reset-password", "/login"].map((p) => site + p),
          "http://localhost:3000/**",
          "https://adventure-travels-*-yuvrajbhardwaj2s-projects.vercel.app/**",
        ].join(","),
        mailer_autoconfirm: false,
        ...(smtp && {
          smtp_host: cfg.SMTP_HOST || "smtp.gmail.com",
          smtp_port: String(cfg.SMTP_PORT || 465),
          smtp_user: cfg.SMTP_USER,
          smtp_pass: cfg.SMTP_PASS,
          smtp_admin_email: cfg.SMTP_USER,
          smtp_sender_name: "Himalayan Arc Adventure",
        }),
      },
    });
    console.log("✓ Supabase Auth settings");
  } catch (error) {
    console.warn(`! Auth settings not applied (${error.message}). Set them in Supabase → Authentication by hand.`);
  }

  // 4. Admin
  if (cfg.ADMIN_EMAIL) {
    const rows = await api(`${sb}/database/query`, cfg.SUPABASE_ACCESS_TOKEN, { method: "POST", body: { query: adminSql(cfg.ADMIN_EMAIL) } });
    console.log(
      Array.isArray(rows) && rows.length
        ? `✓ ${cfg.ADMIN_EMAIL} is admin (sign out and back in to see /admin)`
        : `! ${cfg.ADMIN_EMAIL} hasn't signed up yet. Sign up on the site, then run this script again.`
    );
  }

  // 5. Environment variables
  const localPath = path.join(APP, ".env.local");
  const local = await readFile(localPath, "utf8").catch(() => "");
  const vars = {
    NEXT_PUBLIC_SUPABASE_URL: `https://${ref}.supabase.co`,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anon,
    SUPABASE_SERVICE_ROLE_KEY: service,
    // Reuse the secret from an earlier run so .env.local and Vercel keep agreeing.
    CRON_SECRET: cfg.CRON_SECRET || parseEnv(local).CRON_SECRET || randomBytes(32).toString("hex"),
    ...Object.fromEntries(rzp.filter((k) => cfg[k]).map((k) => [k, cfg[k]])),
    ...(smtp && { SMTP_HOST: cfg.SMTP_HOST || "smtp.gmail.com", SMTP_PORT: String(cfg.SMTP_PORT || 465), SMTP_USER: cfg.SMTP_USER, SMTP_PASS: cfg.SMTP_PASS }),
    ...(cfg.BOOKING_TO_EMAIL && { BOOKING_TO_EMAIL: cfg.BOOKING_TO_EMAIL }),
  };
  const team = vercelProject.orgId?.startsWith("team_") ? `&teamId=${vercelProject.orgId}` : "";
  for (const [k, value] of cfg.VERCEL_TOKEN ? Object.entries(vars) : []) {
    await api(`https://api.vercel.com/v10/projects/${vercelProject.projectId}/env?upsert=true${team}`, cfg.VERCEL_TOKEN, {
      method: "POST",
      body: { key: k, value, type: "encrypted", target: ["production", "preview", "development"] },
    });
    console.log(`✓ Vercel ${k} = ${mask(value)}`);
  }
  if (!cfg.VERCEL_TOKEN) console.log("! Vercel skipped (no VERCEL_TOKEN). Add it to .env.setup and run again before deploying.");
  await writeFile(localPath, mergeEnv(local, vars));
  console.log("✓ .env.local (restart `npm run dev` / `npx vercel dev` to pick it up)");

  console.log(`
Done. Still to do by hand:
${rzp.every((k) => cfg[k]) ? `- Razorpay → Webhooks → Add: URL ${site}/api/razorpay-webhook, secret = your RAZORPAY_WEBHOOK_SECRET,\n  events payment.captured, order.paid, payment.failed.` : "- Add Razorpay keys to .env.setup and run again to switch on online payments."}
- Optional: Supabase → Authentication → Providers → Google (needs a Google Cloud OAuth client).
- Deploy: env changes only reach the live site with a new deployment (merge the branch into main).`);
}

main().catch((error) => {
  console.error(`\n✗ ${error.message}`);
  process.exit(1);
});
