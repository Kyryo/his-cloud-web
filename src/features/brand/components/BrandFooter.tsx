import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { LandingLogo } from "@/features/brand/components/landing/LandingLogo";
import { appHref } from "@/lib/app-url";

const FOOTER_COLUMNS = [
  {
    title: "Solutions",
    links: [
      { label: "Billing", href: ROUTES.solutionsBilling },
      { label: "Claims", href: ROUTES.solutionsClaims },
      { label: "Payments", href: ROUTES.solutionsPayments },
      { label: "All solutions", href: ROUTES.solutions },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: ROUTES.about },
      { label: "Company", href: ROUTES.company },
      { label: "Contact", href: ROUTES.contacts },
      { label: "Pricing", href: ROUTES.pricing },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Start for free", href: appHref(ROUTES.signup) },
      { label: "Talk to sales", href: ROUTES.pricing },
      { label: "Sign in", href: appHref(ROUTES.auth) },
      { label: "Services", href: ROUTES.services },
    ],
  },
] as const;

export function BrandFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[color:var(--landing-border)] bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-10 sm:py-16 lg:px-12">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
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

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-10 sm:col-span-2 sm:grid-cols-3 lg:col-span-3"
          >
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="landing-body text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--landing-ink)]">
                  {column.title}
                </p>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.href}-${link.label}`}>
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
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-[color:var(--landing-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="landing-body text-xs text-[color:var(--landing-ledger-ink)] sm:text-sm">
            © {year} Sigma Health. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-[color:var(--landing-ledger-ink)] sm:text-sm">
            <Link
              href={ROUTES.privacy}
              className="landing-focus hover:text-[color:var(--landing-teal)]"
            >
              Privacy
            </Link>
            <Link
              href={ROUTES.terms}
              className="landing-focus hover:text-[color:var(--landing-teal)]"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
