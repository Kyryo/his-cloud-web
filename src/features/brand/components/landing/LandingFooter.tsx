import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { LandingLogo } from "@/features/brand/components/landing/LandingLogo";

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Home", href: ROUTES.home },
      { label: "Products", href: ROUTES.ourProducts },
      { label: "Company", href: ROUTES.company },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Start for free", href: ROUTES.signup },
      { label: "Book a demo", href: ROUTES.contacts },
      { label: "Sign in", href: ROUTES.auth },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: ROUTES.privacy },
      { label: "Terms of Service", href: ROUTES.terms },
    ],
  },
] as const;

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[color:var(--landing-border)] bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-10 sm:py-16 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)] lg:gap-16">
          <div>
            <LandingLogo
              linked
              showWordmark
              imageClassName="h-9 w-auto sm:h-10"
            />
            <p className="landing-body mt-5 max-w-[28ch] text-sm leading-relaxed text-[color:var(--landing-ledger-ink)]">
              Billing, claims, and payments in one place — so clinics collect
              what they already earned.
            </p>
          </div>

          <nav aria-label="Footer">
            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
              {FOOTER_COLUMNS.map((column) => (
                <div key={column.title}>
                  <p className="landing-body text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--landing-ink)]">
                    {column.title}
                  </p>
                  <ul className="mt-4 space-y-3">
                    {column.links.map((link) => (
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
              ))}
            </div>
          </nav>
        </div>

        <p className="landing-body mt-14 border-t border-[color:var(--landing-border)] pt-6 text-xs text-[color:var(--landing-ledger-ink)] sm:text-sm">
          © {year} Sigma Health. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
