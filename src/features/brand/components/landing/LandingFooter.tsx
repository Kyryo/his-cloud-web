import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { LandingLogo } from "@/features/brand/components/landing/LandingLogo";
import { BRAND_NAV_LINKS } from "@/features/brand/constants/nav-links";

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: ROUTES.privacy },
  { label: "Terms of Service", href: ROUTES.terms },
] as const;

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[color:var(--landing-border)] bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-10 sm:py-16 lg:px-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-10">
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <LandingLogo linked={false} imageClassName="h-10 w-auto sm:h-12" />
            <p className="landing-body max-w-sm text-sm leading-[1.7] text-[color:var(--landing-ledger-ink)]">
              Clinic software that works where you work: patients, billing,
              stock, and insurance in one place.
            </p>
            <Link
              href={ROUTES.signup}
              className="landing-focus landing-btn-primary inline-flex min-h-10 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              Start for free
            </Link>
          </div>

          <div>
            <p className="landing-body text-sm font-semibold text-[color:var(--landing-ink)]">
              Explore
            </p>
            <ul className="mt-4 space-y-2.5">
              {BRAND_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="landing-focus landing-body text-sm text-[color:var(--landing-ledger-ink)] transition-colors hover:text-[color:var(--landing-teal)]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={ROUTES.features}
                  className="landing-focus landing-body text-sm text-[color:var(--landing-ledger-ink)] transition-colors hover:text-[color:var(--landing-teal)]"
                >
                  Features
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="landing-body text-sm font-semibold text-[color:var(--landing-ink)]">
              Support
            </p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href={ROUTES.contacts}
                  className="landing-focus landing-body text-sm text-[color:var(--landing-ledger-ink)] transition-colors hover:text-[color:var(--landing-teal)]"
                >
                  Contact us
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.auth}
                  className="landing-focus landing-body text-sm text-[color:var(--landing-ledger-ink)] transition-colors hover:text-[color:var(--landing-teal)]"
                >
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="landing-body text-sm font-semibold text-[color:var(--landing-ink)]">
              Legal
            </p>
            <ul className="mt-4 space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="landing-focus landing-body text-sm text-[color:var(--landing-ledger-ink)] transition-colors hover:text-[color:var(--landing-teal)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[color:var(--landing-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="landing-body text-xs text-[color:var(--landing-ledger-ink)] sm:text-sm">
            © {year} Sigma Health. Built for clinics across Africa, Asia, and
            the Americas.
          </p>
          <p className="landing-body text-xs text-[color:var(--landing-ledger-ink)]/80">
            Paper registers to live clinic data in under a day.
          </p>
        </div>
      </div>
    </footer>
  );
}
