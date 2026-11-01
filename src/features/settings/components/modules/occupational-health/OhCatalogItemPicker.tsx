"use client";

import { Check, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { ListPagePagination } from "@/features/app-shell/components/page-layout";
import { Input } from "@/components/ui/input";
import {
  fetchOhCatalogItemsPage,
  getCatalogPossibleResponses,
  ohCatalogItemLabel,
} from "@/features/occupational-health/services/oh.service";
import type {
  OhCatalogItem,
  OhCatalogItemType,
} from "@/features/occupational-health/types";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 8;

type OhCatalogItemPickerProps = {
  itemType: OhCatalogItemType;
  selectedCodes: string[];
  onChange: (codes: string[]) => void;
  emptyLabel?: string;
  multi?: boolean;
  pageSize?: number;
  searchPlaceholder?: string;
};

export function OhCatalogItemPicker({
  itemType,
  selectedCodes,
  onChange,
  emptyLabel = "No catalog items yet. Add them under Catalog.",
  multi = true,
  pageSize = DEFAULT_PAGE_SIZE,
  searchPlaceholder = "Search by name or code…",
}: OhCatalogItemPickerProps) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<OhCatalogItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchOhCatalogItemsPage({
          page,
          pageSize,
          itemType,
          search: search || undefined,
        });
        if (!active) {
          return;
        }
        setRows(response.results);
        setTotalCount(response.pagination?.count ?? response.results.length);
        setHasNext(Boolean(response.pagination?.next));
        setHasPrevious(Boolean(response.pagination?.previous));
      } catch (loadError) {
        if (active) {
          setRows([]);
          setTotalCount(0);
          setHasNext(false);
          setHasPrevious(false);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load catalog items.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [itemType, page, pageSize, search]);

  function toggle(code: string) {
    if (!multi) {
      onChange(selectedCodes.includes(code) ? [] : [code]);
      return;
    }
    if (selectedCodes.includes(code)) {
      onChange(selectedCodes.filter((value) => value !== code));
      return;
    }
    onChange([...selectedCodes, code]);
  }

  function removeSelected(code: string) {
    onChange(selectedCodes.filter((value) => value !== code));
  }

  return (
    <div className="space-y-3">
      {selectedCodes.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selectedCodes.map((code) => (
            <span
              key={code}
              className="inline-flex items-center gap-1 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-2.5 py-1 text-xs font-medium text-brand-navy"
            >
              {code}
              <button
                type="button"
                className="rounded-full p-0.5 text-brand-muted hover:bg-white/70 hover:text-brand-navy"
                onClick={() => removeSelected(code)}
                aria-label={`Remove ${code}`}
              >
                <X className="size-3" aria-hidden />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </div>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : isLoading && rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-dash-border/80 px-3 py-6 text-center text-sm text-slate-400">
          Loading…
        </p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-dash-border/80 px-3 py-6 text-center text-sm text-slate-400">
          {search ? `No matches for “${search}”.` : emptyLabel}
        </p>
      ) : (
        <div className="space-y-2">
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-dash-border/80 p-1.5">
            {rows.map((item) => {
              const selected = selectedCodes.includes(item.code);
              const responseCount = getCatalogPossibleResponses(item).length;
              return (
                <button
                  key={item.uuid}
                  type="button"
                  onClick={() => toggle(item.code)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                    selected
                      ? "bg-brand-primary/10 text-brand-navy"
                      : "text-brand-slate hover:bg-slate-50",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-md border",
                      selected
                        ? "border-brand-primary bg-brand-primary text-white"
                        : "border-dash-border bg-white",
                    )}
                  >
                    {selected ? <Check className="size-3" aria-hidden /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {ohCatalogItemLabel(item)}
                    </span>
                    <span className="block truncate text-xs text-slate-400">
                      {item.code}
                      {responseCount > 0
                        ? ` · ${responseCount} response${responseCount === 1 ? "" : "s"}`
                        : ""}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          {totalCount > pageSize ? (
            <ListPagePagination
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              isLoading={isLoading}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
