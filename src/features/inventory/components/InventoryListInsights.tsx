"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  LIST_PAGE_INSIGHT_CELL_CLASS,
  LIST_PAGE_INSIGHT_LABEL_CLASS,
  LIST_PAGE_INSIGHT_STRIP_CLASS,
  LIST_PAGE_INSIGHT_VALUE_CLASS,
} from "@/features/app-shell/components/page-layout";
import { cn } from "@/lib/utils";
import { formatCompactNumber } from "@/utils/format-compact-number";

export type InventoryInsightCard = {
  label: string;
  value: number;
  display?: string;
  hint: string;
  dotClass?: string;
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
        className={LIST_PAGE_INSIGHT_STRIP_CLASS}
        data-testid={dataTestId}
        aria-busy="true"
      >
        {Array.from({ length: cards.length || 4 }, (_, index) => (
          <div key={index} className={LIST_PAGE_INSIGHT_CELL_CLASS}>
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="mt-2 h-6 w-14" />
            <Skeleton className="mt-1.5 h-3 w-28" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <dl className={LIST_PAGE_INSIGHT_STRIP_CLASS} data-testid={dataTestId}>
      {cards.map((card) => (
        <div key={card.label} className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>{card.label}</dt>
          <dd
            className={cn(
              LIST_PAGE_INSIGHT_VALUE_CLASS,
              card.emphasize && card.emphasizeClass
                ? card.emphasizeClass
                : null,
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
