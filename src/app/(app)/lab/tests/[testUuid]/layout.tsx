import type { ReactNode } from "react";

import { LabTestDetailPage } from "@/features/laboratory/pages/LabTestDetailPage";

type LabTestDetailLayoutProps = {
  children: ReactNode;
  tab: ReactNode;
  params: Promise<{ testUuid: string }>;
};

export default async function LabTestDetailLayout({
  tab,
  params,
}: LabTestDetailLayoutProps) {
  const { testUuid } = await params;

  return <LabTestDetailPage testUuid={testUuid}>{tab}</LabTestDetailPage>;
}
