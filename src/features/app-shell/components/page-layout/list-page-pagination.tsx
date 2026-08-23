import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ListPagePaginationProps = {
  page: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
};

function buildPageItems(page: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) {
    items.push("ellipsis");
  }

  for (let number = start; number <= end; number += 1) {
    items.push(number);
  }

  if (end < totalPages - 1) {
    items.push("ellipsis");
  }

  items.push(totalPages);
  return items;
}

export function ListPagePagination({
  page,
  pageSize,
  totalCount,
  hasPrevious,
  hasNext,
  onPageChange,
  isLoading = false,
}: ListPagePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);
  const pageItems = buildPageItems(page, totalPages);

  return (
    <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-dash-muted">
        Showing{" "}
        <span className="font-medium text-brand-navy">
          {start}-{end}
        </span>{" "}
        out of {totalCount}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-lg border-dash-border bg-white text-brand-slate"
          disabled={!hasPrevious || isLoading}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1.5 text-sm text-dash-muted"
            >
              …
            </span>
          ) : (
            <Button
              key={item}
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              className={cn(
                "h-8 min-w-8 rounded-lg border-dash-border px-2.5",
                item === page
                  ? "border-brand-primary bg-brand-primary text-white hover:bg-brand-primary-hover hover:text-white"
                  : "bg-white text-brand-slate hover:bg-dash-canvas",
              )}
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          ),
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-lg border-dash-border bg-white text-brand-slate"
          disabled={!hasNext || isLoading}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
