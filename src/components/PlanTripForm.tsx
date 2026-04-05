"use client";

import { toast } from "sonner";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

function SubmitButton({
  isLoading,
  onClick,
}: {
  isLoading: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="lg"
      onClick={onClick}
      className="mt-3 w-full h-[60px] rounded-full bg-[#FF90BC] text-white text-lg md:text-xl font-semibold shadow-md hover:bg-[#FF7AB0] hover:scale-105 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF90BC] transition-all duration-300"
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Saving...
        </span>
      ) : (
        "Next"
      )}
    </Button>
  );
}

export function PlanTripForm() {
  const instagramUrlRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (instagramUrl: string, title?: string) => {
    if (!instagramUrl?.trim()) {
      toast.error("Please paste an Instagram link.");
      return;
    }
    const url = instagramUrl.trim();
    const tripTitle = title?.trim();

    setIsLoading(true);
    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instagramUrl: url, title: tripTitle }),
      });
      const result = await response.json();

      if (result.success) {
        if (instagramUrlRef.current) instagramUrlRef.current.value = "";
        if (titleRef.current) titleRef.current.value = "";
        toast.success("Trip saved successfully!");
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm border border-stone-100">
      <div className="space-y-2">
        <label
          htmlFor="instagramUrl"
          className="block text-[18px] font-bold text-[#44403C]"
        >
          Paste Instagram link
        </label>
        <input
          ref={instagramUrlRef}
          id="instagramUrl"
          name="instagramUrl"
          type="url"
          placeholder="https://www.instagram.com/p/..."
          className="w-full rounded-2xl border border-stone-100 bg-white px-4 text-[18px] text-[#44403C] placeholder:text-[#A8A29E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86A789]"
          style={{ height: "54px" }}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="title"
          className="block text-[18px] font-bold text-[#44403C]"
        >
          Trip name
        </label>
        <input
          ref={titleRef}
          id="title"
          name="title"
          type="text"
          placeholder="e.g. Kyoto weekend"
          className="w-full rounded-2xl border border-stone-100 bg-white px-4 text-[18px] text-[#44403C] placeholder:text-[#A8A29E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86A789]"
          style={{ height: "54px" }}
        />
      </div>

      <SubmitButton
        isLoading={isLoading}
        onClick={() =>
          handleAction(
            instagramUrlRef.current?.value ?? "",
            titleRef.current?.value ?? ""
          )
        }
      />
    </div>
  );
}
