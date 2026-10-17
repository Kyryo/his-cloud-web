"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";

import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

import "react-day-picker/style.css";

function Calendar({
  className,
  showOutsideDays = true,
  style,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "brand-calendar rounded-md bg-background p-3",
        appFont.className,
        className,
      )}
      style={
        {
          "--rdp-accent-color": "var(--color-brand-primary)",
          "--rdp-accent-background-color": "var(--color-brand-tint)",
          "--rdp-today-color": "var(--color-brand-primary)",
          "--rdp-day-height": "2rem",
          "--rdp-day-width": "2rem",
          "--rdp-day_button-height": "1.875rem",
          "--rdp-day_button-width": "1.875rem",
          "--rdp-nav-height": "2rem",
          "--rdp-weekday-padding": "0.25rem 0",
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Calendar };
