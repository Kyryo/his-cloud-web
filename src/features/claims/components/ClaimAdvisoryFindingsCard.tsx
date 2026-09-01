"use client";

import { CheckCircle2, ChevronDown, Loader2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import { FindingClearDialog } from "@/features/claims/components/advisory-fix/FindingClearDialog";
import { FindingFixDialog } from "@/features/claims/components/advisory-fix/FindingFixDialog";
import type {
  AdvisorFinding,
  ClaimAdvisoryClearance,
  ClaimDetail,
} from "@/features/claims/types/claims.types";
import { getAdvisorFindingEvidenceDisplay } from "@/features/claims/utils/advisor-finding-evidence";
import { advisoryFixTargetLabels } from "@/features/claims/utils/advisory-fix-actions";
import { partitionAdvisorFindings } from "@/features/claims/utils/advisor-findings";
import { cn } from "@/lib/utils";

function FindingSourceBadge({
  source,
}: {
  source: AdvisorFinding["source"];
}) {
  if (source == null) {
    return null;
  }
  const isIq = source === "iq";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        isIq ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-brand-slate",
      )}
      data-testid={isIq ? "claim-iq-badge" : "claim-rules-badge"}
      title={isIq ? "Claims intelligence" : "Payer rules"}
    >
      {isIq ? "IQ" : "Rules"}
    </span>
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

function isDraftClaim(claim: ClaimDetail | null | undefined): boolean {
  return String(claim?.status ?? "").toLowerCase() === "draft";
}

function formatClearanceTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const MAX_VISIBLE_FINDINGS = 5;

