"use client";

import { ReportExportPill } from "@/features/reports/components/ReportExportPill";
import { ReportExportDialog } from "@/features/reports/components/ReportExportDialog";
import { ReportExportProvider } from "@/features/reports/providers/report-export-provider";

export function ReportExportShell({ children }: { children: React.ReactNode }) {
  return (
    <ReportExportProvider>
      {children}
      <ReportExportDialog />
      <ReportExportPill />
    </ReportExportProvider>
  );
}
