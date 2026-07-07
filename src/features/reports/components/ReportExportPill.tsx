"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { useReportExport } from "@/features/reports/providers/report-export-provider";
import { cn } from "@/lib/utils";

export function ReportExportPill() {
  const { session, showPill, handlePillClick } = useReportExport();

  if (!showPill || !session) {
    return null;
  }

  const isExporting = session.phase === "exporting";
  const isSuccess = session.phase === "success";
  const isError = session.phase === "error";

  let label = `Exporting ${session.reportTitle}…`;
  if (isSuccess) {
    label = "Export ready — click to download";
  } else if (isError) {
    label = "Export failed — click to retry";
  }

  return (
    <button
      type="button"
      onClick={handlePillClick}
      className={cn(
        "fixed bottom-6 right-6 z-40 flex max-w-sm items-center gap-2.5 rounded-full border border-brand-border bg-white px-4 py-2.5 text-left shadow-lg transition-colors",
        "hover:border-brand-primary/40 hover:bg-brand-tint/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30",
      )}
      data-testid="report-export-pill"
      aria-live="polite"
    >
      {isExporting ? (
        <Loader2 className="size-4 shrink-0 animate-spin text-brand-primary" aria-hidden="true" />
      ) : null}
      {isSuccess ? (
        <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
      ) : null}
      {isError ? (
        <AlertCircle className="size-4 shrink-0 text-destructive" aria-hidden="true" />
      ) : null}
      <span className="truncate text-sm font-medium text-brand-navy">{label}</span>
    </button>
  );
}
