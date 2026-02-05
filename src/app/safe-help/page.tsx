export default function SafeHelpPage() {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col px-4 pb-28 pt-10">
      <header className="space-y-2">
        <h1 className="text-[26px] font-bold text-neutral-900">Safe Help</h1>
        <p className="text-[18px] text-neutral-700">
          Quick, calm helpers for moments when you feel unsure on the road.
        </p>
      </header>

      <section
        aria-label="Safety tips"
        className="mt-8 space-y-3 rounded-3xl bg-white p-4 shadow-sm"
      >
        <h2 className="text-[20px] font-semibold text-neutral-900">
          Gentle safety checklist
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-[18px] text-neutral-800">
          <li>Share your live location with a trusted friend.</li>
          <li>Keep local emergency numbers saved in your phone.</li>
          <li>
            Stay in well-lit, busy areas at night; avoid isolated shortcuts.
          </li>
          <li>Trust your body. If something feels off, leave early.</li>
        </ul>
      </section>

      <section
        aria-label="Important contacts"
        className="mt-6 space-y-3 rounded-3xl bg-white p-4 shadow-sm"
      >
        <h2 className="text-[20px] font-semibold text-neutral-900">
          Important contacts
        </h2>
        <p className="text-[18px] text-neutral-700">
          Add your own local contacts (hotel, host, tour guide) into your
          phone&apos;s favorites, so you can call them with one tap.
        </p>
      </section>
    </main>
  );
}

