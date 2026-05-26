import type { SetupReason } from "@/lib/current-user";

const COPY: Record<
  SetupReason,
  { title: string; body: string; steps: string[] }
> = {
  no_database_url: {
    title: "Database not connected",
    body: "DATABASE_URL isn't set. Add it so Nudge can reach your Postgres database.",
    steps: [
      "Create a free Postgres on Neon or Supabase and copy its connection string.",
      "In Vercel → Project → Settings → Environment Variables, add DATABASE_URL.",
      "Redeploy, then run the setup commands below to create and seed tables.",
    ],
  },
  cannot_connect: {
    title: "Can't reach the database",
    body: "DATABASE_URL is set but the database didn't answer. The host/port may be wrong, or the database is asleep.",
    steps: [
      "Double-check the connection string (host, port, ?sslmode=require for Neon/Supabase).",
      "Make sure the database is running and reachable from Vercel.",
      "For Neon, prefer the pooled connection string for serverless.",
    ],
  },
  auth_failed: {
    title: "Database login failed",
    body: "The database rejected the credentials in DATABASE_URL.",
    steps: [
      "Verify the username and password in the connection string.",
      "Re-copy the string from your database provider and update DATABASE_URL.",
    ],
  },
  db_missing: {
    title: "Database not found",
    body: "The server is reachable but the named database doesn't exist.",
    steps: [
      "Check the database name at the end of the connection string.",
      "Create the database or point DATABASE_URL at an existing one.",
    ],
  },
  no_tables: {
    title: "Tables not created yet",
    body: "Connected to the database, but Nudge's tables don't exist. Push the schema and seed it.",
    steps: [
      "Run the setup commands below with DATABASE_URL pointed at this database.",
    ],
  },
  not_seeded: {
    title: "Almost there — add the demo data",
    body: "The database is connected and tables exist, but there's no data yet. Seed it once.",
    steps: ["Run: npm run db:seed (with DATABASE_URL set to this database)."],
  },
  error: {
    title: "Database error",
    body: "Something went wrong talking to the database. The details below should point at the cause.",
    steps: [
      "Check the Vercel function logs, or hit /api/health for a quick status.",
    ],
  },
};

export const SetupScreen = ({
  reason,
  detail,
}: {
  reason: SetupReason;
  detail?: string;
}) => {
  const c = COPY[reason];
  const showSetupCmds = reason === "no_database_url" || reason === "no_tables" || reason === "not_seeded";
  return (
    <div className="min-h-screen grid place-items-center bg-ink-50 px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-xl bg-brand-600 grid place-items-center text-white font-bold">
            N
          </div>
          <div className="text-lg font-semibold">Nudge</div>
        </div>
        <div className="card-pad">
          <div className="pill bg-orange-50 text-orange-700 mb-3">Setup needed</div>
          <h1 className="text-xl font-semibold">{c.title}</h1>
          <p className="text-sm text-ink-600 mt-2 leading-relaxed">{c.body}</p>

          <ol className="mt-4 space-y-2 text-sm list-decimal list-inside text-ink-800">
            {c.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>

          {showSetupCmds && (
            <pre className="mt-4 rounded-xl bg-ink-900 text-ink-100 text-xs p-4 overflow-x-auto">
{`# with DATABASE_URL set to your database:
npx prisma db push   # create tables
npm run db:seed      # add the demo data`}
            </pre>
          )}

          {detail && (
            <details className="mt-4">
              <summary className="text-xs text-ink-500 cursor-pointer">Technical detail</summary>
              <pre className="mt-2 rounded-lg bg-ink-100 text-ink-700 text-xs p-3 overflow-x-auto whitespace-pre-wrap">
                {detail}
              </pre>
            </details>
          )}

          <div className="mt-5 text-xs text-ink-500">
            Status check: <code className="text-ink-700">/api/health</code>
          </div>
        </div>
      </div>
    </div>
  );
};
