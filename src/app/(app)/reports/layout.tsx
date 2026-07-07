import { ReportExportShell } from "@/features/reports/components/ReportExportShell";

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReportExportShell>{children}</ReportExportShell>;
}
