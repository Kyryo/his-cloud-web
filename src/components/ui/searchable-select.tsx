"use client";

import { Loader2 } from "lucide-react";
import { Children, useEffect, useRef, type ReactNode } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type SearchableSelectProps = {
  id?: string;
  value?: string;
  onValueChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  displayValue?: ReactNode;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  isLoading?: boolean;
  minSearchLength?: number;
  emptySearchMessage?: string;
  noResultsMessage?: string;
  autoFocusSearch?: boolean;
  triggerClassName?: string;
  contentClassName?: string;
  children: ReactNode;
};

export function SearchableSelect({
  id,
  value,
  onValueChange,
  open,
  onOpenChange,
  disabled = false,
  placeholder = "Select an option",
  displayValue,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  isLoading = false,
  minSearchLength = 2,
  emptySearchMessage = "Type at least 2 characters to search.",
  noResultsMessage = "No results found.",
  autoFocusSearch = true,
  triggerClassName,
  contentClassName,
  children,
}: SearchableSelectProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const trimmedSearch = searchValue.trim();
  const hasResults = Children.count(children) > 0;
  const needsSearch = trimmedSearch.length < minSearchLength;

  useEffect(() => {
    if (!open || !autoFocusSearch) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [autoFocusSearch, open]);

  return (
    <Select
      value={value ?? ""}
      onValueChange={onValueChange}
      open={open}
      onOpenChange={onOpenChange}
      disabled={disabled}
    >
      <SelectTrigger id={id} className={cn("w-full", triggerClassName)}>
        <SelectValue placeholder={placeholder}>{displayValue}</SelectValue>
      </SelectTrigger>
      <SelectContent
        className={cn(
          "max-h-80 overflow-hidden p-0",
          "[&_[data-radix-select-viewport]]:h-auto [&_[data-radix-select-viewport]]:max-h-80",
          appFont.className,
          contentClassName,
        )}
      >
        <div className="sticky top-0 z-10 border-b border-brand-border bg-popover p-2">
          <Input
            ref={searchInputRef}
            value={searchValue}
            placeholder={searchPlaceholder}
            className="h-9"
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
          />
        </div>

        <div className="max-h-60 overflow-y-auto overscroll-contain p-1">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-brand-muted">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Searching...
            </div>
          ) : needsSearch ? (
            <div className="px-3 py-6 text-center text-sm text-brand-muted">
              {emptySearchMessage}
            </div>
          ) : !hasResults ? (
            <div className="px-3 py-6 text-center text-sm text-brand-muted">
              {noResultsMessage}
            </div>
          ) : (
            children
          )}
        </div>
      </SelectContent>
    </Select>
  );
}

export { SelectItem };
