"use client";

import { ChevronDown, History, ListFilter } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { FeedItem } from "@/components/feed/feed-timeline";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  clusterConsecutiveActivityItems,
  formatActivityClusterRange,
  formatActivityRelativeLabel,
  getActivityActorLabel,
  getActivityItemGroupKey,
  pluralizeActivityTitle,
  type DetailActivityGroupedEntry,
  type DetailActivityTimelineItem,
} from "@/components/detail/detail-activity-timeline-utils";
import { ListPagePagination } from "@/features/app-shell/components/page-layout";
import { cn } from "@/lib/utils";

export type { DetailActivityTimelineItem } from "@/components/detail/detail-activity-timeline-utils";

export type ActivityFeedItem = DetailActivityTimelineItem;

export type ActivityFeedPagination = {
  page: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
};

type ActivityFeedProps = {
  title?: ReactNode | null;
  description?: string | null;
  items: ActivityFeedItem[];
  /** @deprecated Prefer `pagination` (Notifications-style paging). */
  hasMore?: boolean;
  /** @deprecated Prefer `pagination`. */
  isLoadingMore?: boolean;
  /** @deprecated Prefer `pagination`. */
  onLoadMore?: () => void;
  pagination?: ActivityFeedPagination | null;
  emptyTitle?: string;
  emptyDescription?: string;
  enableFilters?: boolean;
  /**
   * Match Notifications density.
   * false = same as Notifications inbox page (default).
   */
  compact?: boolean;
  now?: Date;
  className?: string;
  "data-testid"?: string;
};

function actorMeta(
  name?: string | null,
  email?: string | null,
): string | null {
  const label = getActivityActorLabel(name, email);
  if (!label) {
    return null;
  }
  const normalized = label.trim().toLowerCase();
  if (
    normalized === "system" ||
    normalized === "ai agent" ||
    normalized === "automation" ||
    normalized === "bot"
  ) {
    return "System";
  }
  return label;
}

function activityDescription(item: ActivityFeedItem): string | null {
  const summary = item.summary.trim();
  if (!summary) {
    return null;
  }
  if (summary.toLowerCase() === item.title.trim().toLowerCase()) {
    return null;
  }
  return summary;
}

function ActivityFeedEntry({
  entry,
  isLast,
  groupLabel,
  compact,
  now,
}: {
  entry: DetailActivityGroupedEntry;
  isLast: boolean;
  groupLabel?: string;
  compact: boolean;
  now?: Date;
}) {
  if (entry.kind === "single") {
    const item = entry.item;
    const Icon = item.icon ?? History;

    return (
      <li>
        <FeedItem
          title={item.title}
          description={activityDescription(item)}
          meta={actorMeta(item.createdByName, item.createdByEmail)}
          occurredAt={item.occurredAt}
          relativeTime={formatActivityRelativeLabel(
            item.occurredAt,
            groupLabel,
            now,
          )}
          icon={<Icon className={compact ? "size-3" : "size-[15px]"} />}
          showConnector={!isLast}
          compact={compact}
          className="px-0 sm:px-0"
          data-testid="activity-feed-item"
        />
      </li>
    );
  }

  return (
    <ClusterFeedEntry
      entry={entry}
      isLast={isLast}
      groupLabel={groupLabel}
      compact={compact}
      now={now}
    />
  );
}

