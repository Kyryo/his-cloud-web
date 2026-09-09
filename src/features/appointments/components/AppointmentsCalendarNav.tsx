"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CalendarDaysIcon,
  CalendarRangeIcon,
  ViewAgendaIcon,
} from "@hugeicons/core-free-icons";
import {
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isSameWeek,
  startOfWeek,
} from "date-fns";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AppointmentsCalendarView = "month" | "week" | "day";

const CALENDAR_VIEWS: Array<{
  icon: IconSvgElement;
  label: string;
  value: AppointmentsCalendarView;
}> = [
  { icon: CalendarDaysIcon, label: "Month", value: "month" },
  { icon: CalendarRangeIcon, label: "Week", value: "week" },
  { icon: ViewAgendaIcon, label: "Day", value: "day" },
];

type AppointmentsCalendarNavProps = {
  focusDate: Date;
  view: AppointmentsCalendarView;
  isLoading?: boolean;
  onNavigate: (direction: -1 | 1) => void;
  onToday: () => void;
  onViewChange: (view: AppointmentsCalendarView) => void;
};

export function AppointmentsCalendarNav({
  focusDate,
  view,
  isLoading = false,
  onNavigate,
  onToday,
  onViewChange,
}: AppointmentsCalendarNavProps) {
  const weekStart = startOfWeek(focusDate);
  const weekEnd = endOfWeek(focusDate);
  const title =
    view === "month"
      ? format(focusDate, "MMMM yyyy")
      : view === "week"
        ? `${format(weekStart, "d MMM")} – ${format(weekEnd, "d MMM yyyy")}`
        : format(focusDate, "EEEE, d MMMM yyyy");
  const isCurrentPeriod =
    view === "month"
      ? isSameMonth(focusDate, new Date())
      : view === "week"
        ? isSameWeek(focusDate, new Date())
        : isSameDay(focusDate, new Date());

  return (
    <div className="flex min-h-16 flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b border-border bg-background px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={`Previous ${view}`}
          disabled={isLoading}
          onClick={() => onNavigate(-1)}
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            size={18}
            strokeWidth={1.8}
          />
        </Button>
        <h2 className="min-w-0 px-1 text-center text-base font-semibold tracking-[-0.02em] text-foreground sm:px-2 sm:text-lg">
          {title}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={`Next ${view}`}
          disabled={isLoading}
          onClick={() => onNavigate(1)}
        >
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={18}
            strokeWidth={1.8}
          />
        </Button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="hidden h-8 rounded-md px-3 text-xs shadow-none sm:inline-flex"
          disabled={isLoading || isCurrentPeriod}
          onClick={onToday}
        >
          Today
        </Button>
        <div
          className="flex items-center gap-0.5"
          aria-label="Calendar view"
          role="group"
        >
          {CALENDAR_VIEWS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-label={option.label}
              aria-pressed={view === option.value}
              disabled={isLoading}
              onClick={() => onViewChange(option.value)}
              className={cn(
                "relative flex h-8 items-center gap-1.5 px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:opacity-50 sm:px-2.5 sm:text-xs",
                "after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-transparent",
                view === option.value &&
                  "text-brand-primary after:bg-brand-primary",
              )}
            >
              <HugeiconsIcon
                icon={option.icon}
                size={17}
                strokeWidth={1.8}
              />
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
