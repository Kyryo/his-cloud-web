"use client";

import { Check, ChevronRight } from "lucide-react";

import type { OhEncounterTabId } from "@/features/occupational-health/components/OhEncounterTabs";
import type {
  FitnessAssessment,
  FitnessCertificate,
  IodCase,
  OhExamFinding,
} from "@/features/occupational-health/types";
import {
  currentFitnessCertificate,
  formatOhDate,
  latestFitnessAssessment,
} from "@/features/occupational-health/utils/oh-format";
import { formatFitnessOutcome } from "@/features/occupational-health/utils/oh-labels";
import { cn } from "@/lib/utils";

type ProgressStep = {
  key: string;
  label: string;
  detail: string;
  tab: OhEncounterTabId;
  isDone: boolean;
  isOptional: boolean;
};

type OhEncounterProgressProps = {
  examinationCount: number;
  findings: OhExamFinding[];
  assessments: FitnessAssessment[];
  certificates: FitnessCertificate[];
  iodCases: IodCase[];
  activeTab: OhEncounterTabId;
  onSelectTab: (tab: OhEncounterTabId) => void;
};

function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function buildSteps({
  examinationCount,
  findings,
  assessments,
  certificates,
  iodCases,
}: Omit<OhEncounterProgressProps, "activeTab" | "onSelectTab">): ProgressStep[] {
  const latest = latestFitnessAssessment(assessments);
  const certificate = currentFitnessCertificate(certificates);
  const flagged = findings.filter(
    (item) => item.threshold_flag && item.threshold_flag !== "none",
  ).length;
  const openIod = iodCases.filter((item) => item.status === "open").length;

  return [
    {
      key: "exam",
      label: "Examination",
      detail: examinationCount > 0 ? pluralize(examinationCount, "examination") : "Start here",
      tab: "exam",
      isDone: examinationCount > 0,
      isOptional: false,
    },
    {
      key: "findings",
      label: "Findings",
      detail:
        findings.length === 0
          ? "Optional"
          : flagged > 0
            ? `${pluralize(findings.length, "result")}, ${flagged} flagged`
            : pluralize(findings.length, "result"),
      tab: "findings",
      isDone: findings.length > 0,
      isOptional: true,
    },
    {
      key: "fitness",
      label: "Fitness decision",
      detail: latest ? formatFitnessOutcome(latest.outcome) : "Not decided",
      tab: "fitness",
      isDone: Boolean(latest),
      isOptional: false,
    },
    {
      key: "certificate",
      label: "Certificate",
      detail: certificate
        ? certificate.valid_to
          ? `Valid to ${formatOhDate(certificate.valid_to)}`
          : `Valid from ${formatOhDate(certificate.valid_from)}`
        : "Not issued",
      tab: "fitness",
      isDone: Boolean(certificate),
      isOptional: false,
    },
    {
      key: "iod",
      label: "Injury on duty",
      detail:
        iodCases.length === 0
          ? "Only if work-related injury"
          : openIod > 0
            ? `${openIod} open`
            : pluralize(iodCases.length, "case"),
      tab: "iod",
      isDone: iodCases.length > 0,
      isOptional: true,
    },
  ];
}

export function OhEncounterProgress({
  activeTab,
  onSelectTab,
  ...data
}: OhEncounterProgressProps) {
  const steps = buildSteps(data);
  const nextStep = steps.find((step) => !step.isOptional && !step.isDone);

  return (
    <div data-testid="oh-encounter-progress">
      <p className="mb-2 text-xs text-dash-muted" data-testid="oh-encounter-next-step">
        {nextStep ? (
          <>
            Next: <span className="font-medium text-brand-navy">{nextStep.label}</span>
          </>
        ) : (
          <span className="font-medium text-emerald-700">
            Required steps complete
          </span>
        )}
      </p>
      <ol className="-mx-2 space-y-0.5">
        {steps.map((step) => {
          const isNext = step.key === nextStep?.key;
          const isCurrentTab = step.tab === activeTab;

          return (
            <li key={step.key}>
              <button
                type="button"
                onClick={() => onSelectTab(step.tab)}
                className={cn(
                  "group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-slate-50",
                  isCurrentTab && "bg-slate-50",
                )}
                data-testid={`oh-progress-step-${step.key}`}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                    step.isDone
                      ? "border-brand-primary bg-brand-primary text-white"
                      : isNext
                        ? "border-brand-primary bg-white text-brand-primary"
                        : "border-dashed border-dash-border bg-white text-dash-muted",
                  )}
                  aria-hidden="true"
                >
                  {step.isDone ? <Check className="size-3" strokeWidth={3} /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-[13px] leading-tight",
                      isNext ? "font-semibold text-brand-navy" : "font-medium text-brand-navy",
                    )}
                  >
                    {step.label}
                  </span>
                  <span className="block truncate text-xs text-dash-muted">
                    {step.detail}
                  </span>
                </span>
                <ChevronRight
                  className="size-3.5 shrink-0 text-dash-muted opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
                <span className="sr-only">
                  {step.isDone ? "Done" : isNext ? "Next step" : "Not done"}. Open{" "}
                  {step.tab} tab.
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
