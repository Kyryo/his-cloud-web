import Link from "next/link";
import { TbCircleCheck } from "react-icons/tb";

import { ROUTES } from "@/constants/routes";
import { HeroBrowserMockup } from "@/features/brand/components/landing/HeroBrowserMockup";

const TRUST_NOTES = [
  "No card required",
  "Free setup call included",
  "Cancel anytime",
] as const;

export function HeroSection() {
  return (
    <section className="flex min-h-[calc(100dvh-4rem)] flex-col bg-white pt-16">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 sm:px-12">
        <div className="grid flex-1 grid-cols-1 items-center gap-8 py-4 lg:grid-cols-2 lg:gap-10 lg:py-6">
          <div className="flex flex-col justify-center text-left lg:pr-16">
            <h1
              className="hero-fade-up font-[family-name:var(--font-bricolage)] text-[2rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-brand-navy sm:text-[2.375rem] lg:text-[42px]"
              style={{ animationDelay: "0.05s" }}
            >
              The clinic software built for the other 80% of the world&apos;s
              hospitals
            </h1>

            <p
              className="hero-fade-up mb-[10px] mt-3 max-w-lg text-sm leading-6 text-brand-muted sm:mt-4 sm:text-base sm:leading-7"
              style={{ animationDelay: "0.15s" }}
            >
              Most health software is built for hospitals that have IT departments,
              huge admin and finance teams, and six-figure implementation budgets.
              We built Sigma for everyone else, which turns out to be most of the
              world.
            </p>

            <div
              className="group/cta hero-fade-up flex flex-col gap-3"
              style={{ animationDelay: "0.25s" }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href={ROUTES.signup}
                  className="inline-flex items-center justify-center gap-1 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1254b8]"
                >
                  Try Sigma Free
                  <span className="inline-block max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 ease-out group-hover/cta:max-w-[5.5rem] group-hover/cta:opacity-100">
                    for 30 Days
                  </span>
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href={ROUTES.contacts}
                  className="inline-flex items-center justify-center rounded-full border-[1.5px] border-brand-navy bg-transparent px-6 py-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-tint"
                >
                  Book a demo
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs text-brand-muted">
                {TRUST_NOTES.map((note) => (
                  <span key={note} className="inline-flex items-center gap-1.5">
                    <TbCircleCheck
                      className="size-3.5 shrink-0 text-[#0F766E]"
                      aria-hidden="true"
                    />
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div
            className="hero-fade-up w-full"
            style={{ animationDelay: "0.4s" }}
          >
            <HeroBrowserMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
