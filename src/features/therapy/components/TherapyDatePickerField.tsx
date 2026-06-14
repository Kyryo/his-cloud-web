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

export function TherapyDatePickerField({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => {
    const parsed = value ? parseISO(value) : undefined;
    return parsed && isValid(parsed) ? parsed : undefined;
  }, [value]);

  return (
    <div className="flex gap-2">
      <Input
        value={value}
        placeholder="YYYY-MM-DD"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            aria-label="Open target date calendar"
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
            selected={selected}
            onSelect={(date) => {
              if (date) {
                onChange(format(date, "yyyy-MM-dd"));
                setOpen(false);
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
