import type { AdvisorFinding } from "@/features/claims/types/claims.types";

export type AdvisorEvidenceLine = {
  id?: string;
  description: string;
  procedureCode: string | null;
  category: string | null;
  units: number | null;
  allowedPatientGenders: string[];
  minAgeYears: number | null;
  maxAgeYears: number | null;
  chargeAmount: string | null;
  tariffAmount: string | null;
};

export type AdvisorFindingEvidenceDisplay = {
  contextLabel: string | null;
  coverageCitation: string | null;
  lines: Array<{
    key: string;
    summary: string;
    description: string;
    procedureCode: string | null;
    category: string | null;
    detailParts: string[];
  }>;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((entry) => asString(entry))
    .filter((entry): entry is string => Boolean(entry));
}

function parseEvidenceLine(raw: unknown, index: number): AdvisorEvidenceLine | null {
  const line = asRecord(raw);
  if (!line) {
    return null;
  }

  const tariff = asRecord(line.tariff) ?? {};
  const description =
    asString(line.description) ??
    asString(tariff.description) ??
    asString(line.procedure_code) ??
    asString(tariff.code) ??
    `Line ${index + 1}`;

  return {
    id: asString(line.id) ?? undefined,
    description,
    procedureCode: asString(line.procedure_code) ?? asString(tariff.code),
    category: asString(line.category) ?? asString(tariff.category),
    units: asNumber(line.units),
    allowedPatientGenders: asStringArray(tariff.category_allowed_patient_genders),
    minAgeYears: asNumber(tariff.category_min_age_years),
    maxAgeYears: asNumber(tariff.category_max_age_years),
    chargeAmount: asString(line.charge_amount) ?? asString(line.line_total),
    tariffAmount: asString(tariff.amount),
  };
}

function collectEvidenceLines(evidence: Record<string, unknown>): AdvisorEvidenceLine[] {
  const buckets = [evidence.violating_lines, evidence.over_tariff];
  const lines: AdvisorEvidenceLine[] = [];

  for (const bucket of buckets) {
    if (!Array.isArray(bucket)) {
      continue;
    }
    bucket.forEach((entry, index) => {
      const parsed = parseEvidenceLine(entry, index);
      if (parsed) {
        lines.push(parsed);
      }
    });
  }

  return lines;
}

function formatAgeBounds(line: AdvisorEvidenceLine): string | null {
  if (line.minAgeYears != null && line.maxAgeYears != null) {
    return `ages ${line.minAgeYears}–${line.maxAgeYears}`;
  }
  if (line.minAgeYears != null) {
    return `min age ${line.minAgeYears}`;
  }
  if (line.maxAgeYears != null) {
    return `max age ${line.maxAgeYears}`;
  }
  return null;
}

function formatLineDetailParts(
  line: AdvisorEvidenceLine,
  evidence: Record<string, unknown>,
): string[] {
  const parts: string[] = [];

  if (line.category) {
    parts.push(`Category ${line.category}`);
  }

  const patientGender = asString(evidence.patient_gender);
  if (patientGender && line.allowedPatientGenders.length > 0) {
    parts.push(
      `Patient ${patientGender} · allowed ${line.allowedPatientGenders.join(", ")}`,
    );
  } else if (patientGender) {
    parts.push(`Patient ${patientGender}`);
  }

  const patientAge = asNumber(evidence.patient_age_years);
  const ageBounds = formatAgeBounds(line);
  if (patientAge != null && ageBounds) {
    parts.push(`Patient age ${patientAge} · ${ageBounds}`);
  } else if (patientAge != null) {
    parts.push(`Patient age ${patientAge}`);
  } else if (ageBounds) {
    parts.push(ageBounds);
  }

  const maxUnits = asNumber(evidence.max_units);
  if (maxUnits != null && line.units != null) {
    parts.push(`Units ${line.units} · max ${maxUnits}`);
  } else if (line.units != null && line.units > 1) {
    parts.push(`Units ${line.units}`);
  }

  if (
    line.chargeAmount &&
    line.tariffAmount &&
    line.chargeAmount !== line.tariffAmount
  ) {
    parts.push(`Charged ${line.chargeAmount} · tariff ${line.tariffAmount}`);
  }

  return parts;
}

