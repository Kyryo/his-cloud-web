"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function LineNonPayableBadge() {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="warning"
            className="shrink-0 px-1.5 font-normal"
            aria-label="Non-payable"
          >
            NP
          </Badge>
        </TooltipTrigger>
        <TooltipContent>Non-payable</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
