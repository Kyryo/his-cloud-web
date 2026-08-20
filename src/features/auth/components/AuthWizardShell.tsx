"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";

import { ROUTES } from "@/constants/routes";
import { AuthSplitLayout } from "@/features/auth/components/AuthSplitLayout";
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
  footer?: ReactNode;
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
    <AuthSplitLayout
      className={className}
      panelTestId="signup-brand-panel"
      headline={"Stop losing revenue\nafter every patient visit."}
      subhead="Create your clinic workspace in minutes. Billing, claims, and payments in one place."
      imageSrc="/landing/comparison-stop-chasing.jpg"
      imageAlt="A clinic manager reviewing insurance claims"
      belowCard={
        <>
          {belowCard}
          <p className="mt-4 text-xs leading-relaxed text-brand-muted">
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
        </>
      }
    >
      <motion.div
        data-testid="signup-wizard-shell"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div data-testid="signup-form-card">
          <header className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-bricolage)] text-lg font-semibold tracking-[-0.018em] text-brand-navy">
                Get started
              </p>
              <p className="mt-0.5 text-[13px] text-brand-muted">
                Setup your clinic workspace
              </p>
            </div>
            <ProgressDots steps={steps} currentStep={currentStep} />
          </header>

          <div className="mt-10 flex flex-col">
            <div className="mb-7">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-primary">
                {steps[currentStep - 1]?.label ?? `Step ${currentStep}`}
              </p>
              <h2 className="font-[family-name:var(--font-bricolage)] text-[1.85rem] font-semibold leading-[1.12] tracking-[-0.02em] text-brand-navy sm:text-[2.1rem]">
                {title}
              </h2>
              <p className="mt-2.5 text-[15px] leading-relaxed text-brand-muted">
                {subtitle}
              </p>
            </div>

            <motion.div
              key={currentStep}
              className="flex flex-col"
              initial={reduceMotion ? false : { opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </div>

          {footer ? <div className="mt-8">{footer}</div> : null}
        </div>
      </motion.div>
    </AuthSplitLayout>
  );
}
