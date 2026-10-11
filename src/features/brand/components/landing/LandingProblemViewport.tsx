import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { LANDING_PROBLEM } from "@/features/brand/constants/landing-home-content";

export function LandingProblemViewport() {
  return (
    <section
      aria-labelledby="landing-problem-heading"
      className="bg-white"
    >
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col justify-center px-6 py-16 sm:px-10 lg:px-12">
        <p className="landing-body text-[13px] font-medium text-[color:var(--landing-teal)]">
          After every visit
        </p>
        <h2
          id="landing-problem-heading"
          className="landing-display mt-2 max-w-[22ch] whitespace-pre-line text-[clamp(1.35rem,2.1vw,1.75rem)] font-semibold tracking-[-0.03em] text-[color:var(--landing-ink)] text-balance"
        >
          {LANDING_PROBLEM.title}
        </h2>

        <div className="mt-8 grid items-center gap-8 lg:mt-9 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)] lg:gap-12">
          <div className="relative overflow-hidden rounded-[1.5rem] bg-[color:var(--landing-warm)]">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src="/landing/problem-rejected-claims.jpg"
                alt="A clinic finance officer reviewing a rejected insurance claim"
                fill
                quality={90}
                sizes="(min-width: 1024px) 52vw, 92vw"
                className="object-cover object-[center_46%]"
                priority
              />
            </div>
          </div>

          <div>
            <ol className="m-0 flex list-none flex-col gap-5 p-0 sm:gap-6">
              {LANDING_PROBLEM.items.map((item) => (
                <li key={item.title}>
                  <h3 className="landing-display text-[1.05rem] font-semibold tracking-[-0.018em] text-[color:var(--landing-ink)] sm:text-[1.15rem]">
                    {item.title}
                  </h3>
                  <p className="landing-body mt-1.5 max-w-[36ch] text-sm leading-[1.55] text-[color:var(--landing-ledger-ink)]">
                    {item.description}
                  </p>
                </li>
              ))}
            </ol>

            <Link
              href={ROUTES.contacts}
              className="landing-focus landing-btn-primary group mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-[15px] font-semibold"
            >
              Book a demo
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
