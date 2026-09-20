import type { ReactNode } from "react";

import { LabPanelDetailPage } from "@/features/laboratory/pages/LabPanelDetailPage";

type LabPanelDetailLayoutProps = {
  children: ReactNode;
  tab: ReactNode;
  params: Promise<{ panelUuid: string }>;
};

export default async function LabPanelDetailLayout({
  tab,
  params,
}: LabPanelDetailLayoutProps) {
  const { panelUuid } = await params;

  return <LabPanelDetailPage panelUuid={panelUuid}>{tab}</LabPanelDetailPage>;
}
