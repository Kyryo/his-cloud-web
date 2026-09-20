"use client";

import { LayoutList, Table } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import type { OpdQueueViewMode } from "@/features/clinical-opd/utils/opd-queue-views";
import { cn } from "@/lib/utils";

const VIEW_OPTIONS: Array<{
  mode: OpdQueueViewMode;
  label: string;
  icon: typeof Table;
}> = [
  { mode: "table", label: "Table", icon: Table },
  { mode: "list", label: "List", icon: LayoutList },
];

type OpdQueueViewToggleProps = {
  viewMode: OpdQueueViewMode;
  onChange: (mode: OpdQueueViewMode) => void;
};

export function OpdQueueViewToggle({
  viewMode,
  onChange,
}: OpdQueueViewToggleProps) {
  return (
    <ButtonGroup aria-label="OPD queue view" data-testid="opd-queue-view-toggle">
      {VIEW_OPTIONS.map((option) => {
        const isCurrent = viewMode === option.mode;

        return (
          <Button
            key={option.mode}
            type="button"
            variant="outline"
            size="sm"
            aria-pressed={isCurrent}
            className={cn(
              "h-8 text-[13px]",
              isCurrent && "bg-brand-primary/5 text-brand-primary",
            )}
            onClick={() => onChange(option.mode)}
          >
            <option.icon className="size-4" aria-hidden="true" />
            {option.label}
          </Button>
        );
      })}
    </ButtonGroup>
  );
}