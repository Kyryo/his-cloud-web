"use client";

import { useEffect, useMemo, useState } from "react";

import { FilterSelectField } from "@/components/filter-select-field";
import { Button } from "@/components/ui/button";
import { ListPageFilterButton } from "@/features/app-shell/components/page-layout";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

type CustomerFiltersSheetProps = {
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

const genderOptions: Array<{ value: CustomerGender | "all"; label: string }> = [
  { value: "all", label: "All genders" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const activeOptions: Array<{ value: CustomerActiveFilter; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active only" },
  { value: "inactive", label: "Inactive only" },
];

export function CustomerFiltersSheet({
  filters,
  isLoading = false,
  onApply,
}: CustomerFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const [catalog, setCatalog] = useState<Tag[]>([]);
  const activeCount = useMemo(() => countActiveCustomerFilters(filters), [filters]);

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
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <ListPageFilterButton
        disabled={isLoading}
        activeCount={activeCount}
        onClick={() => handleOpenChange(true)}
        data-testid="customers-filters-button"
      />

      <SheetContent
        side="right"
        className={cn("w-full text-sm sm:max-w-md", appFont.className)}
      >
        <SheetHeader>
          <SheetTitle className="text-base font-medium text-brand-navy">
            Filter clients
          </SheetTitle>
          <SheetDescription className="text-sm text-brand-muted">
            Narrow the list using the filters supported by the clients API.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-3">
          <FilterSelectField
            id="customer-filter-gender"
            label="Gender"
            value={draft.gender}
            disabled={isLoading}
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                gender: value as CustomerGender | "all",
              }))
            }
            options={genderOptions}
          />

          <FilterSelectField
            id="customer-filter-active"
            label="Status"
            value={draft.activeStatus}
            disabled={isLoading}
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                activeStatus: value as CustomerActiveFilter,
              }))
            }
            options={activeOptions}
          />

          <FilterSelectField
            id="customer-filter-ordering"
            label="Sort by"
            value={draft.ordering}
            disabled={isLoading}
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                ordering: value as CustomerOrdering,
              }))
            }
            options={CUSTOMER_ORDERING_OPTIONS}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium text-brand-navy">Tags</p>
            {catalog.length === 0 ? (
              <p className="text-sm text-brand-muted">No tags available.</p>
            ) : (
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-brand-border p-2">
                {catalog.map((tag) => (
                  <label
                    key={tag.uuid}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-brand-tint/60"
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded border-brand-border"
                      checked={draft.tags.includes(tag.uuid)}
                      onChange={() => toggleTag(tag.uuid)}
                      disabled={isLoading}
                    />
                    <TagBadge tag={tag} />
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="mt-6 gap-2 sm:justify-between">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button type="button" onClick={handleApply}>
            Apply filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
