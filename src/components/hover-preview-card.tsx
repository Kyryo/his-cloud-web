"use client";

import * as React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type HoverPreviewCardProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
};

export function HoverPreviewCard({
  trigger,
  children,
  side = "right",
  className,
}: HoverPreviewCardProps) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent
        side={side}
        sideOffset={8}
        className={cn(
          "w-64 rounded-xl border border-brand-border bg-white p-4 text-left text-brand-navy shadow-lg",
          className,
        )}
      >
        {children}
      </TooltipContent>
    </Tooltip>
  );
}
