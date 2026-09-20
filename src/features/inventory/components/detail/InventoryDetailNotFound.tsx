import { DetailPageNotFound } from "@/features/app-shell/components/page-layout";

type InventoryDetailNotFoundProps = {
  title: string;
  message?: string;
};

export function InventoryDetailNotFound({
  title,
  message = "This record could not be loaded.",
}: InventoryDetailNotFoundProps) {
  return <DetailPageNotFound title={title} message={message} />;
}
