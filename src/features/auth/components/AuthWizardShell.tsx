import type { ReactNode } from "react";

import { StepIndicator } from "@/features/auth/components/StepIndicator";
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
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-[#fafbfc] px-4 py-8 sm:py-10",
        className,
      )}
    >
      <div className="w-full max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 p-6 sm:p-8 lg:p-10">
              <div className="mb-8">
                <p className="mb-2 inline-flex items-center rounded-full bg-brand-tint px-3 py-1 text-xs font-semibold text-brand-primary">
                  Step {currentStep} of {steps.length}
                </p>
                <h1 className="font-[family-name:var(--font-bricolage)] text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
                  {title}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted sm:text-base">
                  {subtitle}
                </p>
              </div>

              {children}
            </div>

            <aside className="border-t border-brand-border bg-slate-50/60 p-6 sm:p-8 lg:w-72 lg:border-l lg:border-t-0">
              <div className="lg:sticky lg:top-8">
                <h2 className="text-sm font-semibold text-brand-navy">Setup progress</h2>
                <p className="mt-1 text-xs text-brand-muted">
                  A few quick steps to launch your clinic workspace.
                </p>
                <div className="mt-6">
                  <StepIndicator
                    currentStep={currentStep}
                    steps={steps}
                    orientation="vertical"
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>

        {footer ? <div className="mt-6 text-center">{footer}</div> : null}

        <div className="mt-4 flex items-center justify-center gap-2 lg:hidden">
          {steps.map((step) => (
            <div
              key={step.number}
              className={cn(
                "h-2 rounded-full transition-all",
                currentStep >= step.number
                  ? currentStep === step.number
                    ? "w-6 bg-brand-primary"
                    : "w-2 bg-emerald-500"
                  : "w-2 bg-brand-border",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
