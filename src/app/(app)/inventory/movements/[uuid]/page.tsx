import { MovementDetailPage } from "@/features/inventory/pages/MovementDetailPage";

type PageProps = {
  params: Promise<{ uuid: string }>;
};

export default async function Page({ params }: PageProps) {
  const { uuid } = await params;
  return <MovementDetailPage movementUuid={uuid} />;
}
