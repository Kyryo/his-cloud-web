"use client";

import Image from "next/image";
import Link from "next/link";
import { Lock, ShieldCheck } from "lucide-react";

import { BRAND_LOGO_SRC } from "@/constants/brand";
import { ROUTES } from "@/constants/routes";
import { SignupHealthcareGraphic } from "@/features/auth/components/SignupHealthcareGraphic";
import { cn } from "@/lib/utils";

type SignupBrandPanelProps = {
  className?: string;
  /** Compact strip for mobile above the form card. */
  compact?: boolean;
};

export function SignupBrandPanel({ className, compact = false }: SignupBrandPanelProps) {
  if (compact) {
    return (
      <div className={cn("space-y-3 text-center sm:text-left", className)} data-testid="signup-brand-compact">
        <Link href={ROUTES.home} className="inline-flex items-center justify-center sm:justify-start">
          <Image
            src={BRAND_LOGO_SRC}
            alt="Sigma Health"
            width={120}
            height={36}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <div>
          <h1 className="font-[family-name:var(--font-bricolage)] text-xl font-extrabold tracking-tight text-brand-navy">
            Stop losing revenue after patient care.
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-brand-muted">
            Create your clinic workspace in under two minutes.
          </p>
        </div>
        <p className="text-xs text-brand-muted">
          30-day free trial · No credit card required
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex h-full flex-col justify-between overflow-hidden px-8 py-10 lg:px-12 lg:py-14",
        className,
      )}
      data-testid="signup-brand-panel"
    >
      <div className="auth-signup-mesh absolute inset-0" aria-hidden="true" />
      <div className="auth-signup-grain absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 space-y-10">
        <Link href={ROUTES.home} className="inline-flex">
          <Image
            src={BRAND_LOGO_SRC}
            alt="Sigma Health"
            width={140}
            height={42}
            className="h-9 w-auto"
            priority
          />
        </Link>

        <div className="max-w-md space-y-4">
          <h1 className="font-[family-name:var(--font-bricolage)] text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            Stop losing revenue after patient care.
          </h1>
          <p className="text-base leading-relaxed text-brand-slate sm:text-lg">
            Create your clinic workspace in under two minutes. Billing, claims,
            and payments in one place.
          </p>
        </div>

        <SignupHealthcareGraphic className="mx-auto w-full max-w-sm lg:mx-0" />
      </div>

      <div className="relative z-10 mt-10 space-y-5">
        <ul className="flex flex-col gap-2.5 text-sm text-brand-slate">
          <li className="inline-flex items-center gap-2">
            <ShieldCheck className="size-4 shrink-0 text-brand-primary" aria-hidden="true" />
            30-day free trial · No credit card required
          </li>
          <li className="inline-flex items-center gap-2">
            <Lock className="size-4 shrink-0 text-brand-primary" aria-hidden="true" />
            Encrypted in transit and at rest
          </li>
        </ul>
        <p className="text-xs font-medium tracking-wide text-brand-muted">
          47 clinics · 3 countries
        </p>
      </div>
    </div>
  );
}
