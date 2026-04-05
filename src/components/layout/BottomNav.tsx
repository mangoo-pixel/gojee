"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { Plane } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/my-trip", label: "My Trip" },
  { href: "/safe-help", label: "Safe Help" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mb-6"
    >
      <div className="mx-auto flex max-w-md justify-center px-6">
        <div className="pointer-events-auto flex flex-1 items-stretch justify-between rounded-full border border-[#E0F7FA] bg-white/90 backdrop-blur-lg shadow-[0_8px_30px_rgb(58,190,249,0.12)] px-4">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={twMerge(
                  "flex min-h-[64px] flex-1 flex-col items-center justify-center gap-1 text-[13px] font-bold transition-all duration-300 active:scale-90",
                  "text-[#94A3B8]", // Soft slate for inactive
                  isActive && "text-[#3ABEF9]", // Bright Sky Blue for active
                )}
              >
                <div className="relative flex h-6 items-center justify-center">
                  {isActive ? (
                    <Plane
                      className="h-5 w-5 animate-bounce fill-[#3ABEF9]/10"
                      aria-hidden="true"
                    />
                  ) : (
                    <span
                      className="h-2 w-2 rounded-full bg-[#BAE6FD] opacity-40"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <span
                  className={twMerge(
                    "tracking-wide transition-colors",
                    isActive ? "opacity-100" : "opacity-60",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
