"use client";

import Link from "next/link";

import { LandingProductScreenshot } from "@/features/brand/components/landing/LandingProductScreenshot";
import { useLandingReveal } from "@/features/brand/hooks/useLandingReveal";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const HERO_SCREENSHOT = "/landing/product-screenshots/client-details.png";

export function HeroSection() {
  const { ref, isVisible } = useLandingReveal<HTMLElement>({ threshold: 0.05 });

  return (
    <section
      ref={ref}
      className={cn(
        "landing-hero-ground relative flex flex-col pt-20",
        "landing-reveal",
        isVisible && "is-visible",
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-8 pt-14 text-center sm:px-10 sm:pb-10 sm:pt-16 lg:px-12 lg:pt-20">
        <h1 className="landing-display max-w-[18ch] text-[clamp(2rem,5vw,3.75rem)] font-semibold tracking-[-0.045em] text-balance sm:max-w-none sm:whitespace-nowrap">
          Stop losing revenue after patient care
        </h1>

        <p className="landing-body mx-auto mt-6 max-w-[34rem] text-[1.05rem] leading-[1.7] text-[color:var(--landing-ledger-ink)] sm:text-lg sm:leading-[1.7]">
          Sigma connects patient billing, insurance claims, and payments so you
          always know where your money stands.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-3">
          <Link
            href={ROUTES.signup}
            className="landing-focus landing-btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-7 py-3 text-sm font-semibold sm:text-[15px]"
          >
            Start for free
          </Link>
          <Link
            href={ROUTES.contacts}
            className="landing-focus landing-btn-secondary inline-flex min-h-11 items-center justify-center rounded-full border px-7 py-3 text-sm font-semibold sm:text-[15px]"
          >
            Book a demo
          </Link>
        </div>

        <div className="mt-14 w-full max-w-5xl sm:mt-16 lg:mt-20">
          <LandingProductScreenshot
            src={HERO_SCREENSHOT}
            alt="Sigma patient account overview showing billing and visit history"
            elevated
            priority
            className="w-full"
          />
        </div>
      </div>
    </section>
  );
}
