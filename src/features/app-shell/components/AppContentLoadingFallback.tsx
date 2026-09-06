import { Skeleton } from "@/components/ui/skeleton";
import { ListPageLayout } from "@/features/app-shell/components/page-layout";

/** Content-pane fallback so route transitions do not remount the sidebar. */
export function AppContentLoadingFallback() {
  return (
    <ListPageLayout data-testid="app-content-loading">
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-72 w-full" />
    </ListPageLayout>
  );
}
