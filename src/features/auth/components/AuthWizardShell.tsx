"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";

import { StepIndicator } from "@/features/auth/components/StepIndicator";
import { SignupBrandPanel } from "@/features/auth/components/SignupBrandPanel";
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
  footer?: ReactNode;
  className?: string;
};

export function AuthWizardShell({
  steps,
  currentStep,
  title,
  subtitle,
  children,
  footer,
  className,
}: AuthWizardShellProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col lg:flex-row",
        className,
      )}
      data-testid="signup-wizard-shell"
    >
      <div className="auth-signup-page-bg absolute inset-0 -z-10" aria-hidden="true" />

      {/* Desktop brand plane */}
      <aside className="relative hidden w-[44%] shrink-0 border-r border-brand-border/70 lg:flex lg:flex-col">
        <SignupBrandPanel />
      </aside>

      {/* Action plane */}
      <div className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <div className="mx-auto w-full max-w-md space-y-6 lg:max-w-lg">
          <div className="lg:hidden">
            <SignupBrandPanel compact />
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden rounded-[20px] border border-brand-border/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.06)]"
            data-testid="signup-form-card"
          >
            <div className="border-b border-brand-border/70 px-5 py-4 sm:px-7 sm:py-5">
              <StepIndicator
                currentStep={currentStep}
                steps={steps}
                orientation="horizontal"
                compact
              />
            </div>

            <div className="px-5 py-6 sm:px-7 sm:py-8">
              <div className="mb-6">
                <p className="mb-2 text-xs font-semibold tracking-wide text-brand-primary">
                  Step {currentStep} of {steps.length}
                </p>
                <h2 className="font-[family-name:var(--font-bricolage)] text-2xl font-extrabold tracking-tight text-brand-navy sm:text-[1.75rem]">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted sm:text-[0.9375rem]">
                  {subtitle}
                </p>
              </div>

              <motion.div
                key={currentStep}
                initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {children}
              </motion.div>
            </div>
          </motion.div>

          {footer ? <div className="text-center">{footer}</div> : null}

          <p className="text-center text-xs text-brand-muted">
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

          {/* Mobile progress dots */}
          <div className="flex items-center justify-center gap-2 lg:hidden" aria-hidden="true">
            {steps.map((step) => (
              <div
                key={step.number}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  currentStep >= step.number
                    ? currentStep === step.number
                      ? "w-6 bg-brand-primary"
                      : "w-1.5 bg-emerald-500"
                    : "w-1.5 bg-brand-border",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
