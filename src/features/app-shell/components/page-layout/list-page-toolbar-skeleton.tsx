import { Skeleton } from "@/components/ui/skeleton";
import {
  ListPageToolbarActions,
  ListPageToolbarFilters,
  ListPageToolbarSearch,
  ListPageToolbarSection,
} from "@/features/app-shell/components/page-layout/list-page-toolbar-section";
import { cn } from "@/lib/utils";

type ListPageToolbarSkeletonProps = {
  showFilter?: boolean;
  showViewToggle?: boolean;
  className?: string;
};

export function ListPageToolbarSkeleton({
  showFilter = true,
  showViewToggle = false,
  className,
}: ListPageToolbarSkeletonProps) {
  return (
    <ListPageToolbarSection
      className={cn("lg:justify-start", className)}
      data-testid="list-page-toolbar-skeleton"
    >
      <ListPageToolbarSearch className="flex">
        <Skeleton className="h-10 w-full rounded-lg sm:max-w-sm" />
        <ListPageToolbarActions>
          <Skeleton className="h-10 w-[4.5rem] rounded-lg" />
          {showFilter ? <Skeleton className="h-10 w-28 rounded-lg" /> : null}
        </ListPageToolbarActions>
      </ListPageToolbarSearch>
      {showViewToggle ? (
        <ListPageToolbarFilters>
          <Skeleton className="h-10 w-40 rounded-lg" />
        </ListPageToolbarFilters>
      ) : null}
    </ListPageToolbarSection>
  );
}
