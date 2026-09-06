import type {
  ReportCatalogItem,
  ReportFilterField,
} from "@/features/reports/constants/report-catalog";

export type ReportDateFieldGroup =
  | { kind: "range"; from: ReportFilterField; to: ReportFilterField }
  | { kind: "single"; field: ReportFilterField }
  | { kind: "none" };

/** Collapses a report's date filters into one logical control. */
export function groupReportDateFields(
  fields: ReportFilterField[],
): ReportDateFieldGroup {
  const dateFields = fields.filter((field) => field.type === "date");
  if (dateFields.length >= 2) {
    return { kind: "range", from: dateFields[0], to: dateFields[1] };
  }
  if (dateFields.length === 1) {
    return { kind: "single", field: dateFields[0] };
  }
  return { kind: "none" };
}

/** Short labels describing how a report can be sliced, for catalog tiles. */
export function describeReportFilterChips(item: ReportCatalogItem): string[] {
  const chips: string[] = [];
  const dateGroup = groupReportDateFields(item.filters);

  if (dateGroup.kind === "range") {
    chips.push("Date range");
  } else if (dateGroup.kind === "single") {
    chips.push(dateGroup.field.label);
  }

  for (const field of item.filters) {
    if (field.type !== "date") {
      chips.push(field.label);
    }
  }

  return chips;
}

export function formatReportDateLabel(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function describeReportPeriod(
  item: ReportCatalogItem,
  values: Record<string, string>,
): string {
  const dateGroup = groupReportDateFields(item.filters);

  if (dateGroup.kind === "single") {
    const value = values[dateGroup.field.name];
    return value ? `As of ${formatReportDateLabel(value)}` : "Not set";
  }

  if (dateGroup.kind === "none") {
    return "All time";
  }

  const from = values[dateGroup.from.name];
  const to = values[dateGroup.to.name];

  if (!from && !to) {
    return "All time";
  }
  if (from && !to) {
    return `From ${formatReportDateLabel(from)}`;
  }
  if (!from && to) {
    return `Until ${formatReportDateLabel(to)}`;
  }
  if (from === to) {
    return formatReportDateLabel(from);
  }
  return `${formatReportDateLabel(from)} to ${formatReportDateLabel(to)}`;
}

export type ReportActiveFilter = {
  name: string;
  label: string;
  value: string;
};

/** Non-date filters the user has narrowed, with human-readable values. */
export function listActiveReportFilters(
  item: ReportCatalogItem,
  values: Record<string, string>,
): ReportActiveFilter[] {
  const active: ReportActiveFilter[] = [];

  for (const field of item.filters) {
    if (field.type === "date") {
      continue;
    }
    const raw = values[field.name]?.trim();
    if (!raw) {
      continue;
    }

    const optionLabel = field.options?.find(
      (option) => option.value === raw,
    )?.label;

    active.push({
      name: field.name,
      label: field.label,
      value: optionLabel ?? (field.type === "resource" ? "1 selected" : raw),
    });
  }

  return active;
}

export function formatReportTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatReportFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 KB";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  }
  const mb = kb / 1024;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}
