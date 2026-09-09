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
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  appointmentsCalendarHref,
  type AppointmentsCalendarView,
} from "@/features/appointments/utils/appointment-views";
import { cn } from "@/lib/utils";

export type { AppointmentsCalendarView };

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
};

export function AppointmentsCalendarNav({
  focusDate,
  view,
  isLoading = false,
  onNavigate,
  onToday,
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
          {CALENDAR_VIEWS.map((option) => {
            const isCurrent = view === option.value;

            return (
              <Link
                key={option.value}
                href={appointmentsCalendarHref(option.value)}
                replace
                scroll={false}
                aria-label={option.label}
                aria-current={isCurrent ? "page" : undefined}
                aria-disabled={isLoading || undefined}
                tabIndex={isLoading ? -1 : undefined}
                className={cn(
                  "relative flex h-8 items-center gap-1.5 px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary sm:px-2.5 sm:text-xs",
                  "after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-transparent",
                  isCurrent && "text-brand-primary after:bg-brand-primary",
                  isLoading && "pointer-events-none opacity-50",
                )}
              >
                <HugeiconsIcon
                  icon={option.icon}
                  size={17}
                  strokeWidth={1.8}
                />
                <span className="hidden sm:inline">{option.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
