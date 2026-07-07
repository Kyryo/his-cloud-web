"use client";

import {
  AlertCircle,
  CheckCircle2,
  Download,
  Loader2,
  Minimize2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ReportFilterForm } from "@/features/reports/components/ReportFilterForm";
import { getReportCatalogItem } from "@/features/reports/constants/report-catalog";
import { useReportExport } from "@/features/reports/providers/report-export-provider";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export function ReportExportSheet() {
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

  return (
    <Sheet open={isOpen} onOpenChange={handleAsideOpenChange}>
      <SheetContent
        className={cn("flex w-full flex-col gap-0 p-0 sm:max-w-md", appFont.className)}
        data-testid="report-export-sheet"
      >
        {session && catalogItem ? (
          <>
            <SheetHeader className="border-b border-brand-border px-6 py-5">
              <SheetTitle>{session.reportTitle}</SheetTitle>
              <SheetDescription>{catalogItem.description}</SheetDescription>
            </SheetHeader>

            {session.phase === "filters" ? (
              <>
                <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                  <ReportFilterForm
                    fields={catalogItem.filters}
                    values={session.filterValues}
                    onChange={setFilterValue}
                  />
                </div>
                <SheetFooter className="mt-0 border-t border-brand-border px-6 py-5">
                  <Button
                    type="button"
                    className="w-full"
                    disabled={isSubmitting}
                    onClick={() => void startExport()}
                    data-testid="report-export-submit"
                  >
                    Export CSV
                  </Button>
                </SheetFooter>
              </>
            ) : null}

            {session.phase === "exporting" ? (
              <div className="flex flex-1 flex-col px-6 py-8">
                <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                  <Loader2
                    className="size-10 animate-spin text-brand-primary"
                    aria-hidden="true"
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-brand-navy">
                      Export is in progress
                    </p>
                    <p className="text-sm text-brand-muted">
                      It&apos;s safe to minimize this panel — the export continues in
                      the background. You&apos;ll be notified when it&apos;s done.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={minimizeExport}
                  data-testid="report-export-minimize"
                >
                  <Minimize2 className="size-4" aria-hidden="true" />
                  Minimize
                </Button>
              </div>
            ) : null}

            {session.phase === "success" ? (
              <div className="flex flex-1 flex-col px-6 py-8">
                <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                  <CheckCircle2
                    className="size-10 text-emerald-600"
                    aria-hidden="true"
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-brand-navy">Export ready</p>
                    <p className="text-sm text-brand-muted">
                      Your CSV export finished successfully
                      {session.job?.row_count
                        ? ` with ${session.job.row_count.toLocaleString()} rows`
                        : ""}
                      .
                    </p>
                  </div>
                </div>
                <SheetFooter className="mt-0 flex-col gap-2 sm:flex-col">
                  <Button
                    type="button"
                    className="w-full"
                    onClick={downloadExport}
                    data-testid="report-export-download"
                  >
                    <Download className="size-4" aria-hidden="true" />
                    Download CSV
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={dismissSession}
                  >
                    Close
                  </Button>
                </SheetFooter>
              </div>
            ) : null}

            {session.phase === "error" ? (
              <div className="flex flex-1 flex-col px-6 py-8">
                <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                  <AlertCircle
                    className="size-10 text-destructive"
                    aria-hidden="true"
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-brand-navy">
                      Export failed
                    </p>
                    <p className="text-sm text-brand-muted">
                      {session.errorMessage ??
                        "Something went wrong while generating your export."}
                    </p>
                  </div>
                </div>
                <SheetFooter className="mt-0 flex-col gap-2 sm:flex-col">
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => void retryExport()}
                    disabled={isSubmitting}
                    data-testid="report-export-retry"
                  >
                    Try again
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={dismissSession}
                  >
                    Close
                  </Button>
                </SheetFooter>
              </div>
            ) : null}
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
