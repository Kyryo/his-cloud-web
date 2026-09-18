import type { ReactNode } from "react";

import { LabOrderDetailPage } from "@/features/laboratory/pages/LabOrderDetailPage";

type LabOrderDetailLayoutProps = {
  children: ReactNode;
  tab: ReactNode;
  params: Promise<{ orderUuid: string }>;
};

export default async function LabOrderDetailLayout({
  tab,
  params,
}: LabOrderDetailLayoutProps) {
  const { orderUuid } = await params;

  return (
    <LabOrderDetailPage orderUuid={orderUuid}>{tab}</LabOrderDetailPage>
  );
}
