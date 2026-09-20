"use client";

import { Check, Plus, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { LabTestDefinition } from "@/features/laboratory/types/laboratory-catalog.types";
import { cn } from "@/lib/utils";

export type PanelTestMembershipValue = {
  test_uuid: string;
  sort_order: number;
};

type PanelTestMembershipEditorProps = {
  tests: Array<Pick<LabTestDefinition, "uuid" | "code" | "name" | "category">>;
  value: PanelTestMembershipValue[];
  onChange: (next: PanelTestMembershipValue[]) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  isSearching?: boolean;
  disabled?: boolean;
};

function reindex(rows: PanelTestMembershipValue[]): PanelTestMembershipValue[] {
  return rows.map((row, index) => ({ ...row, sort_order: index }));
}

export function PanelTestMembershipEditor({
  tests,
  value,
  onChange,
  searchValue,
  onSearchChange,
  isSearching = false,
  disabled = false,
}: PanelTestMembershipEditorProps) {
  const selectedIds = new Set(value.map((row) => row.test_uuid));

  function addTest(testUuid: string) {
    if (selectedIds.has(testUuid)) {
      return;
    }
    onChange(
      reindex([
        ...value,
        { test_uuid: testUuid, sort_order: value.length },
      ]),
    );
  }

  function removeTest(testUuid: string) {
    onChange(reindex(value.filter((row) => row.test_uuid !== testUuid)));
  }

  return (
    <div className="space-y-4" data-testid="panel-test-membership-editor">
      <p className="text-xs text-brand-muted">
        Showing up to 20 tests. Search by name or code to find others. Patients
        are charged the panel product price, not the member test prices.
      </p>

      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-brand-muted"
          aria-hidden="true"
        />
        <Input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search tests…"
          className="pl-9"
          disabled={disabled}
          data-testid="panel-test-membership-search"
          aria-label="Search tests"
        />
      </div>

      {isSearching ? (
        <div className="rounded-lg border border-dashed border-dash-border px-3 py-8 text-center text-sm text-brand-muted">
          Searching…
        </div>
      ) : tests.length === 0 ? (
        <div className="rounded-lg border border-dashed border-dash-border px-3 py-8 text-center text-sm text-brand-muted">
          {searchValue.trim()
            ? "No matching tests found."
            : "No tests available."}
        </div>
      ) : (
        <ul
          className="max-h-72 divide-y divide-dash-border/70 overflow-y-auto overflow-x-hidden rounded-xl border border-dash-border/80"
          data-testid="panel-test-membership-list"
        >
          {tests.map((test) => {
            const isSelected = selectedIds.has(test.uuid);

            return (
              <li key={test.uuid}>
                <div
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-3",
                    disabled && "opacity-70",
                  )}
                  data-testid={`panel-test-membership-row-${test.uuid}`}
                >
                  <button
                    type="button"
                    disabled={disabled || isSelected}
                    onClick={() => addTest(test.uuid)}
                    className={cn(
                      "min-w-0 flex-1 text-left transition-colors",
                      !isSelected && "hover:text-brand-primary",
                      (disabled || isSelected) && "cursor-default",
                    )}
                    data-testid={`panel-test-membership-add-${test.uuid}`}
                  >
                    <p className="truncate text-sm font-medium text-brand-navy">
                      {test.name}
                    </p>
                    <p className="truncate text-xs text-brand-muted">
                      {[test.code, test.category?.trim() || null]
                        .filter(Boolean)
                        .join(" · ") || "Laboratory test"}
                    </p>
                  </button>

                  {isSelected ? (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span
                        className="inline-flex size-8 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700"
                        aria-label="Included"
                        data-testid={`panel-test-membership-included-${test.uuid}`}
                      >
                        <Check className="size-4" />
                      </span>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => removeTest(test.uuid)}
                        className={cn(
                          "inline-flex size-8 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-700 transition-colors",
                          "hover:bg-red-100 disabled:cursor-default disabled:opacity-70",
                        )}
                        aria-label={`Remove ${test.name}`}
                        data-testid={`panel-test-membership-remove-${test.uuid}`}
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => addTest(test.uuid)}
                      className={cn(
                        "inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-brand-border bg-white text-brand-primary transition-colors",
                        "hover:bg-brand-tint disabled:cursor-default disabled:opacity-70",
                      )}
                      aria-label={`Add ${test.name}`}
                      data-testid={`panel-test-membership-plus-${test.uuid}`}
                    >
                      <Plus className="size-4" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
