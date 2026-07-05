"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ROUTES } from "@/constants/routes";
import { LandingLogo } from "@/features/brand/components/landing/LandingLogo";
import { BRAND_NAV_LINKS } from "@/features/brand/constants/nav-links";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const showNavLinks = pathname !== ROUTES.home;

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-[color:var(--landing-ink)]/5 bg-[color:var(--landing-clay)]/90 backdrop-blur-md">
      <div className="mx-auto h-16 max-w-7xl px-6 sm:px-12">
        <div
          className={cn(
            "grid h-full items-center gap-4",
            showNavLinks
              ? "grid-cols-[auto_1fr_auto] lg:grid-cols-[1fr_auto_1fr]"
              : "grid-cols-[1fr_auto]",
          )}
        >
          <LandingLogo className="justify-self-start" priority />

          {showNavLinks ? (
            <div className="hidden items-center justify-center gap-8 text-sm font-medium lg:flex">
              {BRAND_NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "transition-colors",
                      isActive
                        ? "landing-text-ink"
                        : "text-brand-muted hover:text-[color:var(--landing-ink)]",
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          ) : null}

          <div className="hidden items-center justify-self-end gap-3 lg:flex">
            <Link
              href={ROUTES.auth}
              className="landing-focus inline-flex min-h-11 items-center justify-center rounded-full border border-transparent px-5 py-2.5 text-sm font-semibold text-brand-slate transition-colors hover:border-brand-border hover:bg-[color:var(--landing-teal-tint)] hover:text-[color:var(--landing-ink)]"
            >
              Sign In
            </Link>
            <Link
              href={ROUTES.signup}
              className="landing-focus landing-btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
            >
              Start for free
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="justify-self-end rounded-md p-2 text-brand-muted hover:text-[color:var(--landing-ink)] lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-16 border-t border-[color:var(--landing-ink)]/5 bg-[color:var(--landing-clay)]/95 backdrop-blur-md lg:hidden">
          <div className="space-y-1 px-6 py-4">
            {showNavLinks
              ? BRAND_NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-md px-2 py-2.5 text-sm text-brand-slate hover:bg-[color:var(--landing-teal-tint)]"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))
              : null}
            <div
              className={cn(
                "flex flex-col gap-2",
                showNavLinks && "border-t border-brand-border pt-3",
              )}
            >
              <Link
                href={ROUTES.auth}
                className="inline-flex items-center justify-center rounded-full border border-transparent px-5 py-2.5 text-center text-sm font-semibold text-brand-slate transition-colors hover:bg-[color:var(--landing-teal-tint)] hover:text-[color:var(--landing-ink)]"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href={ROUTES.signup}
                className="landing-btn-primary inline-flex items-center justify-center rounded-full px-5 py-2.5 text-center text-sm font-semibold"
                onClick={() => setIsOpen(false)}
              >
                Start for free
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
