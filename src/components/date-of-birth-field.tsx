"use client";

import { format, isValid, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type DateOfBirthFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  id?: string;
  placeholder?: string;
  className?: string;
  "data-testid"?: string;
};

function parseDateValue(value: string): Date | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : undefined;
}

function formatDateValue(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function DateOfBirthField({
  value,
  onChange,
  disabled = false,
  hasError = false,
  id,
  placeholder = "YYYY-MM-DD",
  className,
  "data-testid": dataTestId,
}: DateOfBirthFieldProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = useMemo(() => parseDateValue(value), [value]);

  function handleInputChange(nextValue: string) {
    onChange(nextValue);
  }

  function handleCalendarSelect(date: Date | undefined) {
    if (!date) {
      return;
    }

    onChange(formatDateValue(date));
    setOpen(false);
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        aria-invalid={hasError}
        onChange={(event) => handleInputChange(event.target.value)}
        className={cn(
          hasError &&
            "border-destructive focus-visible:ring-destructive/30",
        )}
        data-testid={dataTestId}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            aria-label="Open calendar"
            className={cn(
              "shrink-0",
              hasError && "border-destructive focus-visible:ring-destructive/30",
            )}
          >
            <CalendarIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn("w-auto p-0", appFont.className)}
          align="end"
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleCalendarSelect}
            disabled={(date) => date > new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
