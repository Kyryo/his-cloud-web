"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export type AuthWizardStep = {
  number: number;
  label: string;
  description?: string;
};

type AuthWizardShellProps = {
  steps: AuthWizardStep[];
  currentStep: number;
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Sticky actions inside the card (Back / Continue). */
  footer?: ReactNode;
  /** Below-card secondary links (e.g. Sign in). */
  belowCard?: ReactNode;
  className?: string;
};

function ProgressDots({
  steps,
  currentStep,
}: {
  steps: AuthWizardStep[];
  currentStep: number;
}) {
  return (
    <div
      className="flex items-center gap-2"
      role="status"
      aria-label={`Step ${currentStep} of ${steps.length}: ${steps[currentStep - 1]?.label ?? ""}`}
    >
      <span className="hidden text-[13px] font-medium text-brand-muted sm:inline">
        Step {currentStep} of {steps.length}
      </span>
      <ol className="flex items-center gap-1.5" aria-hidden="true">
        {steps.map((step) => {
          const isActive = step.number === currentStep;
          const isComplete = step.number < currentStep;
          return (
            <li key={step.number}>
              <span
                className={cn(
                  "block size-2 rounded-full transition-all duration-300",
                  isActive && "scale-125 bg-brand-primary",
                  isComplete && "bg-brand-primary/50",
                  !isActive && !isComplete && "bg-slate-300",
                )}
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function AuthWizardShell({
  steps,
  currentStep,
  title,
  subtitle,
  children,
  footer,
  belowCard,
  className,
}: AuthWizardShellProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-12",
        className,
      )}
      data-testid="signup-wizard-shell"
    >
      <div className="auth-signup-page-bg absolute inset-0 -z-10" aria-hidden="true" />
      <div className="auth-signup-atmosphere absolute inset-0 -z-10" aria-hidden="true" />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex w-full max-w-[480px] flex-col"
      >
        <div
          className="flex min-h-[min(100dvh-4rem,720px)] flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_64px_rgba(15,23,42,0.08)] sm:min-h-[640px]"
          data-testid="signup-form-card"
        >
          <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-8 sm:py-6">
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-bricolage)] text-base font-bold tracking-tight text-brand-navy">
                Sigma Health
              </p>
              <p className="mt-0.5 text-[13px] text-brand-muted">
                Setup your clinic workspace
              </p>
            </div>
            <ProgressDots steps={steps} currentStep={currentStep} />
          </header>

          <div className="flex flex-1 flex-col px-6 py-7 sm:px-8 sm:py-8">
            <div className="mb-7">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-primary">
                {steps[currentStep - 1]?.label ?? `Step ${currentStep}`}
              </p>
              <h1 className="font-[family-name:var(--font-bricolage)] text-[1.65rem] font-bold leading-tight tracking-tight text-brand-navy sm:text-[1.85rem]">
                {title}
              </h1>
              <p className="mt-2.5 text-[15px] leading-relaxed text-brand-muted">
                {subtitle}
              </p>
            </div>

            <motion.div
              key={currentStep}
              className="flex flex-1 flex-col"
              initial={reduceMotion ? false : { opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </div>

          {footer ? (
            <footer className="mt-auto border-t border-slate-100 px-6 py-4 sm:px-8 sm:py-5">
              {footer}
            </footer>
          ) : null}
        </div>

        {belowCard ? <div className="mt-5 text-center">{belowCard}</div> : null}

        <p className="mt-4 text-center text-xs leading-relaxed text-brand-muted">
          By continuing you agree to our{" "}
          <Link href={ROUTES.terms} className="underline-offset-2 hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href={ROUTES.privacy} className="underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </motion.div>
    </div>
  );
}
