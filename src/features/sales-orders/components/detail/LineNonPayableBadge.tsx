"use client";

import type { KeyboardEvent, MouseEvent } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type LineNonPayableBadgeProps = {
  onClick?: () => void;
  className?: string;
};

export function LineNonPayableBadge({
  onClick,
  className,
}: LineNonPayableBadgeProps) {
  const badge = (
    <Badge
      variant="warning"
      className={cn(
        "shrink-0 px-1.5 font-normal",
        onClick &&
          "cursor-pointer transition-colors hover:bg-amber-200/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40",
        className,
      )}
      aria-label="Non-payable. View details"
      {...(onClick
        ? {
            role: "button" as const,
            tabIndex: 0,
            onClick: (event: MouseEvent) => {
              event.stopPropagation();
              onClick();
            },
            onKeyDown: (event: KeyboardEvent) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                onClick();
              }
            },
          }
        : {})}
      data-testid="line-non-payable-badge"
    >
      NP
    </Badge>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          {onClick ? "Non-payable — click for details" : "Non-payable"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