function FindingsList({
  findings,
  claim,
  canEdit,
  onClaimUpdated,
}: {
  findings: AdvisorFinding[];
  claim?: ClaimDetail | null;
  canEdit: boolean;
  onClaimUpdated?: (claim: ClaimDetail) => void;
}) {
  const [selectedFinding, setSelectedFinding] = useState<AdvisorFinding | null>(
    null,
  );
  const [clearingFinding, setClearingFinding] = useState<AdvisorFinding | null>(
    null,
  );
  const [showAll, setShowAll] = useState(false);
  const showFix = claim == null || canEdit;
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
              {group.findings.map((finding) => {
                const coverageCitation =
                  getAdvisorFindingEvidenceDisplay(finding)?.coverageCitation;
                const needsUpdate = advisoryFixTargetLabels(finding);
                return (
                  <li
                    key={`${finding.source ?? "rules"}-${finding.code}`}
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
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium leading-snug text-brand-navy">
                            {finding.name}
                          </p>
                          <FindingSourceBadge source={finding.source} />
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-brand-muted">
                          {finding.message}
                        </p>
                        {coverageCitation ? (
                          <p
                            className="mt-1 text-[11px] text-brand-slate"
                            data-testid="claim-advisory-coverage-citation"
                          >
                            {coverageCitation}
                          </p>
                        ) : null}
                        {needsUpdate.length > 0 ? (
                          <p
                            className="mt-1 text-[11px] text-brand-navy"
                            data-testid="claim-advisory-needs-update"
                          >
                            Needs update: {needsUpdate.join(", ")}
                          </p>
                        ) : null}
                      </div>
                      {showFix || canEdit ? (
                        <div className="flex shrink-0 items-center gap-2">
                          {canEdit ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-full border-brand-border px-3.5 text-brand-muted hover:border-brand-navy/30 hover:text-brand-navy"
                              onClick={() => setClearingFinding(finding)}
                              data-testid={`claim-advisory-clear-${finding.code}`}
                            >
                              Clear
                            </Button>
                          ) : null}
                          {showFix ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-full border-brand-navy/20 px-3.5 text-brand-navy hover:border-brand-navy hover:bg-brand-tint"
                              onClick={() => setSelectedFinding(finding)}
                              data-testid={`claim-advisory-fix-${finding.code}`}
                            >
                              Fix
                            </Button>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
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
        claim={claim}
        canEdit={canEdit}
        onApplied={onClaimUpdated}
      />
      {claim ? (
        <FindingClearDialog
          finding={clearingFinding}
          claim={claim}
          open={clearingFinding != null}
          onOpenChange={(open) => {
            if (!open) {
              setClearingFinding(null);
            }
          }}
          onCleared={onClaimUpdated}
        />
      ) : null}
    </>
  );
}

function ClearedFindingsGroup({
  clearances,
}: {
  clearances: ClaimAdvisoryClearance[];
}) {
  const [open, setOpen] = useState(false);
  if (clearances.length === 0) {
    return null;
  }

  return (
    <section
      className="border-t border-brand-border"
      data-testid="claim-advisory-cleared-group"
    >
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        data-testid="claim-advisory-cleared-toggle"
      >
        <span className="text-[11px] font-semibold tracking-wide text-brand-muted">
          Cleared
        </span>
        <span className="inline-flex items-center gap-2 text-[11px] text-brand-muted">
          <span className="tabular-nums">{clearances.length}</span>
          <ChevronDown
            className={cn("size-3.5 transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
        </span>
      </button>
      {open ? (
        <ul className="divide-y divide-brand-border border-t border-brand-border">
          {clearances.map((clearance) => (
            <li
              key={clearance.uuid || `${clearance.finding_source}-${clearance.finding_code}`}
              className="px-4 py-3"
              data-testid={`claim-advisory-cleared-${clearance.finding_code}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-brand-navy">
                  {clearance.finding_name || clearance.finding_code}
                </p>
                <span className="font-mono text-[11px] text-brand-muted">
                  {clearance.finding_code}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-brand-muted">
                {clearance.reason}
              </p>
              <p className="mt-1 text-[11px] text-brand-slate">
                {clearance.created_by != null ? `User ${clearance.created_by} · ` : ""}
                {formatClearanceTime(clearance.created_at)}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export type ClaimAdvisoryFindingsCardProps = {
  findings: AdvisorFinding[];
  claim?: ClaimDetail | null;
  onClaimUpdated?: (claim: ClaimDetail) => void;
  onReEvaluate?: () => void;
  isReEvaluating?: boolean;
  /** Left-side footer actions (e.g. Edit draft, Record override). */
  footerActions?: ReactNode;
  /** Extra footer content below the action row (e.g. override note form). */
  footerContent?: ReactNode;
  /** Status notice above findings (e.g. IQ review in progress). */
  notice?: ReactNode;
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  testId?: string;
};

/**
 * Reusable advisory findings card used on invoice Claim tab and claim detail.
 */
export function ClaimAdvisoryFindingsCard({
  findings,
  claim,
  onClaimUpdated,
  onReEvaluate,
  isReEvaluating = false,
  footerActions,
  footerContent,
  notice,
  className,
  emptyTitle = "We did not find any advisory issues on this claim",
  emptyDescription = "Validation packs returned no rejection risks or warnings for the current claim data.",
  testId = "claim-advisory-findings",
}: ClaimAdvisoryFindingsCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(true);
  const clearances = claim?.advisory_clearances ?? [];
  const { open: openFindings } = partitionAdvisorFindings(findings, clearances);
  const canEdit = isDraftClaim(claim);
  const rejectionCount = openFindings.filter(
    (finding) => finding.severity === "rejection_risk",
  ).length;
  const warningCount = openFindings.filter(
    (finding) => finding.severity === "warning",
  ).length;
  const otherCount = Math.max(
    0,
    openFindings.length - rejectionCount - warningCount,
  );
  const iqCount = openFindings.filter((finding) => finding.source === "iq").length;
  const allClear = openFindings.length === 0 && clearances.length === 0;
  const showFooter =
    Boolean(onReEvaluate) || Boolean(footerActions) || Boolean(footerContent);

  if (allClear) {
    return (
      <div className={cn("space-y-4", className)} data-testid={testId}>
        <div
          className="rounded-lg border border-dashed border-brand-border bg-slate-50/80 px-4 py-10 text-center"
          data-testid={`${testId}-empty`}
        >
          <CheckCircle2
            className="mx-auto size-8 text-emerald-600"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm font-medium text-brand-navy">{emptyTitle}</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-brand-muted">
            {emptyDescription}
          </p>
          {notice}
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
      data-testid={testId}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-brand-navy">
            {openFindings.length} finding{openFindings.length === 1 ? "" : "s"}
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
            {iqCount > 0 ? (
              <span
                className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[11px] font-medium text-indigo-700"
                data-testid="claim-iq-findings-count"
                title="Claims intelligence"
              >
                {iqCount} IQ
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
          {notice ? (
            <div className="border-b border-brand-border px-4 py-3">{notice}</div>
          ) : null}
          {openFindings.length > 0 ? (
            <FindingsList
              findings={openFindings}
              claim={claim}
              canEdit={canEdit}
              onClaimUpdated={onClaimUpdated}
            />
          ) : null}
          <ClearedFindingsGroup clearances={clearances} />
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
