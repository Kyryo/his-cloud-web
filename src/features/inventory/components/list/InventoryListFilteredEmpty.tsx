import { Button } from "@/components/ui/button";

type InventoryListFilteredEmptyProps = {
  title: string;
  onClear: () => void;
};

export function InventoryListFilteredEmpty({
  title,
  onClear,
}: InventoryListFilteredEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dash-border py-14 text-center">
      <h2 className="text-base font-semibold text-brand-navy">{title}</h2>
      <p className="mt-1 text-sm text-brand-muted">
        Adjust your search or filters and try again.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={onClear}
      >
        Clear search & filters
      </Button>
    </div>
  );
}
