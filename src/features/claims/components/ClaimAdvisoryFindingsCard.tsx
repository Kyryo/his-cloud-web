"use client";

import { CheckCircle2, ChevronDown, Loader2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdvisorFinding } from "@/features/claims/types/claims.types";
import { getAdvisorFindingEvidenceDisplay } from "@/features/claims/utils/advisor-finding-evidence";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

function FindingFixDialog({
  finding,
  open,
  onOpenChange,
}: {
  finding: AdvisorFinding | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!finding) {
    return null;
  }

  const evidenceDisplay = getAdvisorFindingEvidenceDisplay(finding);
  const recommendedAction = finding.recommended_action?.trim() ?? "";
  const severityLabel =
    finding.severity === "rejection_risk"
      ? "Rejection risk"
      : finding.severity === "warning"
        ? "Warning"
        : "Advisory";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("gap-0 overflow-hidden p-0 sm:max-w-lg", appFont.className)}
        data-testid="claim-advisory-fix-dialog"
      >
        <DialogHeader className="border-b border-brand-border px-6 py-5">
          <div className="min-w-0 space-y-1.5 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                  finding.severity === "rejection_risk"
                    ? "bg-red-50 text-red-700"
                    : finding.severity === "warning"
                      ? "bg-amber-50 text-amber-800"
                      : "bg-slate-100 text-brand-slate",
                )}
              >
                {severityLabel}
              </span>
              <span className="font-mono text-[11px] text-brand-muted">
                {finding.code}
              </span>
            </div>
            <DialogTitle className="text-base leading-snug">
              {finding.name}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {finding.message}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          {recommendedAction ? (
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                How to resolve
              </h3>
              <div className="rounded-xl border border-brand-border bg-slate-50/80 px-4 py-3.5">
                <p className="text-sm leading-relaxed text-brand-navy">
                  {recommendedAction}
                </p>
              </div>
            </section>
          ) : null}

          {evidenceDisplay ? (
            <section
              className="space-y-2.5"
              data-testid="claim-advisory-finding-evidence"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                  Affected lines
                </h3>
                {evidenceDisplay.contextLabel ? (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-brand-slate">
                    {evidenceDisplay.contextLabel}
                  </span>
                ) : null}
              </div>
              <ul className="divide-y divide-brand-border overflow-hidden rounded-xl border border-brand-border bg-white">
                {evidenceDisplay.lines.map((line) => (
                  <li
                    key={line.key}
                    className="px-4 py-3.5"
                    data-testid="claim-advisory-finding-evidence-line"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-medium text-brand-navy">
                        {line.description}
                      </p>
                      {line.procedureCode ? (
                        <span className="font-mono text-xs text-brand-muted">
                          {line.procedureCode}
                        </span>
                      ) : null}
                    </div>
                    {line.detailParts.length > 0 ? (
                      <ul className="mt-2 space-y-1">
                        {line.detailParts.map((part) => (
                          <li
                            key={part}
                            className="text-xs leading-relaxed text-brand-slate"
                          >
                            {part}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {!recommendedAction && !evidenceDisplay ? (
            <p className="text-sm leading-relaxed text-brand-muted">
              Review this finding and update the claim or patient details before
              submitting.
            </p>
          ) : null}
        </div>

        <DialogFooter className="mt-0 border-t border-brand-border px-6 py-4">
          <SecondaryButton type="button" onClick={() => onOpenChange(false)}>
            Close
          </SecondaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function severityRank(severity: string): number {
  if (severity === "rejection_risk") return 0;
  if (severity === "warning") return 1;
  return 2;
}

function severityGroupLabel(severity: string): string {
  if (severity === "rejection_risk") return "Rejection risk";
  if (severity === "warning") return "Warnings";
  return "Other";
}

function sortFindingsBySeverity(findings: AdvisorFinding[]): AdvisorFinding[] {
  return [...findings].sort(
    (left, right) => severityRank(left.severity) - severityRank(right.severity),
  );
}

function groupFindingsBySeverity(
  findings: AdvisorFinding[],
): Array<{ severity: string; findings: AdvisorFinding[] }> {
  const groups = new Map<string, AdvisorFinding[]>();
  for (const finding of sortFindingsBySeverity(findings)) {
    const key =
      finding.severity === "rejection_risk" || finding.severity === "warning"
        ? finding.severity
        : "other";
    const list = groups.get(key) ?? [];
    list.push(finding);
    groups.set(key, list);
  }
  return Array.from(groups.entries()).map(([severity, groupFindings]) => ({
    severity,
    findings: groupFindings,
  }));
}

const MAX_VISIBLE_FINDINGS = 5;

function FindingsList({ findings }: { findings: AdvisorFinding[] }) {
  const [selectedFinding, setSelectedFinding] = useState<AdvisorFinding | null>(
    null,
  );
  const [showAll, setShowAll] = useState(false);
  const sorted = sortFindingsBySeverity(findings);
  const visible = showAll ? sorted : sorted.slice(0, MAX_VISIBLE_FINDINGS);
  const hiddenCount = Math.max(0, sorted.length - MAX_VISIBLE_FINDINGS);
  const groups = groupFindingsBySeverity(visible);

  return (
    <>
      <div>
        {groups.map((group, groupIndex) => (
          <section
            key={group.severity}
            aria-label={severityGroupLabel(group.severity)}
            className={groupIndex > 0 ? "mt-1" : undefined}
          >
            <div className="flex items-baseline justify-between gap-3 px-4 pb-2 pt-3.5">
              <h3
                className={cn(
                  "text-[11px] font-semibold tracking-wide",
                  group.severity === "rejection_risk"
                    ? "text-red-700"
                    : group.severity === "warning"
                      ? "text-amber-800"
                      : "text-brand-muted",
                )}
              >
                {severityGroupLabel(group.severity)}
              </h3>
              <span className="tabular-nums text-[11px] text-brand-muted">
                {group.findings.length}
              </span>
            </div>

            <ul className="divide-y divide-brand-border border-t border-brand-border">
              {group.findings.map((finding) => (
                <li
                  key={finding.code}
                  className="flex items-stretch"
                  data-testid={`claim-advisory-finding-${finding.code}`}
                >
                  <span
                    className={cn(
                      "w-1 shrink-0",
                      group.severity === "rejection_risk"
                        ? "bg-red-500"
                        : group.severity === "warning"
                          ? "bg-amber-500"
                          : "bg-slate-300",
                    )}
                    aria-hidden="true"
                  />
                  <div className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug text-brand-navy">
                        {finding.name}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-brand-muted">
                        {finding.message}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 shrink-0 rounded-full border-brand-navy/20 px-3.5 text-brand-navy hover:border-brand-navy hover:bg-brand-tint"
                      onClick={() => setSelectedFinding(finding)}
                      data-testid={`claim-advisory-fix-${finding.code}`}
                    >
                      Fix
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {hiddenCount > 0 ? (
          <div className="border-t border-brand-border px-4 py-3">
            <button
              type="button"
              className="text-xs font-medium text-brand-navy underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/25"
              onClick={() => setShowAll((current) => !current)}
              data-testid="claim-advisory-findings-show-more"
            >
              {showAll ? "Show fewer" : `Show ${hiddenCount} more`}
            </button>
          </div>
        ) : null}
      </div>

      <FindingFixDialog
        finding={selectedFinding}
        open={selectedFinding != null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedFinding(null);
          }
        }}
      />
    </>
  );
}

export type ClaimAdvisoryFindingsCardProps = {
  findings: AdvisorFinding[];
  onReEvaluate?: () => void;
  isReEvaluating?: boolean;
  /** Left-side footer actions (e.g. Edit draft, Record override). */
  footerActions?: ReactNode;
  /** Extra footer content below the action row (e.g. override note form). */
  footerContent?: ReactNode;
  className?: string;
};

/**
 * Reusable advisory findings card used on invoice Claim tab and claim detail.
 */
export function ClaimAdvisoryFindingsCard({
  findings,
  onReEvaluate,
  isReEvaluating = false,
  footerActions,
  footerContent,
  className,
}: ClaimAdvisoryFindingsCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(true);
  const rejectionCount = findings.filter(
    (finding) => finding.severity === "rejection_risk",
  ).length;
  const warningCount = findings.filter(
    (finding) => finding.severity === "warning",
  ).length;
  const otherCount = Math.max(0, findings.length - rejectionCount - warningCount);
  const allClear = findings.length === 0;
  const showFooter =
    Boolean(onReEvaluate) || Boolean(footerActions) || Boolean(footerContent);

  if (allClear) {
    return (
      <div className={cn("space-y-4", className)} data-testid="claim-advisory-findings">
        <div
          className="rounded-lg border border-dashed border-brand-border bg-slate-50/80 px-4 py-10 text-center"
          data-testid="claim-advisory-findings-empty"
        >
          <CheckCircle2
            className="mx-auto size-8 text-emerald-600"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm font-medium text-brand-navy">
            We did not find any advisory issues on this claim
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-brand-muted">
            Validation packs returned no rejection risks or warnings for the
            current claim data.
          </p>
          {onReEvaluate ? (
            <div className="mt-4 flex justify-center">
              <SecondaryButton
                type="button"
                size="sm"
                className="h-9 px-4"
                disabled={isReEvaluating}
                onClick={() => onReEvaluate()}
                data-testid="claim-evaluate-advisories-empty-button"
              >
                {isReEvaluating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Running advisories…
                  </>
                ) : (
                  "Run advisories again"
                )}
              </SecondaryButton>
            </div>
          ) : null}
        </div>

        {footerActions || footerContent ? (
          <div className="space-y-3">
            {footerActions ? (
              <div className="flex flex-wrap items-center gap-2">{footerActions}</div>
            ) : null}
            {footerContent}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-brand-border bg-white",
        className,
      )}
      data-testid="claim-advisory-findings"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-brand-navy">
            {findings.length} finding{findings.length === 1 ? "" : "s"}
          </span>
          <span className="hidden text-brand-border sm:inline" aria-hidden="true">
            ·
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {rejectionCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-1.5 py-0.5 text-[11px] font-medium text-red-700">
                <span className="size-1.5 rounded-full bg-red-500" aria-hidden="true" />
                {rejectionCount} rejection-risk
              </span>
            ) : null}
            {warningCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800">
                <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                {warningCount} warning{warningCount === 1 ? "" : "s"}
              </span>
            ) : null}
            {otherCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-brand-slate">
                {otherCount} other
              </span>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDetailsOpen((open) => !open)}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-brand-muted hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/25"
          aria-expanded={detailsOpen}
        >
          {detailsOpen ? "Hide" : "Show"}
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform",
              detailsOpen && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
      </div>

      {detailsOpen ? (
        <div className="border-t border-brand-border">
          <FindingsList findings={findings} />
        </div>
      ) : null}

      {showFooter ? (
        <div className="space-y-3 border-t border-brand-border bg-slate-50/60 px-4 py-3">
          {footerActions || onReEvaluate ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {footerActions}
              </div>
              {onReEvaluate ? (
                <SecondaryButton
                  type="button"
                  size="sm"
                  className="h-9 px-4"
                  disabled={isReEvaluating}
                  onClick={() => onReEvaluate()}
                  data-testid="claim-evaluate-advisories-button"
                >
                  {isReEvaluating ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Re-evaluating…
                    </>
                  ) : (
                    "Re-evaluate"
                  )}
                </SecondaryButton>
              ) : null}
            </div>
          ) : null}
          {footerContent}
        </div>
      ) : null}
    </div>
  );
}

/** @deprecated Prefer ClaimAdvisoryFindingsCard */
export const ClaimAdvisoryFindingsSection = ClaimAdvisoryFindingsCard;
