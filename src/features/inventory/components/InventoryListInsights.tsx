"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCompactNumber } from "@/utils/format-compact-number";

export type InventoryInsightCard = {
  label: string;
  value: number;
  display?: string;
  hint: string;
  dotClass: string;
  emphasize?: boolean;
  emphasizeClass?: string;
};

type InventoryListInsightsProps = {
  cards: InventoryInsightCard[];
  isLoading?: boolean;
  "data-testid"?: string;
};

export function InventoryListInsights({
  cards,
  isLoading = false,
  "data-testid": dataTestId = "inventory-list-insights",
}: InventoryListInsightsProps) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
        data-testid={dataTestId}
        aria-busy="true"
      >
        {Array.from({ length: cards.length || 4 }, (_, index) => (
          <div key={index} className="p-3.5 sm:p-4">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="mt-2.5 h-8 w-16" />
            <Skeleton className="mt-1.5 h-3 w-28" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <dl
      className="grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
      data-testid={dataTestId}
    >
      {cards.map((card) => (
        <div
          key={card.label}
          className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4"
        >
          <div className="flex items-center gap-2">
            <span className={cn("size-2 shrink-0 rounded-full", card.dotClass)} />
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
              {card.label}
            </dt>
          </div>
          <dd
            className={cn(
              "mt-1.5 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl",
              card.emphasize && card.emphasizeClass
                ? card.emphasizeClass
                : "text-brand-navy",
            )}
          >
            {card.display ?? formatCompactNumber(card.value)}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">{card.hint}</p>
        </div>
      ))}
    </dl>
  );
}
