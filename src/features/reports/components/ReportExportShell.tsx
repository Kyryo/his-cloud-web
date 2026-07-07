"use client";

import { ReportExportPill } from "@/features/reports/components/ReportExportPill";
import { ReportExportSheet } from "@/features/reports/components/ReportExportSheet";
import { ReportExportProvider } from "@/features/reports/providers/report-export-provider";

export function ReportExportShell({ children }: { children: React.ReactNode }) {
  return (
    <ReportExportProvider>
      {children}
      <ReportExportSheet />
      <ReportExportPill />
    </ReportExportProvider>
  );
}
