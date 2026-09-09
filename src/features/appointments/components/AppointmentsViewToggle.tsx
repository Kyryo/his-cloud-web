"use client";

import { CalendarDays, LayoutGrid, Table } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  appointmentsViewHref,
  type AppointmentsViewMode,
} from "@/features/appointments/utils/appointment-views";
import { cn } from "@/lib/utils";

export type { AppointmentsViewMode };

const VIEW_OPTIONS: Array<{
  href: string;
  icon: typeof Table;
  label: string;
  mode: AppointmentsViewMode;
}> = [
  { href: appointmentsViewHref("list"), icon: Table, label: "Table", mode: "list" },
  {
    href: appointmentsViewHref("board"),
    icon: LayoutGrid,
    label: "Board",
    mode: "board",
  },
  {
    href: appointmentsViewHref("calendar"),
    icon: CalendarDays,
    label: "Calendar",
    mode: "calendar",
  },
];

type AppointmentsViewToggleProps = {
  viewMode: AppointmentsViewMode;
};

export function AppointmentsViewToggle({ viewMode }: AppointmentsViewToggleProps) {
  return (
    <ButtonGroup aria-label="Appointments view" data-testid="appointments-view-toggle">
      {VIEW_OPTIONS.map((option) => {
        const isCurrent = viewMode === option.mode;

        return (
          <Button
            key={option.mode}
            asChild
            variant="outline"
            size="sm"
            className={cn(isCurrent && "bg-brand-primary/5 text-brand-primary")}
          >
            <Link
              href={option.href}
              aria-current={isCurrent ? "page" : undefined}
            >
              <option.icon className="size-4" aria-hidden="true" />
              {option.label}
            </Link>
          </Button>
        );
      })}
    </ButtonGroup>
  );
}
