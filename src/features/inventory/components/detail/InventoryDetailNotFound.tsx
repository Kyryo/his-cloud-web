type InventoryDetailNotFoundProps = {
  title: string;
  message?: string;
};

export function InventoryDetailNotFound({
  title,
  message = "This record could not be loaded.",
}: InventoryDetailNotFoundProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6">
      <h1 className="text-lg font-semibold text-red-800">{title}</h1>
      <p className="mt-2 text-sm text-red-700">{message}</p>
    </div>
  );
}
