import type {
  AdvisorFinding,
  AdvisorFindingSource,
  ClaimAdvisoryClearance,
} from "@/features/claims/types/claims.types";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function asAdvisorFinding(value: unknown): AdvisorFinding | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }
  const code = asString(record.code).trim();
  const message = asString(record.message).trim();
  if (!code || !message) {
    return null;
  }
  const evidence = asRecord(record.evidence) ?? undefined;
  const remediationRecord = asRecord(record.remediation);
  const source = asString(record.source).trim();
  return {
    code,
    name: asString(record.name).trim() || code,
    severity: asString(record.severity).trim() || "warning",
    category: asString(record.category).trim() || "medical_necessity",
    message,
    recommended_action: asString(record.recommended_action).trim() || undefined,
    requires_ai_review:
      typeof record.requires_ai_review === "boolean"
        ? record.requires_ai_review
        : undefined,
    source:
      source === "iq" || source === "rules"
        ? (source as AdvisorFindingSource)
        : undefined,
    evidence,
    remediation: remediationRecord
      ? {
          resolved:
            typeof remediationRecord.resolved === "boolean"
              ? remediationRecord.resolved
              : undefined,
          resolution:
            remediationRecord.resolution === "model" ||
            remediationRecord.resolution === "heuristic"
              ? remediationRecord.resolution
              : undefined,
          targets: Array.isArray(remediationRecord.targets)
            ? (remediationRecord.targets as NonNullable<
                AdvisorFinding["remediation"]
              >["targets"])
            : [],
        }
      : undefined,
  };
}

export function withAdvisorFindingSource(
  findings: AdvisorFinding[],
  source: AdvisorFindingSource,
): AdvisorFinding[] {
  return findings.map((finding) => ({ ...finding, source }));
}

export function mergeAdvisorFindings(
  ruleFindings: AdvisorFinding[],
  iqFindings: AdvisorFinding[],
): AdvisorFinding[] {
  return [
    ...withAdvisorFindingSource(ruleFindings, "rules"),
    ...withAdvisorFindingSource(iqFindings, "iq"),
  ];
}

export function asAdvisorFindings(value: unknown): AdvisorFinding[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => asAdvisorFinding(item))
    .filter((item): item is AdvisorFinding => item != null);
}

export function isAdvisorFindingCleared(
  finding: Pick<AdvisorFinding, "code" | "source">,
  clearances: ClaimAdvisoryClearance[] | undefined,
): boolean {
  if (!clearances?.length) {
    return false;
  }
  const source = finding.source ?? "rules";
  return clearances.some(
    (item) =>
      item.finding_code === finding.code && item.finding_source === source,
  );
}

export function partitionAdvisorFindings(
  findings: AdvisorFinding[],
  clearances: ClaimAdvisoryClearance[] | undefined,
): { open: AdvisorFinding[]; cleared: AdvisorFinding[] } {
  const open: AdvisorFinding[] = [];
  const cleared: AdvisorFinding[] = [];
  for (const finding of findings) {
    if (isAdvisorFindingCleared(finding, clearances)) {
      cleared.push(finding);
    } else {
      open.push(finding);
    }
  }
  return { open, cleared };
}
