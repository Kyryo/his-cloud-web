"use client";

import { CalendarIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { appFont } from "@/lib/fonts";
import {
  applyDatePart,
  applyTimePart,
  buildMinuteOptions,
  formatDateTimeLocal,
  formatDateTimePickerDate,
  formatDateTimePickerLabel,
  formatDateTimePickerTime,
  parseDateTimeLocal,
} from "@/lib/date-time-local";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

type DateTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
  layout?: "default" | "split";
  className?: string;
  "data-testid"?: string;
};

function padTimePart(value: number): string {
  return String(value).padStart(2, "0");
}

export function DateTimePicker({
  value,
  onChange,
  disabled = false,
  id,
  placeholder = "Select date and time",
  layout = "default",
  className,
  "data-testid": dataTestId,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedHourRef = useRef<HTMLButtonElement>(null);
  const selectedMinuteRef = useRef<HTMLButtonElement>(null);
  const selected = useMemo(() => parseDateTimeLocal(value), [value]);
  const workingDate = selected ?? new Date();
  const minutes = buildMinuteOptions(workingDate.getMinutes());

  useEffect(() => {
    if (!open) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      selectedHourRef.current?.scrollIntoView({ block: "center" });
      selectedMinuteRef.current?.scrollIntoView({ block: "center" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open, value]);

  function commit(next: Date) {
    onChange(formatDateTimeLocal(next));
  }

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            data-testid={dataTestId}
            className={cn(
              "h-10 w-full justify-between rounded-md border-input px-3 font-normal",
              layout === "split" && "h-12",
              !selected && "text-muted-foreground",
              className,
            )}
          >
            {selected && layout === "split" ? (
              <span className="flex min-w-0 flex-1 items-baseline justify-between gap-3 pr-2">
                <span className="truncate text-sm text-brand-navy">
                  {formatDateTimePickerDate(selected)}
                </span>
                <span className="shrink-0 text-base font-medium tabular-nums text-brand-navy">
                  {formatDateTimePickerTime(selected)}
                </span>
              </span>
            ) : (
              <span className="truncate">
                {selected ? formatDateTimePickerLabel(selected) : placeholder}
              </span>
            )}
            <CalendarIcon className="size-4 shrink-0 text-brand-muted" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={cn(
            "z-[60] w-auto overflow-hidden p-0 sm:flex",
            appFont.className,
          )}
        >
          <Calendar
            mode="single"
            selected={workingDate}
            onSelect={(date) => {
              if (date) {
                commit(applyDatePart(workingDate, date));
              }
            }}
          />

          <div className="flex w-full flex-col border-t border-dash-border sm:w-36 sm:border-l sm:border-t-0">
            <p className="px-3 pb-1 pt-3 text-xs font-medium text-brand-muted">
              Time
            </p>
            <div className="grid min-h-0 flex-1 grid-cols-2 gap-1 px-2">
              <ol className="max-h-56 space-y-0.5 overflow-y-auto py-1">
                {HOURS.map((hour) => {
                  const isSelected = workingDate.getHours() === hour;
                  return (
                    <li key={hour}>
                      <button
                        type="button"
                        ref={isSelected ? selectedHourRef : undefined}
                        aria-label={`${padTimePart(hour)} hours`}
                        aria-pressed={isSelected}
                        onClick={() =>
                          commit(
                            applyTimePart(
                              workingDate,
                              hour,
                              workingDate.getMinutes(),
                            ),
                          )
                        }
                        className={cn(
                          "flex h-8 w-full items-center justify-center rounded-md text-sm tabular-nums",
                          isSelected
                            ? "bg-brand-primary font-medium text-white"
                            : "text-brand-navy hover:bg-dash-canvas",
                        )}
                      >
                        {padTimePart(hour)}
                      </button>
                    </li>
                  );
                })}
              </ol>
              <ol className="max-h-56 space-y-0.5 overflow-y-auto py-1">
                {minutes.map((minute) => {
                  const isSelected = workingDate.getMinutes() === minute;
                  return (
                    <li key={minute}>
                      <button
                        type="button"
                        ref={isSelected ? selectedMinuteRef : undefined}
                        aria-label={`${padTimePart(minute)} minutes`}
                        aria-pressed={isSelected}
                        onClick={() =>
                          commit(
                            applyTimePart(
                              workingDate,
                              workingDate.getHours(),
                              minute,
                            ),
                          )
                        }
                        className={cn(
                          "flex h-8 w-full items-center justify-center rounded-md text-sm tabular-nums",
                          isSelected
                            ? "bg-brand-primary font-medium text-white"
                            : "text-brand-navy hover:bg-dash-canvas",
                        )}
                      >
                        {padTimePart(minute)}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
            <div className="border-t border-dash-border p-2">
              <Button
                type="button"
                variant="ghost"
                className="h-8 w-full text-xs font-medium text-brand-navy"
                onClick={() => {
                  commit(new Date());
                  setOpen(false);
                }}
              >
                Now
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
