"use client";

import { useActionState } from "react";
import { saveTrip, type SaveTripResult } from "@/app/actions/trips";
import { Button } from "@/components/ui/button";

function formAction(_prev: SaveTripResult | null, formData: FormData): Promise<SaveTripResult> {
  return saveTrip(formData);
}

export function PlanTripForm() {
  const [result, formActionWithState, isPending] = useActionState(formAction, null);

  return (
    <form action={formActionWithState} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="instagramUrl"
          className="block text-[18px] font-semibold text-neutral-900"
        >
          Paste Instagram link
        </label>
        <input
          id="instagramUrl"
          name="instagramUrl"
          type="url"
          required
          placeholder="https://www.instagram.com/p/..."
          className="w-full rounded-2xl border border-neutral-300 bg-white px-4 text-[18px] text-neutral-900 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          style={{ height: "60px" }}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="title"
          className="block text-[18px] font-semibold text-neutral-900"
        >
          Give this trip a friendly name
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="Spring weekend in Kyoto"
          className="w-full rounded-2xl border border-neutral-300 bg-white px-4 text-[18px] text-neutral-900 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          style={{ height: "60px" }}
          disabled={isPending}
        />
      </div>

      {result && !result.success && (
        <p className="text-[18px] text-red-700" role="alert">
          {result.error}
        </p>
      )}
      {result?.success && (
        <p className="text-[18px] font-semibold text-green-800" role="status">
          Saved! Your list below has been updated.
        </p>
      )}

      <Button type="submit" size="lg" className="mt-2 w-full" disabled={isPending}>
        {isPending ? "Saving…" : "Plan My Trip"}
      </Button>
    </form>
  );
}