function formatLineSummary(
  line: AdvisorEvidenceLine,
  evidence: Record<string, unknown>,
): string {
  const parts: string[] = [line.description];

  if (line.procedureCode) {
    parts[0] = `${line.description} (${line.procedureCode})`;
  }

  if (line.category) {
    parts.push(`category ${line.category}`);
  }

  const patientGender = asString(evidence.patient_gender);
  if (patientGender && line.allowedPatientGenders.length > 0) {
    parts.push(
      `patient ${patientGender}, allowed ${line.allowedPatientGenders.join(", ")}`,
    );
  } else if (patientGender) {
    parts.push(`patient ${patientGender}`);
  }

  const patientAge = asNumber(evidence.patient_age_years);
  const ageBounds = formatAgeBounds(line);
  if (patientAge != null && ageBounds) {
    parts.push(`patient age ${patientAge}, ${ageBounds}`);
  } else if (patientAge != null) {
    parts.push(`patient age ${patientAge}`);
  } else if (ageBounds) {
    parts.push(ageBounds);
  }

  const maxUnits = asNumber(evidence.max_units);
  if (maxUnits != null && line.units != null) {
    parts.push(`units ${line.units} (max ${maxUnits})`);
  } else if (line.units != null && line.units > 1) {
    parts.push(`units ${line.units}`);
  }

  if (
    line.chargeAmount &&
    line.tariffAmount &&
    line.chargeAmount !== line.tariffAmount
  ) {
    parts.push(`charged ${line.chargeAmount}, tariff ${line.tariffAmount}`);
  }

  return parts.join(" · ");
}

function formatCoverageCitation(evidence: Record<string, unknown>): string | null {
  const coverage = evidence.coverage_section;
  if (typeof coverage === "string" && coverage.trim()) {
    return coverage.trim();
  }
  const record = asRecord(coverage);
  if (!record) {
    return null;
  }
  const packName = asString(record.pack_name) ?? asString(record.pack_code);
  const title = asString(record.title) ?? asString(record.section_title) ?? asString(record.id);
  if (packName && title) {
    return `${packName} · ${title}`;
  }
  return packName ?? title;
}

function formatContextLabel(evidence: Record<string, unknown>): string | null {
  const parts: string[] = [];
  const patientGender = asString(evidence.patient_gender);
  if (patientGender) {
    parts.push(`Patient: ${patientGender}`);
  }
  const patientAge = asNumber(evidence.patient_age_years);
  if (patientAge != null) {
    parts.push(`Age: ${patientAge}`);
  }
  const maxUnits = asNumber(evidence.max_units);
  if (maxUnits != null && !asString(evidence.patient_gender) && patientAge == null) {
    parts.push(`Max units: ${maxUnits}`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function getAdvisorFindingEvidenceDisplay(
  finding: Pick<AdvisorFinding, "evidence">,
): AdvisorFindingEvidenceDisplay | null {
  const evidence = asRecord(finding.evidence);
  if (!evidence) {
    return null;
  }

  const lines = collectEvidenceLines(evidence);
  const coverageCitation = formatCoverageCitation(evidence);
  if (lines.length === 0 && !coverageCitation) {
    return null;
  }

  return {
    contextLabel: formatContextLabel(evidence),
    coverageCitation,
    lines: lines.map((line, index) => ({
      key: line.id ?? `${line.procedureCode ?? "line"}-${index}`,
      summary: formatLineSummary(line, evidence),
      description: line.description,
      procedureCode: line.procedureCode,
      category: line.category,
      detailParts: formatLineDetailParts(line, evidence),
    })),
  };
}
