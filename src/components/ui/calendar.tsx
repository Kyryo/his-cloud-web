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
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Calendar };
