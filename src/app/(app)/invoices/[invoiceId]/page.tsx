import { InvoiceDetailPage } from "@/features/invoices/pages/InvoiceDetailPage";

type PageProps = {
  params: Promise<{ invoiceId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { invoiceId } = await params;
  return <InvoiceDetailPage invoiceId={invoiceId} />;
}
