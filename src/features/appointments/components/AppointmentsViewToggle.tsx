"use client";

import { CalendarDays, LayoutGrid, Table } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";

export type AppointmentsViewMode = "list" | "board" | "calendar";

type AppointmentsViewToggleProps = {
  viewMode: AppointmentsViewMode;
  onViewModeChange: (mode: AppointmentsViewMode) => void;
};

export function AppointmentsViewToggle({
  viewMode,
  onViewModeChange,
}: AppointmentsViewToggleProps) {
  return (
    <ButtonGroup aria-label="Appointments view" data-testid="appointments-view-toggle">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(viewMode === "list" && "bg-brand-primary/5 text-brand-primary")}
        onClick={() => onViewModeChange("list")}
      >
        <Table className="size-4" aria-hidden="true" />
        Table
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(viewMode === "board" && "bg-brand-primary/5 text-brand-primary")}
        onClick={() => onViewModeChange("board")}
      >
        <LayoutGrid className="size-4" aria-hidden="true" />
        Board
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(viewMode === "calendar" && "bg-brand-primary/5 text-brand-primary")}
        onClick={() => onViewModeChange("calendar")}
      >
        <CalendarDays className="size-4" aria-hidden="true" />
        Calendar
      </Button>
    </ButtonGroup>
  );
}
