import type { EncounterLabResult } from "@/features/clinical-opd/types/clinical-opd.types";
import type {
  OpdEncounterVitalStat,
  OpdVitalStatus,
} from "@/features/clinical-opd/utils/opd-encounter-vitals";

export type EncounterLabResultGroup = {
  key: string;
  /** Clinician-facing ordered product/panel title. */
  title: string;
  releasedAt: string | null;
  releasedByName: string | null;
  panelCode: string | null;
  results: EncounterLabResult[];
};

function flagToStatus(flag: string | null | undefined): OpdVitalStatus {
  const normalized = (flag ?? "").toUpperCase();
  if (
    normalized.includes("HIGH") ||
    normalized === "ABNORMAL" ||
    normalized === "CRITICAL"
  ) {
    return "high";
  }
  if (normalized.includes("LOW")) {
    return "low";
  }
  if (normalized === "NORMAL" || normalized === "") {
    return "normal";
  }
  return "unknown";
}

function formatAnalyteValue(
  analyte: EncounterLabResult["analytes"][number],
): string | null {
  if (analyte.value_numeric != null && analyte.value_numeric !== "") {
    return analyte.unit
      ? `${analyte.value_numeric} ${analyte.unit}`
      : analyte.value_numeric;
  }
  const text = analyte.value_text?.trim();
  if (!text) {
    return null;
  }
  return analyte.unit ? `${text} ${analyte.unit}` : text;
}

function groupKeyForResult(result: EncounterLabResult): string {
  if (result.visit_order_uuid) {
    return `vo:${result.visit_order_uuid}`;
  }
  if (result.panel_uuid) {
    return `panel:${result.panel_uuid}`;
  }
  return `item:${result.item_uuid}`;
}

function titleForResult(result: EncounterLabResult): string {
  return (
    result.ordered_name?.trim() ||
    result.panel_name?.trim() ||
    result.test_name ||
    result.test_code ||
    "Laboratory result"
  );
}

function latestReleaseMeta(results: EncounterLabResult[]): {
  releasedAt: string | null;
  releasedByName: string | null;
} {
  let latestAt: string | null = null;
  let releasedByName: string | null = null;
  for (const result of results) {
    if (!result.released_at) continue;
    if (
      !latestAt ||
      new Date(result.released_at).getTime() > new Date(latestAt).getTime()
    ) {
      latestAt = result.released_at;
      releasedByName = result.released_by_name?.trim() || null;
    }
  }
  return { releasedAt: latestAt, releasedByName };
}

/**
 * Groups released lab items under the product/panel the clinician ordered
 * (e.g. Full blood count), not each expanded LIS test.
 */
export function groupEncounterLabResults(
  results: EncounterLabResult[],
): EncounterLabResultGroup[] {
  const groups = new Map<string, EncounterLabResultGroup>();

  for (const result of results) {
    const key = groupKeyForResult(result);
    const existing = groups.get(key);
    if (existing) {
      existing.results.push(result);
      continue;
    }
    groups.set(key, {
      key,
      title: titleForResult(result),
      releasedAt: result.released_at,
      releasedByName: result.released_by_name?.trim() || null,
      panelCode: result.panel_code ?? null,
      results: [result],
    });
  }

  return [...groups.values()].map((group) => {
    const meta = latestReleaseMeta(group.results);
    return {
      ...group,
      releasedAt: meta.releasedAt,
      releasedByName: meta.releasedByName,
    };
  });
}

/**
 * Flattens a grouped order into vital-style rows: each test/analyte against
 * its value under the ordered product title.
 */
export function labResultGroupToVitalReadings(
  group: EncounterLabResultGroup,
): OpdEncounterVitalStat[] {
  const readings: OpdEncounterVitalStat[] = [];

  for (const result of group.results) {
    if (result.analytes.length === 0) {
      readings.push({
        key: result.item_uuid,
        label: result.test_name || result.test_code || "Result",
        value: null,
        recordedAt: result.released_at,
        status: "unknown",
      });
      continue;
    }

    // One analyte: show the ordered test name (HCT), not the panel title again.
    if (result.analytes.length === 1) {
      const analyte = result.analytes[0];
      readings.push({
        key: `${result.item_uuid}-${analyte.code}`,
        label: result.test_name || analyte.name || analyte.code,
        value: formatAnalyteValue(analyte),
        recordedAt: result.released_at,
        status: flagToStatus(analyte.flag),
      });
      continue;
    }

    for (const analyte of result.analytes) {
      readings.push({
        key: `${result.item_uuid}-${analyte.code}`,
        label: analyte.name || analyte.code,
        value: formatAnalyteValue(analyte),
        recordedAt: result.released_at,
        status: flagToStatus(analyte.flag),
      });
    }
  }

  return readings;
}

/** @deprecated Prefer groupEncounterLabResults + labResultGroupToVitalReadings */
export function labResultToVitalReadings(
  result: EncounterLabResult,
): OpdEncounterVitalStat[] {
  return labResultGroupToVitalReadings({
    key: `item:${result.item_uuid}`,
    title: titleForResult(result),
    releasedAt: result.released_at,
    releasedByName: result.released_by_name?.trim() || null,
    panelCode: result.panel_code ?? null,
    results: [result],
  });
}
