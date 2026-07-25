import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { LandingLogo } from "@/features/brand/components/landing/LandingLogo";

const FOOTER_LINKS = [
  { label: "Home", href: ROUTES.home },
  { label: "Privacy Policy", href: ROUTES.privacy },
  { label: "Terms of Service", href: ROUTES.terms },
] as const;

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[color:var(--landing-border)] bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 sm:px-10 sm:py-12 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <LandingLogo linked imageClassName="h-9 w-auto sm:h-10" />

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-1 gap-y-2">
              {FOOTER_LINKS.map((link, index) => (
                <li key={link.href} className="flex items-center">
                  {index > 0 ? (
                    <span
                      className="mx-3 hidden h-1 w-1 rounded-full bg-[color:var(--landing-border)] sm:mx-4 sm:inline-block"
                      aria-hidden="true"
                    />
                  ) : null}
                  <Link
                    href={link.href}
                    className="landing-focus landing-body rounded-md px-1 py-1 text-sm text-[color:var(--landing-ledger-ink)] transition-colors hover:text-[color:var(--landing-teal)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-[color:var(--landing-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="landing-body text-xs text-[color:var(--landing-ledger-ink)] sm:text-sm">
            © {year} Sigma Health. All rights reserved.
          </p>
          <p className="landing-body text-xs text-[color:var(--landing-ledger-ink)]/75">
            Built for clinics that want clearer operations.
          </p>
        </div>
      </div>
    </footer>
  );
}
