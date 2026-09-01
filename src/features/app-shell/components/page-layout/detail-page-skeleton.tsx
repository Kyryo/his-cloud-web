import { Skeleton } from "@/components/ui/skeleton";
import { DetailPageAsidePanelSection } from "@/features/app-shell/components/page-layout/detail-page-aside-panel-section";
import { DetailPageHeaderSection } from "@/features/app-shell/components/page-layout/detail-page-header-section";
import { DetailPageLayout } from "@/features/app-shell/components/page-layout/detail-page-layout";
import {
  DetailPageMainAsideGrid,
  DetailPageMainSection,
  DetailPageTabsNavSection,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout/detail-page-tabs-section";

type DetailPageSkeletonProps = {
  tabCount?: number;
  showAside?: boolean;
  tableRows?: number;
  "data-testid"?: string;
};

export function DetailPageSkeleton({
  tabCount = 4,
  showAside = true,
  tableRows = 6,
  "data-testid": testId = "detail-page-skeleton",
}: DetailPageSkeletonProps) {
  return (
    <DetailPageLayout data-testid={testId}>
      <DetailPageHeaderSection>
        <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="flex shrink-0 gap-2">
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </div>
      </DetailPageHeaderSection>

      <DetailPageTabsSection>
        <DetailPageTabsNavSection aria-label="Loading sections">
          {Array.from({ length: tabCount }).map((_, index) => (
            <Skeleton key={index} className="my-3 h-5 w-20" />
          ))}
        </DetailPageTabsNavSection>

        <DetailPageMainAsideGrid>
          <DetailPageMainSection>
            <div className="mb-4 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-56" />
            </div>
            <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
              <div className="space-y-3 p-4">
                {Array.from({ length: tableRows }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </DetailPageMainSection>

          {showAside ? (
            <DetailPageAsidePanelSection className="hidden xl:block">
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-44" />
                <Skeleton className="h-36 w-full rounded-xl" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            </DetailPageAsidePanelSection>
          ) : null}
        </DetailPageMainAsideGrid>
      </DetailPageTabsSection>
    </DetailPageLayout>
  );
}
