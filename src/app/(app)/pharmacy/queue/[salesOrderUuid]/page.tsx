import { PharmacyQueueDetailPage } from "@/features/dispensation/pages/PharmacyQueueDetailPage";

type PageProps = {
  params: Promise<{ salesOrderUuid: string }>;
};

export default async function Page({ params }: PageProps) {
  const { salesOrderUuid } = await params;
  return <PharmacyQueueDetailPage salesOrderUuid={salesOrderUuid} />;
}
