import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";

const HERO_IMAGE = "/landing/sigma-health-landing-other-img.jpg";

const PARTNER_MARKS = ["MASM MediClinics", "Regional Health", "CareNet"] as const;

const STAT_CARD_CLASS =
  "min-w-[148px] max-w-[170px] rounded-xl bg-white px-3.5 py-2.5 shadow-[0_8px_32px_rgba(21,101,216,0.10)]";

function GreenCheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="7" cy="7" r="7" fill="#ECFDF5" />
      <path
        d="M4.25 7.25L6.1 9.1L9.75 5.45"
        stroke="#059669"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeroSection() {
  return (
    <section className="flex min-h-[calc(100dvh-4rem)] flex-col bg-white pt-16">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 sm:px-12">
        <div className="grid flex-1 grid-cols-1 items-center gap-6 py-4 lg:grid-cols-2 lg:gap-10 lg:py-6">
          <div className="flex flex-col justify-center text-left lg:pr-16">
            <h1
              className="hero-fade-up font-[family-name:var(--font-bricolage)] text-[2rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-brand-navy sm:text-[2.375rem] lg:text-[42px]"
              style={{ animationDelay: "0.05s" }}
            >
              Reclaim the{" "}
              <span className="text-brand-primary">16%</span> of revenue your
              hospital loses every month.
            </h1>

            <p
              className="hero-fade-up mb-[10px] mt-3 max-w-lg text-sm leading-6 text-brand-muted sm:mt-4 sm:text-base sm:leading-7"
              style={{ animationDelay: "0.15s" }}
            >
              Sigma Health automates claims processing and inventory control,
              eliminating the billing errors and stock wastages that quietly
              drain your bottom line.
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

              <p className="inline-flex items-center gap-1.5 text-xs text-brand-muted">
                <GreenCheckIcon />
                Free for 30 days · No credit card required
              </p>
            </div>
          </div>

          <div
            className="hero-fade-up relative mx-auto flex w-full max-w-md items-center lg:max-w-none"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="relative aspect-[4/5] max-h-[min(48vh,480px)] w-full overflow-hidden rounded-[20px] lg:max-h-[min(58vh,560px)]">
              <Image
                src={HERO_IMAGE}
                alt="Doctor using Sigma Health in a clinical environment"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 50vw"
                className="object-cover object-center"
              />
            </div>

            <div
              className={`hero-fade-up absolute left-4 top-4 hidden md:block lg:left-6 lg:top-6 ${STAT_CARD_CLASS}`}
              style={{ animationDelay: "0.5s" }}
            >
              <p className="text-[0.65rem] font-medium uppercase tracking-wide text-brand-muted">
                Claims Processed
              </p>
              <p className="mt-0.5 text-sm font-semibold text-brand-navy">
                +3,200 this week
              </p>
            </div>

            <div
              className={`hero-fade-up absolute bottom-6 right-4 hidden md:block lg:right-6 ${STAT_CARD_CLASS}`}
              style={{ animationDelay: "0.6s" }}
            >
              <p className="text-[0.65rem] font-medium uppercase tracking-wide text-brand-muted">
                Error Rate
              </p>
              <p className="mt-0.5 text-xl font-extrabold leading-none text-emerald-600">
                ↓ 0.4%
              </p>
              <p className="mt-1 text-[11px] leading-tight text-brand-muted">
                vs 4.8% industry avg
              </p>
            </div>
          </div>
        </div>

        <div
          className="hero-fade-up shrink-0 border-t border-brand-border px-12 py-[18px]"
          style={{ animationDelay: "0.55s" }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-brand-muted">
                Trusted by
              </p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-bold text-[#A0AFC0]">
                {PARTNER_MARKS.map((mark, index) => (
                  <span key={mark} className="inline-flex items-center gap-2">
                    {index > 0 ? (
                      <span aria-hidden="true" className="font-normal">
                        ·
                      </span>
                    ) : null}
                    <span>{mark}</span>
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-brand-muted sm:text-right">
              6 facilities · 3 health networks
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
