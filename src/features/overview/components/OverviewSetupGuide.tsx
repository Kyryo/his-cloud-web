"use client";

import { Check } from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import type { OnboardingProgress } from "@/features/auth/services/onboarding.service";
import {
  catalogSetupHref,
  departmentSetupHref,
  insuranceSetupHref,
  moduleSetupHref,
  isSetupStepDone,
  overviewSetupMode,
  setupProgressLabel,
} from "@/features/overview/utils/overview-setup";
import { cn } from "@/lib/utils";

type OverviewSetupGuideProps = {
  progress: OnboardingProgress;
  now?: number;
  onDismiss: (dismissed: boolean) => void;
};

type SetupRow = {
  key: string;
  title: string;
  detail: string;
  done: boolean;
  href?: string;
  optional?: boolean;
};

function setupRows(progress: OnboardingProgress): SetupRow[] {
  const steps = progress.completed_steps;
  const clinicName = progress.tenant_name.trim() || "Your clinic";
  return [
    {
      key: "clinic",
      title: "Clinic",
      detail: `${clinicName} is ready.`,
      done: isSetupStepDone(steps, "clinic"),
    },
    {
      key: "modules",
      title: "Choose your modules",
      detail: "The workflows this clinic uses, such as front desk or laboratory.",
      done: isSetupStepDone(steps, "modules"),
      href: moduleSetupHref(),
    },
    {
      key: "departments",
      title: "Add departments",
      detail: "The areas this clinic runs, such as outpatient or dental.",
      done: isSetupStepDone(steps, "departments"),
      href: departmentSetupHref(),
    },
    {
      key: "catalog",
      title: "Add a service or product",
      detail: "A service or product, so an invoice has a line.",
      done: isSetupStepDone(steps, "catalog"),
      href: catalogSetupHref(),
    },
    {
      key: "insurance",
      title: "Payer (or insurance)",
      detail:
        "A payer can be an insurance provider. Claims need a payer and a scheme.",
      done: isSetupStepDone(steps, "insurance"),
      href: insuranceSetupHref(progress),
    },
    {
      key: "invites",
      title: "Invite the team",
      detail: "Optional. You can do this later.",
      done: isSetupStepDone(steps, "invites"),
      href: ROUTES.settingsUserManagement,
      optional: true,
    },
  ];
}

export function OverviewSetupGuide({
  progress,
  now,
  onDismiss,
}: OverviewSetupGuideProps) {
  const mode = overviewSetupMode(progress, now);
  if (mode === "hidden" || mode === "resume" || mode === "ready") {
    return null;
  }

  const rows = setupRows(progress);
  const nextKey = rows.find((row) => !row.optional && !row.done)?.key;

  return (
    <section aria-label="Clinic setup">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-dash-muted">Set up your clinic</h2>
        <p className="text-[13px] text-brand-primary">{setupProgressLabel(progress)}</p>
      </div>
      <ul className="mt-4 space-y-2">
        {rows.map((row) => {
          const current = row.key === nextKey;
          return (
            <li key={row.key}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3.5 py-3",
                  current ? "bg-dash-canvas" : "bg-transparent",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full",
                    row.done
                      ? "bg-brand-tint text-brand-primary"
                      : "border border-dash-border",
                  )}
                >
                  {row.done ? <Check className="size-3" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[13px] font-medium",
                        current ? "text-brand-navy" : "text-brand-slate",
                      )}
                    >
                      {row.title}
                    </span>
                    {row.optional ? (
                      <span className="text-[11px] text-dash-muted">Optional</span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-[12px] leading-5 text-dash-muted">
                    {row.detail}
                  </span>
                </span>
                {!row.done && row.href ? (
                  <Link
                    href={row.href}
                    className={cn(
                      "inline-flex h-8 shrink-0 items-center rounded-full px-3.5 text-[13px] font-medium",
                      current
                        ? "bg-brand-primary text-white hover:bg-brand-primary-hover"
                        : "border border-dash-border text-dash-muted hover:text-brand-navy",
                    )}
                  >
                    Set up
                  </Link>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        className="mt-3 block text-left text-[13px] text-dash-muted transition-colors hover:text-brand-navy"
        onClick={() => onDismiss(true)}
      >
        Skip for now
      </button>
    </section>
  );
}
