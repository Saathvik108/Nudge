"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[60vh] grid place-items-center px-4">
      <div className="card-pad max-w-md text-center">
        <div className="text-3xl">😬</div>
        <h1 className="text-lg font-semibold mt-2">This page hit a snag</h1>
        <p className="text-sm text-ink-600 mt-2">
          Usually this means the database isn't reachable or hasn't been seeded.
          Check <code className="text-ink-800">/api/health</code> or your Vercel
          function logs for the specifics.
        </p>
        <button onClick={reset} className="btn-primary mt-4">
          Try again
        </button>
      </div>
    </div>
  );
}
