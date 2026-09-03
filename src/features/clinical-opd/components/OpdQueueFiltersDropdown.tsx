"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";

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
import {
  countActiveOpdQueueFilters,
  DEFAULT_OPD_QUEUE_FILTERS,
  OPD_QUEUE_STATUS_OPTIONS,
  type OpdQueueListFilterState,
} from "@/features/clinical-opd/utils/opd-queue-list-filters";
import { appFont } from "@/lib/fonts";

type OpdQueueFiltersDropdownProps = {
  filters: OpdQueueListFilterState;
  isLoading?: boolean;
  onApply: (filters: OpdQueueListFilterState) => void;
};

export function OpdQueueFiltersDropdown({
  filters,
  isLoading = false,
  onApply,
}: OpdQueueFiltersDropdownProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const activeCount = useMemo(
    () => countActiveOpdQueueFilters(filters),
    [filters],
  );
  const draftActiveCount = useMemo(
    () => countActiveOpdQueueFilters(draft),
    [draft],
  );

  useEffect(() => {
    if (open) {
      setDraft(filters);
    }
  }, [filters, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span>
          <ListPageFilterButton
            disabled={isLoading}
            activeCount={activeCount}
            onClick={() => setOpen(true)}
            data-testid="opd-queue-filters-button"
          />
        </span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <div className={appFont.className}>
          <div className="border-b border-dash-border/80 px-4 py-3">
            <h3 className="text-sm font-semibold text-brand-navy">Filters</h3>
            <p className="mt-0.5 text-xs text-brand-muted">
              Narrow the OPD queue by encounter status.
            </p>
          </div>

          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <Label htmlFor="opd-queue-status-filter" className="text-xs">
                Encounter status
              </Label>
              <Select
                value={draft.status}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    status: value as OpdQueueListFilterState["status"],
                  }))
                }
              >
                <SelectTrigger id="opd-queue-status-filter" className="h-9">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  {OPD_QUEUE_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-dash-border/80 px-4 py-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-brand-muted"
              disabled={draftActiveCount === 0}
              onClick={() => setDraft(DEFAULT_OPD_QUEUE_FILTERS)}
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
            <Button
              type="button"
              size="sm"
              className="text-xs"
              onClick={() => {
                onApply(draft);
                setOpen(false);
              }}
            >
              Apply filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
