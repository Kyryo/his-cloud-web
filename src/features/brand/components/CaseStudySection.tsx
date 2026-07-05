import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";

export function CaseStudySection() {
  return (
    <section className="w-full bg-brand-tint py-14 sm:py-16 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
          <Image
            src="/landing/case-study-masm-mw.jpg"
            alt="MASM Mediclinics and Sigma Health case study"
            width={960}
            height={640}
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
            Case Study
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-bricolage)] text-2xl font-extrabold text-brand-navy sm:text-3xl lg:text-4xl">
            MASM Mediclinics x Sigma Health
          </h2>
          <p className="mt-3 text-base font-medium text-brand-primary">
            Bridging the gap between care and compensation.
          </p>

          <p className="mt-5 text-sm leading-7 text-brand-slate sm:text-base">
            MASM Mediclinics was under pressure from manual claims, fragmented
            workflows, and delayed reimbursements. Sigma Health connected clinic
            operations directly to the MASM Insurance eClaims gateway, applying
            insurer rules before submission and reducing preventable errors at
            source.
          </p>

          <Link
            href={ROUTES.about}
            className="mt-7 inline-flex items-center rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-hover"
          >
            Read more
          </Link>
        </div>
      </div>
    </section>
  );
}