function ClusterFeedEntry({
  entry,
  isLast,
  groupLabel,
  compact,
  now,
}: {
  entry: Extract<DetailActivityGroupedEntry, { kind: "cluster" }>;
  isLast: boolean;
  groupLabel?: string;
  compact: boolean;
  now?: Date;
}) {
  const [expanded, setExpanded] = useState(false);
  const count = entry.items.length;
  const latest = entry.items[0];
  const oldest = entry.items[entry.items.length - 1];
  const Icon = entry.icon ?? History;
  const rangeLabel = formatActivityClusterRange(entry.items);

  return (
    <li>
      <FeedItem
        title={pluralizeActivityTitle(entry.title, count)}
        description={`${count} events · ${rangeLabel}`}
        meta={actorMeta(
          latest.createdByName ?? oldest.createdByName,
          latest.createdByEmail ?? oldest.createdByEmail,
        )}
        occurredAt={latest.occurredAt}
        relativeTime={formatActivityRelativeLabel(
          latest.occurredAt,
          groupLabel,
          now,
        )}
        icon={<Icon className={compact ? "size-3" : "size-[15px]"} />}
        showConnector={!isLast}
        compact={compact}
        className="px-0 sm:px-0"
        data-testid="activity-feed-cluster"
      >
        <button
          type="button"
          className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium text-brand-primary transition-colors duration-150 hover:text-brand-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/25"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
        >
          {expanded ? "Hide activity" : "View activity"}
          <ChevronDown
            className={cn(
              "size-3 transition-transform duration-150",
              expanded && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>

        {expanded ? (
          <ol className="mt-2 space-y-1 border-t border-dash-border/80 pt-2">
            {entry.items.map((item) => {
              const description = activityDescription(item);
              return (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 px-0.5 py-1"
                >
                  <p className="min-w-0 text-xs leading-4 text-brand-muted">
                    {description ?? item.title}
                  </p>
                  <time
                    dateTime={item.occurredAt}
                    className="shrink-0 text-[11px] tabular-nums text-brand-muted"
                  >
                    {formatActivityRelativeLabel(
                      item.occurredAt,
                      groupLabel,
                      now,
                    )}
                  </time>
                </li>
              );
            })}
          </ol>
        ) : null}
      </FeedItem>
    </li>
  );
}

function ActivityFilters({
  options,
  selected,
  onChange,
}: {
  options: Array<{ key: string; label: string }>;
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  const activeCount = selected.size;
  const isActive = activeCount > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={isActive ? `Filters, ${activeCount} active` : "Filters"}
          className={cn(
            "h-8 gap-1.5 border-dash-border bg-white px-2.5 text-xs font-medium text-brand-slate shadow-none transition-colors duration-150 hover:bg-slate-50 hover:text-brand-navy",
            isActive &&
              "border-brand-primary/30 bg-brand-primary/5 text-brand-primary hover:bg-brand-primary/10 hover:text-brand-primary",
          )}
        >
          <ListFilter className="size-3.5" aria-hidden="true" />
          Filters
          {isActive ? (
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-semibold text-white">
              {activeCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-xs font-medium text-brand-muted">
          Activity type
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.key}
            checked={selected.has(option.key)}
            onCheckedChange={(checked) => {
              const next = new Set(selected);
              if (checked) {
                next.add(option.key);
              } else {
                next.delete(option.key);
              }
              onChange(next);
            }}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        {isActive ? (
          <>
            <DropdownMenuSeparator />
            <button
              type="button"
              className="w-full rounded-sm px-2 py-1.5 text-left text-xs font-medium text-brand-primary transition-colors duration-150 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/25"
              onClick={() => onChange(new Set())}
            >
              Clear filters
            </button>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ActivityFeedSkeleton({
  rows = 6,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <section
      className={cn("bg-transparent", className)}
      aria-busy="true"
      data-testid="activity-feed-skeleton"
    >
      <div className="space-y-1">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex gap-3 px-2 py-2.5">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-3 w-2/5" />
            </div>
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Reusable activity feed using the same visual system as Notifications.
 * Consumes activity data only — not notification inbox data.
 */
export function ActivityFeed({
  title = null,
  description = null,
  items,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  pagination = null,
  emptyTitle = "No activity yet",
  emptyDescription = "Activity related to this record will appear here.",
  enableFilters = true,
  compact = false,
  now,
  className,
  "data-testid": testId = "activity-feed",
}: ActivityFeedProps) {
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    () => new Set(),
  );

  const filterOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const item of items) {
      const key = getActivityItemGroupKey(item);
      if (!seen.has(key)) {
        seen.set(key, item.title);
      }
    }
    return Array.from(seen.entries())
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedTypes.size === 0) {
      return items;
    }
    return items.filter((item) =>
      selectedTypes.has(getActivityItemGroupKey(item)),
    );
  }, [items, selectedTypes]);

  const entries = useMemo(
    () => clusterConsecutiveActivityItems(filteredItems),
    [filteredItems],
  );

  const showHeader = title != null;
  const showFilters = enableFilters && filterOptions.length > 1;

  return (
    <section className={cn("min-w-0", className)} data-testid={testId}>
      {showHeader || showFilters ? (
        <div className="mb-3 flex items-start justify-between gap-3">
          {showHeader ? (
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-brand-navy">{title}</h3>
              {description ? (
                <p className="mt-1 text-sm text-brand-muted">{description}</p>
              ) : null}
            </div>
          ) : (
            <span />
          )}
          {showFilters ? (
            <ActivityFilters
              options={filterOptions}
              selected={selectedTypes}
              onChange={setSelectedTypes}
            />
          ) : null}
        </div>
      ) : null}

      {filteredItems.length === 0 ? (
        <div className="py-16 text-center" data-testid="activity-feed-empty">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-dash-canvas text-dash-muted">
            <History className="size-5" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm font-medium text-brand-navy">{emptyTitle}</p>
          <p className="mt-1 text-xs text-brand-muted">
            {items.length > 0 && selectedTypes.size > 0
              ? "No activity matches the selected filters."
              : emptyDescription}
          </p>
          {items.length > 0 && selectedTypes.size > 0 ? (
            <button
              type="button"
              className="mt-2.5 text-xs font-medium text-brand-primary transition-colors duration-150 hover:text-brand-primary-hover"
              onClick={() => setSelectedTypes(new Set())}
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        <ol className="min-w-0" data-testid="activity-feed-list">
          {entries.map((entry, index) => (
            <ActivityFeedEntry
              key={entry.id}
              entry={entry}
              isLast={index === entries.length - 1}
              groupLabel={undefined}
              compact={compact}
              now={now}
            />
          ))}
        </ol>
      )}

      {pagination ? (
        <ListPagePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalCount={pagination.totalCount}
          hasPrevious={pagination.hasPrevious}
          hasNext={pagination.hasNext}
          onPageChange={pagination.onPageChange}
          isLoading={pagination.isLoading}
        />
      ) : hasMore && onLoadMore ? (
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-full border-dash-border shadow-none transition-colors duration-150 hover:bg-slate-50 sm:w-auto"
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

/** @deprecated Prefer ActivityFeed — kept for existing imports. */
export function DetailActivityTimeline(props: ActivityFeedProps) {
  return <ActivityFeed {...props} />;
}

/** @deprecated Prefer ActivityFeedSkeleton. */
export function DetailActivityTimelineSkeleton(
  props: Parameters<typeof ActivityFeedSkeleton>[0],
) {
  return <ActivityFeedSkeleton {...props} />;
}
