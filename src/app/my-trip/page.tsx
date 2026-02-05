import { listTrips } from "@/lib/trips";

export default async function MyTripPage() {
  const trips = await listTrips();

  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col px-4 pb-28 pt-10">
      <header className="space-y-2">
        <h1 className="text-[26px] font-bold text-neutral-900">My Trip</h1>
        <p className="text-[18px] text-neutral-700">
          Review the places Haru-chan has saved for you from your Instagram
          inspiration.
        </p>
      </header>

      <section
        aria-label="Saved trips"
        className="mt-8 space-y-3 rounded-3xl bg-white p-4 shadow-sm"
      >
        <h2 className="text-[20px] font-semibold text-neutral-900">
          Saved locations
        </h2>
        {trips.length === 0 ? (
          <p className="text-[18px] text-neutral-600">
            No trips yet. Go to Home and paste an Instagram link to get
            started.
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
                {trip.location_summary && (
                  <p className="mt-1 text-[16px] text-neutral-700">
                    {trip.location_summary}
                  </p>
                )}
                {trip.instagram_url && (
                  <p className="mt-1 truncate text-[16px] text-neutral-600">
                    {trip.instagram_url}
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

