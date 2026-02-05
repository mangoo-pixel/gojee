import { listTrips } from "@/lib/trips";
import { PlanTripForm } from "@/components/PlanTripForm";
import { cookies } from "next/headers"; // Added this

export default async function Home() {
  // In Next.js 16, we must await cookies() at the top level of the page
  // even if we don't use them directly, to ensure the request context is ready.
  await cookies();

  const trips = await listTrips();

  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col px-4 pb-28 pt-10">
      <section aria-label="Welcome" className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
          Travel with Haru-chan
        </p>
        <h1 className="text-[28px] font-bold leading-snug text-neutral-900">
          A gentle travel buddy in your pocket.
        </h1>
        <p className="text-[18px] text-neutral-700">
          Paste an Instagram link you love. Haru-chan will help you turn it into
          a simple, safe trip plan—made for solo women and elders.
        </p>
      </section>

      <section aria-label="Plan trip from Instagram" className="mt-8 space-y-4">
        <PlanTripForm />

        <p className="text-[16px] text-neutral-600">
          Haru-chan focuses on simple steps: places, timings, and safety
          reminders—no complicated dashboards.
        </p>
      </section>

      <section
        aria-label="Saved trips"
        className="mt-10 space-y-3 rounded-3xl bg-white p-4 shadow-sm"
      >
        <h2 className="text-[20px] font-semibold text-neutral-900">
          Saved locations
        </h2>
        {trips.length === 0 ? (
          <p className="text-[18px] text-neutral-600">
            Your trips will appear here after you save them. Start with one
            Instagram link.
          </p>
        ) : (
          <ul className="space-y-3">
            {trips.map((trip) => (
              <li
                key={trip.id}
                className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
              >
                <p className="text-[18px] font-semibold text-neutral-900">
                  {trip.title || "Untitled trip"}
                </p>
                {trip.instagram_url && (
                  <p className="mt-1 truncate text-[16px] text-neutral-600">
                    {trip.instagram_url}
                  </p>
                )}
                {trip.location_summary && (
                  <p className="mt-1 text-[16px] text-neutral-700">
                    {trip.location_summary}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
