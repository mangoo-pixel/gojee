"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

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
      className="fixed inset-x-0 bottom-0 border-t border-neutral-200 bg-white/95 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-4">
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
                "flex min-h-[64px] flex-1 flex-col items-center justify-center gap-1 text-[16px] font-semibold",
                "text-neutral-700",
                isActive && "text-black"
              )}
            >
              <span
                className={twMerge(
                  "h-2 w-2 rounded-full border border-neutral-400",
                  isActive && "bg-black border-black"
                )}
                aria-hidden="true"
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

