"use client";

import { LayoutGrid, LayoutList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";

export type LabOrderedTestsViewMode = "cards" | "list";

const VIEW_OPTIONS: Array<{
  mode: LabOrderedTestsViewMode;
  label: string;
  icon: typeof LayoutGrid;
}> = [
  { mode: "cards", label: "Cards", icon: LayoutGrid },
  { mode: "list", label: "List", icon: LayoutList },
];

type LabOrderedTestsViewToggleProps = {
  viewMode: LabOrderedTestsViewMode;
  onChange: (mode: LabOrderedTestsViewMode) => void;
};

export function LabOrderedTestsViewToggle({
  viewMode,
  onChange,
}: LabOrderedTestsViewToggleProps) {
  return (
    <ButtonGroup
      aria-label="Ordered tests view"
      data-testid="lab-ordered-tests-view-toggle"
    >
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
              "h-8 gap-1.5 px-2.5 text-[13px]",
              isCurrent && "bg-brand-primary/5 text-brand-primary",
            )}
            onClick={() => onChange(option.mode)}
            data-testid={`lab-ordered-tests-view-${option.mode}`}
          >
            <option.icon className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{option.label}</span>
          </Button>
        );
      })}
    </ButtonGroup>
  );
}
