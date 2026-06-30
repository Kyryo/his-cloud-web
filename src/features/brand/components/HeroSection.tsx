import Link from "next/link";
import { TbCircleCheck } from "react-icons/tb";

import HeroGraphic from "@/components/HeroGraphic";
import { ROUTES } from "@/constants/routes";

const TRUST_NOTES = [
  "No card required",
  "Free setup call included",
  "Cancel anytime",
] as const;

export function HeroSection() {
  return (
    <section className="flex flex-col bg-white pt-16">
      <div className="mx-auto mt-10 flex w-full max-w-7xl flex-col px-6 sm:mt-14 sm:px-12 lg:mt-20">
        <div className="grid grid-cols-1 items-start gap-8 pb-6 lg:grid-cols-2 lg:gap-12 lg:pb-8">
          <div className="flex flex-col justify-start text-left lg:pr-12">
            <h1
              className="hero-fade-up font-[family-name:var(--font-bricolage)] text-[2rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-brand-navy sm:text-[2.375rem] lg:text-[42px]"
              style={{ animationDelay: "0.05s" }}
            >
              The clinic software built for the other 80% of the world&apos;s
              hospitals
            </h1>

            <p
              className="hero-fade-up mt-4 max-w-lg text-sm leading-6 text-brand-muted sm:mt-5 sm:text-base sm:leading-7"
              style={{ animationDelay: "0.15s" }}
            >
              Most health software is built for hospitals that have IT departments,
              huge admin and finance teams, and six-figure implementation budgets.
              We built Sigma for everyone else, which turns out to be most of the
              world.
            </p>

            <div
              className="group/cta hero-fade-up mt-8 flex flex-col gap-5 sm:mt-10"
              style={{ animationDelay: "0.25s" }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Link
                  href={ROUTES.signup}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-primary px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1254b8] sm:text-base"
                >
                  Start for free
                </Link>
                <Link
                  href={ROUTES.contacts}
                  className="inline-flex items-center justify-center rounded-full border-[1.5px] border-brand-navy bg-transparent px-7 py-3.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-tint sm:text-base"
                >
                  Book a demo
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-brand-muted sm:text-sm">
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
            className="hero-fade-up w-full self-start lg:-mt-1"
            style={{ animationDelay: "0.4s" }}
          >
            <HeroGraphic />
          </div>
        </div>
      </div>
    </section>
  );
}
