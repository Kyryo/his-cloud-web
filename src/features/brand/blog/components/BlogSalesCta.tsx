import Link from "next/link";

import { ROUTES } from "@/constants/routes";

export function BlogSalesCta() {
  return (
    <section
      aria-labelledby="blog-cta-heading"
      className="rounded-2xl border border-[color:var(--landing-border)] bg-[color:var(--landing-ink)] px-6 py-10 sm:px-10 sm:py-12"
      data-testid="blog-sales-cta"
    >
      <h2
        id="blog-cta-heading"
        className="landing-display max-w-[18ch] text-[clamp(1.6rem,3vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-white"
      >
        Ready to run calmer clinic revenue?
      </h2>
      <p className="landing-body mt-4 max-w-xl text-[15px] leading-[1.65] text-white/70 sm:text-base">
        See how Sigma connects billing, claims, and payments so your team stops
        rebuilding the story after every visit.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href={ROUTES.pricing}
          className="landing-focus inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 py-3 text-[15px] font-semibold text-[color:var(--landing-ink)] transition-opacity hover:opacity-90"
        >
          Contact sales
        </Link>
        <Link
          href={ROUTES.solutions}
          className="landing-focus inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-7 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
        >
          Explore solutions
        </Link>
      </div>
    </section>
  );
}
