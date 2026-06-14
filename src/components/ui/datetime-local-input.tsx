"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

function DateTimeLocalInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type="datetime-local"
      className={cn(
        "datetime-local-input flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { DateTimeLocalInput };
