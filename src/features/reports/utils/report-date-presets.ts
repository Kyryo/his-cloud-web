export type ReportDatePresetId =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "year_to_date";

export type ReportDatePreset = {
  id: ReportDatePresetId;
  label: string;
  dateFrom: string;
  dateTo: string;
};

export type ReportSingleDatePreset = {
  id: "today" | "end_of_last_month" | "end_of_last_quarter";
  label: string;
  date: string;
};

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getReportDatePresets(referenceDate = new Date()): ReportDatePreset[] {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const date = referenceDate.getDate();

  // 1. Today
  const todayStr = formatLocalDate(referenceDate);

  // 2. Yesterday
  const yesterday = new Date(year, month, date - 1);
  const yesterdayStr = formatLocalDate(yesterday);

  // 3. Last 7 days
  const last7DaysStart = new Date(year, month, date - 6);
  const last7DaysStr = formatLocalDate(last7DaysStart);

  // 4. This month (1st of month to today)
  const thisMonthStart = new Date(year, month, 1);
  const thisMonthStartStr = formatLocalDate(thisMonthStart);

  // 5. Last month (1st of last month to last day of last month)
  const lastMonthStart = new Date(year, month - 1, 1);
  const lastMonthEnd = new Date(year, month, 0);

  // 6. This quarter (start of quarter to today)
  const quarterMonthStart = Math.floor(month / 3) * 3;
  const quarterStart = new Date(year, quarterMonthStart, 1);

  // 7. Year to date (Jan 1 of this year to today)
  const ytdStart = new Date(year, 0, 1);

  return [
    {
      id: "today",
      label: "Today",
      dateFrom: todayStr,
      dateTo: todayStr,
    },
    {
      id: "yesterday",
      label: "Yesterday",
      dateFrom: yesterdayStr,
      dateTo: yesterdayStr,
    },
    {
      id: "last_7_days",
      label: "Last 7 days",
      dateFrom: last7DaysStr,
      dateTo: todayStr,
    },
    {
      id: "this_month",
      label: "This month",
      dateFrom: thisMonthStartStr,
      dateTo: todayStr,
    },
    {
      id: "last_month",
      label: "Last month",
      dateFrom: formatLocalDate(lastMonthStart),
      dateTo: formatLocalDate(lastMonthEnd),
    },
    {
      id: "this_quarter",
      label: "This quarter",
      dateFrom: formatLocalDate(quarterStart),
      dateTo: todayStr,
    },
    {
      id: "year_to_date",
      label: "Year to date",
      dateFrom: formatLocalDate(ytdStart),
      dateTo: todayStr,
    },
  ];
}

export function getReportSingleDatePresets(
  referenceDate = new Date(),
): ReportSingleDatePreset[] {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  const todayStr = formatLocalDate(referenceDate);
  const lastMonthEnd = new Date(year, month, 0);
  const quarterMonthStart = Math.floor(month / 3) * 3;
  const lastQuarterEnd = new Date(year, quarterMonthStart, 0);

  return [
    {
      id: "today",
      label: "Today",
      date: todayStr,
    },
    {
      id: "end_of_last_month",
      label: "End of last month",
      date: formatLocalDate(lastMonthEnd),
    },
    {
      id: "end_of_last_quarter",
      label: "End of last quarter",
      date: formatLocalDate(lastQuarterEnd),
    },
  ];
}

export function formatDateRangeSummary(
  dateFrom?: string,
  dateTo?: string,
): string | null {
  if (!dateFrom && !dateTo) {
    return null;
  }

  if (dateFrom && dateTo) {
    if (dateFrom === dateTo) {
      return `For ${dateFrom}`;
    }

    const start = new Date(`${dateFrom}T00:00:00`);
    const end = new Date(`${dateTo}T00:00:00`);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;

    if (diffDays > 0) {
      return `${dateFrom} to ${dateTo} (${diffDays} day${diffDays === 1 ? "" : "s"})`;
    }

    return `${dateFrom} to ${dateTo}`;
  }

  if (dateFrom) {
    return `From ${dateFrom}`;
  }

  return `Until ${dateTo}`;
}
