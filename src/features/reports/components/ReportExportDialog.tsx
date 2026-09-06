"use client";

import { AlertCircle, Check, Loader2 } from "lucide-react";

import { AppIcon } from "@/components/icons/app-icon";
import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { ReportExportSummaryRail } from "@/features/reports/components/ReportExportSummaryRail";
import { ReportFilterForm } from "@/features/reports/components/ReportFilterForm";
import {
  getReportCatalogItem,
  type ReportCatalogItem,
} from "@/features/reports/constants/report-catalog";
import { useReportExport } from "@/features/reports/providers/report-export-provider";
import type { ReportJob } from "@/features/reports/types/report-job.types";
import { formatReportFileSize } from "@/features/reports/utils/report-export-summary";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const EXPORT_STAGES = ["Queued", "Generating", "Ready"] as const;

function stageIndexForJob(job: ReportJob | null): number {
  if (!job || job.status === "queued") {
    return 0;
  }
  if (job.status === "running") {
    return 1;
  }
  return 2;
}

function ExportProgressPanel({
  item,
  job,
}: {
  item: ReportCatalogItem;
  job: ReportJob | null;
}) {
  const activeIndex = stageIndexForJob(job);

  return (
    <div className="space-y-6" data-testid="report-export-progress">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-tint text-brand-primary">
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold text-brand-navy">
            Generating {item.title.toLowerCase()}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-brand-muted">
            You can minimize this and keep working. We will let you know the
            moment the file is ready.
          </p>
        </div>
      </div>

      <div
        className="h-1.5 overflow-hidden rounded-full bg-brand-tint"
        role="progressbar"
        aria-label="Export progress"
        aria-valuetext={EXPORT_STAGES[activeIndex]}
      >
        <div className="h-full w-1/3 rounded-full bg-brand-primary animate-report-progress" />
      </div>

      <ol className="grid grid-cols-3 gap-3">
        {EXPORT_STAGES.map((stage, index) => {
          const isDone = index < activeIndex;
          const isActive = index === activeIndex;
          return (
            <li key={stage} className="space-y-2">
              <div
                className={cn(
                  "h-1 rounded-full transition-colors",
                  isDone || isActive ? "bg-brand-primary" : "bg-dash-border",
                )}
              />
              <p
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium",
                  isActive
                    ? "text-brand-navy"
                    : isDone
                      ? "text-brand-primary"
                      : "text-brand-muted/70",
                )}
                aria-current={isActive ? "step" : undefined}
              >
                {isDone ? <Check className="size-3" aria-hidden="true" /> : null}
                {stage}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ExportReadyPanel({ job }: { job: ReportJob | null }) {
  const stats = [
    { label: "Rows", value: (job?.row_count ?? 0).toLocaleString() },
    { label: "Size", value: formatReportFileSize(job?.file_size ?? 0) },
    { label: "Format", value: (job?.file_format ?? "csv").toUpperCase() },
  ];

  return (
    <div className="space-y-6" data-testid="report-export-ready">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <Check className="size-5" strokeWidth={2.5} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold text-brand-navy">
            Your file is ready
          </p>
          <p className="mt-1 truncate font-mono text-xs text-brand-muted">
            {job?.output_filename || "export.csv"}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-3 divide-x divide-dash-border/70 rounded-2xl border border-dash-border bg-dash-canvas/50">
        {stats.map((stat) => (
          <div key={stat.label} className="px-4 py-3">
            <dt className="text-[11px] font-medium text-brand-muted">
              {stat.label}
            </dt>
            <dd className="mt-0.5 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ExportFailedPanel({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-4" data-testid="report-export-failed">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-destructive">
        <AlertCircle className="size-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-base font-semibold text-brand-navy">
          The export did not finish
        </p>
        <p className="mt-1 text-sm leading-relaxed text-brand-muted">{message}</p>
      </div>
    </div>
  );
}

export function ReportExportDialog() {
  const {
    session,
    isSubmitting,
    handleAsideOpenChange,
    dismissSession,
    minimizeExport,
    setFilterValue,
    startExport,
    retryExport,
    downloadExport,
  } = useReportExport();

  const catalogItem = session ? getReportCatalogItem(session.reportId) : null;
  const isOpen = Boolean(session?.asideOpen);
  const phase = session?.phase ?? "filters";

  const footer =
    session && catalogItem ? (
      phase === "filters" ? (
        <>
          <SecondaryButton
            type="button"
            disabled={isSubmitting}
            onClick={() => handleAsideOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={isSubmitting}
            onClick={() => void startExport()}
            data-testid="report-export-submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Starting...
              </>
            ) : (
              "Export CSV"
            )}
          </PrimaryButton>
        </>
      ) : phase === "exporting" ? (
        <SecondaryButton
          type="button"
          onClick={minimizeExport}
          data-testid="report-export-minimize"
        >
          Minimize
        </SecondaryButton>
      ) : phase === "success" ? (
        <>
          <SecondaryButton type="button" onClick={dismissSession}>
            Close
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={downloadExport}
            data-testid="report-export-download"
          >
            Download CSV
          </PrimaryButton>
        </>
      ) : (
        <>
          <SecondaryButton type="button" onClick={dismissSession}>
            Close
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={() => void retryExport()}
            disabled={isSubmitting}
            data-testid="report-export-retry"
          >
            Try again
          </PrimaryButton>
        </>
      )
    ) : null;

  return (
    <SectionedDialog
      open={isOpen}
      onOpenChange={handleAsideOpenChange}
      title={
        catalogItem ? (
          <span className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand-primary">
              <AppIcon name={catalogItem.icon} size={16} />
            </span>
            <span className="truncate">{catalogItem.title}</span>
          </span>
        ) : (
          (session?.reportTitle ?? "Export report")
        )
      }
      description={
        catalogItem
          ? phase === "filters"
            ? "Pick a period, narrow it down if you need to, then export."
            : catalogItem.description
          : undefined
      }
      className={cn(appFont.className, "sm:max-w-3xl")}
      contentClassName="p-0"
      data-testid="report-export-dialog"
      footer={footer}
    >
      {session && catalogItem ? (
        <div className="grid sm:grid-cols-[15rem_minmax(0,1fr)]">
          <ReportExportSummaryRail
            item={catalogItem}
            values={session.filterValues}
            phase={phase}
          />

          <div className="px-6 py-6">
            {phase === "filters" ? (
              <ReportFilterForm
                fields={catalogItem.filters}
                values={session.filterValues}
                onChange={setFilterValue}
              />
            ) : null}

            {phase === "exporting" ? (
              <ExportProgressPanel item={catalogItem} job={session.job} />
            ) : null}

            {phase === "success" ? <ExportReadyPanel job={session.job} /> : null}

            {phase === "error" ? (
              <ExportFailedPanel
                message={
                  session.errorMessage ??
                  "Something went wrong while generating your export."
                }
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </SectionedDialog>
  );
}
