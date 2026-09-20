"use client";

import { Badge } from "@/components/ui/badge";
import {
  formatLabOrderPriorityLabel,
  isUrgentPriority,
} from "@/features/laboratory/utils/format-lab-order";
import { cn } from "@/lib/utils";

type LabOrderPriorityBadgeProps = {
  priority: string | undefined;
  className?: string;
};

export function LabOrderPriorityBadge({
  priority,
  className,
}: LabOrderPriorityBadgeProps) {
  return (
    <Badge
      variant={isUrgentPriority(priority ?? "") ? "destructive" : "outline"}
      className={cn("font-normal", className)}
    >
      {formatLabOrderPriorityLabel(priority)}
    </Badge>
  );
}
