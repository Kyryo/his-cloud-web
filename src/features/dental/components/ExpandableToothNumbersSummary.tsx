"use client";

import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

const COLLAPSED_VISIBLE_COUNT = 2;

export type ExpandableToothNumbersSummaryProps = {
  toothNumbers: number[];
  emptyLabel?: string;
  className?: string;
  "data-testid"?: string;
};

export function ExpandableToothNumbersSummary({
  toothNumbers,
  emptyLabel = "No teeth selected yet",
  className,
  "data-testid": dataTestId = "odontogram-teeth-summary",
}: ExpandableToothNumbersSummaryProps) {
  const [expanded, setExpanded] = useState(false);

  const sorted = useMemo(
    () =>
      [...toothNumbers]
        .filter((n) => Number.isFinite(n) && n > 0)
        .sort((a, b) => a - b),
    [toothNumbers],
  );

  useEffect(() => {
    setExpanded(false);
  }, [sorted.join(",")]);

  if (sorted.length === 0) {
    return (
      <p className={cn("text-sm text-brand-navy", className)} data-testid={dataTestId}>
        {emptyLabel}
      </p>
    );
  }

  if (sorted.length <= COLLAPSED_VISIBLE_COUNT + 1) {
    return (
      <p className={cn("text-sm text-brand-navy", className)} data-testid={dataTestId}>
        {sorted.join(", ")}
      </p>
    );
  }

  if (expanded) {
    return (
      <p className={cn("text-sm text-brand-navy", className)} data-testid={dataTestId}>
        <span>{sorted.join(", ")}</span>{" "}
        <button
          type="button"
          className="font-medium text-brand-primary underline-offset-2 hover:underline"
          onClick={() => setExpanded(false)}
          data-testid="odontogram-teeth-view-less"
        >
          View less
        </button>
      </p>
    );
  }

  const head = sorted.slice(0, COLLAPSED_VISIBLE_COUNT).join(", ");
  const moreCount = sorted.length - COLLAPSED_VISIBLE_COUNT;

  return (
    <p className={cn("text-sm text-brand-navy", className)} data-testid={dataTestId}>
      <span>{head} and </span>
      <button
        type="button"
        className="font-medium text-brand-primary underline-offset-2 hover:underline"
        onClick={() => setExpanded(true)}
        data-testid="odontogram-teeth-view-more"
      >
        {moreCount} more
      </button>
    </p>
  );
}
