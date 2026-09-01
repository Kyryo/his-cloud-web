"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { RecordCreatedByMeta } from "@/components/detail/record-created-by-meta";
import { cn } from "@/lib/utils";

export type DetailActivityTimelineItem = {
  id: string;
  title: string;
  summary: string;
  occurredAt: string;
  icon: LucideIcon;
  createdByName?: string | null;
  createdByEmail?: string | null;
};

type DetailActivityTimelineProps = {
  title?: ReactNode;
  description?: string;
  items: DetailActivityTimelineItem[];
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
  "data-testid"?: string;
};

export function DetailActivityTimeline({
  title = "Activity",
  description = "Recent events recorded for this record.",
  items,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  className,
  "data-testid": testId,
}: DetailActivityTimelineProps) {
  return (
    <section
      className={cn("rounded-xl border border-dash-border/80 bg-white", className)}
      data-testid={testId}
    >
      <div className="border-b border-dash-border/80 px-4 py-3 sm:px-5">
        <h3 className="text-sm font-semibold text-brand-navy">{title}</h3>
        <p className="mt-0.5 text-xs text-brand-muted">{description}</p>
      </div>

      <ol className="divide-y divide-dash-border/60">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.id} className="px-4 py-3 sm:px-5">
              <div className="flex gap-3">
                <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 text-brand-primary shadow-2xs">
                  <Icon className="size-3.5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-medium leading-tight text-brand-navy">
                        {item.title}
                      </p>
                      <p className="text-xs leading-snug text-brand-slate">
                        {item.summary}
                      </p>
                    </div>
                    <RecordCreatedByMeta
                      dateTime={item.occurredAt}
                      createdByName={item.createdByName}
                      createdByEmail={item.createdByEmail}
                    />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {hasMore && onLoadMore ? (
        <div className="border-t border-dash-border/80 px-4 py-2.5 sm:px-5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-full sm:w-auto"
            disabled={isLoadingMore}
            onClick={onLoadMore}
          >
            {isLoadingMore ? "Loading..." : "Load more activity"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
