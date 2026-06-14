"use client";

import { Search } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

type ListSearchInputProps = React.ComponentProps<"input">;

function ListSearchInput({ className, ...props }: ListSearchInputProps) {
  return (
    <div className="relative w-full sm:max-w-md">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-muted"
        aria-hidden="true"
      />
      <input
        type="search"
        className={cn(
          "list-search-input flex h-10 w-full rounded-lg border border-brand-border bg-white py-2 pl-10 pr-3 text-sm text-brand-navy shadow-xs placeholder:text-brand-muted",
          "transition-[border-color,box-shadow] focus-visible:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export { ListSearchInput };
