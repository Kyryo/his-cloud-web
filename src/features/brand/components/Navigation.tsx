"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ROUTES } from "@/constants/routes";
import { BRAND_LOGO_SRC } from "@/constants/brand";
import { BRAND_NAV_LINKS } from "@/features/brand/constants/nav-links";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const showNavLinks = pathname !== ROUTES.home;

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/75 backdrop-blur-xl">
      <div className="mx-auto h-16 max-w-7xl px-6 sm:px-12">
        <div
          className={cn(
            "grid h-full items-center gap-4",
            showNavLinks
              ? "grid-cols-[auto_1fr_auto] lg:grid-cols-[1fr_auto_1fr]"
              : "grid-cols-[1fr_auto]",
          )}
        >
          <Link href={ROUTES.home} className="flex items-center justify-self-start">
            <Image
              src={BRAND_LOGO_SRC}
              alt="Sigma Health"
              width={120}
              height={40}
              className="h-8 w-auto rounded-sm object-contain"
              priority
            />
          </Link>

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
                        ? "text-brand-navy"
                        : "text-brand-muted hover:text-brand-navy",
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
              className="inline-flex items-center justify-center rounded-full border border-transparent px-5 py-2.5 text-sm font-semibold text-brand-slate transition-colors hover:border-brand-border hover:bg-brand-tint hover:text-brand-navy"
            >
              Sign In
            </Link>
            <Link
              href={ROUTES.signup}
              className="inline-flex items-center justify-center rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1254b8]"
            >
              Try Free
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="justify-self-end rounded-md p-2 text-brand-muted hover:text-brand-navy lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-16 border-t border-brand-border bg-white/95 backdrop-blur-xl lg:hidden">
          <div className="space-y-1 px-6 py-4">
            {showNavLinks
              ? BRAND_NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-md px-2 py-2.5 text-sm text-brand-slate hover:bg-brand-tint"
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
                className="inline-flex items-center justify-center rounded-full border border-transparent px-5 py-2.5 text-center text-sm font-semibold text-brand-slate transition-colors hover:bg-brand-tint hover:text-brand-navy"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href={ROUTES.signup}
                className="inline-flex items-center justify-center rounded-full bg-brand-primary px-5 py-2.5 text-center text-sm font-semibold text-white"
                onClick={() => setIsOpen(false)}
              >
                Try Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
