import type { ReactNode } from "react";

import { CustomerDetailPage } from "@/features/customers/pages/CustomerDetailPage";

type CustomerDetailLayoutProps = {
  children: ReactNode;
  tab: ReactNode;
  params: Promise<{ customerId: string }>;
};

export default async function CustomerDetailLayout({
  tab,
  params,
}: CustomerDetailLayoutProps) {
  const { customerId } = await params;

  return <CustomerDetailPage customerId={customerId}>{tab}</CustomerDetailPage>;
}
