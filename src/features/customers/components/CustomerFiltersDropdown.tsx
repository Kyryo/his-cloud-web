"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Check, RotateCcw, SlidersHorizontal, Tag as TagIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListPageFilterButton } from "@/features/app-shell/components/page-layout";
import type {
  CustomerActiveFilter,
  CustomerListFilterState,
  CustomerOrdering,
} from "@/features/customers/utils/customer-list-filters";
import {
  countActiveCustomerFilters,
  CUSTOMER_ORDERING_OPTIONS,
  DEFAULT_CUSTOMER_ORDERING,
} from "@/features/customers/utils/customer-list-filters";
import type { CustomerGender } from "@/features/customers/types/customer.types";
import { TagBadge } from "@/features/tags/components/TagBadge";
import { TAG_TARGET_TYPES } from "@/features/tags/constants/tag-target-types";
import { fetchTags } from "@/features/tags/services/tags.service";
import type { Tag } from "@/features/tags/types/tag.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type CustomerFiltersDropdownProps = {
  filters: Pick<
    CustomerListFilterState,
    "gender" | "activeStatus" | "ordering" | "tags"
  >;
  isLoading?: boolean;
  onApply: (
    filters: Pick<
      CustomerListFilterState,
      "gender" | "activeStatus" | "ordering" | "tags"
    >,
  ) => void;
};

const GENDER_OPTIONS: Array<{ value: CustomerGender | "all"; label: string }> = [
  { value: "all", label: "All genders" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const STATUS_OPTIONS: Array<{ value: CustomerActiveFilter; label: string }> = [
  { value: "all", label: "All account statuses" },
  { value: "active", label: "Active only" },
  { value: "inactive", label: "Inactive only" },
];

export function CustomerFiltersDropdown({
  filters,
  isLoading = false,
  onApply,
}: CustomerFiltersDropdownProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const [catalog, setCatalog] = useState<Tag[]>([]);
  const activeCount = useMemo(() => countActiveCustomerFilters(filters), [filters]);
  const draftActiveCount = useMemo(() => countActiveCustomerFilters(draft), [draft]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let active = true;

    async function loadCatalog() {
      try {
        const response = await fetchTags({
          target_type: TAG_TARGET_TYPES.CUSTOMER,
          is_active: true,
          pageSize: 200,
          ordering: "name",
        });
        if (active) {
          setCatalog(response.results);
        }
      } catch {
        if (active) {
          setCatalog([]);
        }
      }
    }

    void loadCatalog();

    return () => {
      active = false;
    };
  }, [open]);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(filters);
    }
    setOpen(nextOpen);
  }

  function handleApply() {
    onApply(draft);
    setOpen(false);
  }

  function handleReset() {
    const reset = {
      gender: "all" as const,
      activeStatus: "all" as const,
      ordering: DEFAULT_CUSTOMER_ORDERING,
      tags: [] as string[],
    };
    setDraft(reset);
    onApply(reset);
    setOpen(false);
  }

  function toggleTag(tagUuid: string) {
    setDraft((current) => ({
      ...current,
      tags: current.tags.includes(tagUuid)
        ? current.tags.filter((value) => value !== tagUuid)
        : [...current.tags, tagUuid],
    }));
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <span>
          <ListPageFilterButton
            disabled={isLoading}
            activeCount={activeCount}
            onClick={() => handleOpenChange(true)}
            data-testid="customers-filters-button"
          />
        </span>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={6}
        className={cn(
          "w-80 rounded-xl border border-dash-border/90 bg-white p-0 text-sm shadow-xl",
          appFont.className,
        )}
      >
        {/* Sleek Header */}
        <div className="flex items-center justify-between border-b border-dash-border/70 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-3.5 text-brand-primary" />
            <span className="font-semibold text-brand-navy">Filters</span>
            {draftActiveCount > 0 ? (
              <span className="inline-flex size-4.5 items-center justify-center rounded-full bg-brand-tint text-[10px] font-bold text-brand-primary">
                {draftActiveCount}
              </span>
            ) : null}
          </div>

          {draftActiveCount > 0 ? (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs text-brand-muted transition-colors hover:text-brand-primary"
            >
              <RotateCcw className="size-3" />
              <span>Reset</span>
            </button>
          ) : null}
        </div>

        {/* Clean, Uniform Form Fields */}
        <div className="space-y-3.5 p-4">
          {/* Status Select */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-brand-slate">Account Status</Label>
            <Select
              value={draft.activeStatus}
              disabled={isLoading}
              onValueChange={(val) =>
                setDraft((curr) => ({ ...curr, activeStatus: val as CustomerActiveFilter }))
              }
            >
              <SelectTrigger className="h-8.5 w-full rounded-lg border-dash-border bg-white text-xs font-medium text-brand-navy">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent position="popper" className={cn("rounded-lg", appFont.className)}>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gender Select */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-brand-slate">Gender</Label>
            <Select
              value={draft.gender}
              disabled={isLoading}
              onValueChange={(val) =>
                setDraft((curr) => ({ ...curr, gender: val as CustomerGender | "all" }))
              }
            >
              <SelectTrigger className="h-8.5 w-full rounded-lg border-dash-border bg-white text-xs font-medium text-brand-navy">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent position="popper" className={cn("rounded-lg", appFont.className)}>
                {GENDER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order Select */}
          <div className="space-y-1">
            <Label
              htmlFor="customer-filter-ordering"
              className="text-xs font-medium text-brand-slate flex items-center gap-1"
            >
              <ArrowUpDown className="size-3 text-dash-muted" />
              <span>Sort By</span>
            </Label>
            <Select
              value={draft.ordering}
              disabled={isLoading}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  ordering: value as CustomerOrdering,
                }))
              }
            >
              <SelectTrigger
                id="customer-filter-ordering"
                className="h-8.5 w-full rounded-lg border-dash-border bg-white text-xs font-medium text-brand-navy"
              >
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent position="popper" className={cn("rounded-lg", appFont.className)}>
                {CUSTOMER_ORDERING_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          {catalog.length > 0 ? (
            <div className="space-y-1.5 pt-1 border-t border-dash-border/60">
              <Label className="text-xs font-medium text-brand-slate flex items-center gap-1">
                <TagIcon className="size-3 text-dash-muted" />
                <span>Tags</span>
              </Label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-0.5">
                {catalog.map((tag) => {
                  const isChecked = draft.tags.includes(tag.uuid);
                  return (
                    <button
                      key={tag.uuid}
                      type="button"
                      disabled={isLoading}
                      onClick={() => toggleTag(tag.uuid)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-all cursor-pointer",
                        isChecked
                          ? "ring-2 ring-brand-primary ring-offset-1 font-semibold"
                          : "opacity-60 hover:opacity-100",
                      )}
                    >
                      <TagBadge tag={tag} />
                      {isChecked ? <Check className="size-3 text-brand-primary" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* Minimal Clean Footer */}
        <div className="flex items-center justify-between border-t border-dash-border/70 bg-slate-50/50 px-4 py-2.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="h-7.5 px-2.5 text-xs text-brand-muted hover:text-brand-navy"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            className="h-7.5 rounded-lg bg-brand-primary px-3.5 text-xs font-medium text-white shadow-xs hover:bg-brand-primary-hover"
          >
            Apply Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Legacy alias for backwards compatibility */
export const CustomerFiltersSheet = CustomerFiltersDropdown;
