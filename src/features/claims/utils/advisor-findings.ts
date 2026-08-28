import type {
  AdvisorFinding,
  AdvisorFindingSource,
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
    evidence,
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
