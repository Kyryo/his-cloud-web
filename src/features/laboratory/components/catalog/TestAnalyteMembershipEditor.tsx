"use client";

import { ArrowDown, ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { LabAnalyte } from "@/features/laboratory/types/laboratory-catalog.types";

export type TestAnalyteMembershipValue = {
  analyte_uuid: string;
  sort_order: number;
  is_required: boolean;
};

type TestAnalyteMembershipEditorProps = {
  analytes: LabAnalyte[];
  value: TestAnalyteMembershipValue[];
  onChange: (next: TestAnalyteMembershipValue[]) => void;
  disabled?: boolean;
};

function reindex(rows: TestAnalyteMembershipValue[]): TestAnalyteMembershipValue[] {
  return rows.map((row, index) => ({ ...row, sort_order: index }));
}

export function TestAnalyteMembershipEditor({
  analytes,
  value,
  onChange,
  disabled = false,
}: TestAnalyteMembershipEditorProps) {
  const selectedIds = new Set(value.map((row) => row.analyte_uuid));

  function toggleAnalyte(analyteUuid: string, checked: boolean) {
    if (checked) {
      onChange(
        reindex([
          ...value,
          { analyte_uuid: analyteUuid, sort_order: value.length, is_required: true },
        ]),
      );
      return;
    }
    onChange(reindex(value.filter((row) => row.analyte_uuid !== analyteUuid)));
  }

  function move(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= value.length) return;
    const next = [...value];
    const [row] = next.splice(index, 1);
    next.splice(nextIndex, 0, row);
    onChange(reindex(next));
  }

  function setRequired(analyteUuid: string, isRequired: boolean) {
    onChange(
      value.map((row) =>
        row.analyte_uuid === analyteUuid
          ? { ...row, is_required: isRequired }
          : row,
      ),
    );
  }

  const orderedSelected = [...value].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-3" data-testid="test-analyte-membership-editor">
      <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-brand-border p-3">
        {analytes.length === 0 ? (
          <p className="text-sm text-brand-muted">No analytes available.</p>
        ) : (
          analytes.map((analyte) => {
            const checked = selectedIds.has(analyte.uuid);
            return (
              <label
                key={analyte.uuid}
                className="flex cursor-pointer items-center gap-2 text-sm text-brand-navy"
              >
                <input
                  type="checkbox"
                  className="size-4 rounded border-brand-border"
                  checked={checked}
                  disabled={disabled}
                  onChange={(event) =>
                    toggleAnalyte(analyte.uuid, event.target.checked)
                  }
                />
                <span>
                  {analyte.code} — {analyte.name}
                </span>
              </label>
            );
          })
        )}
      </div>

      {orderedSelected.length > 0 ? (
        <div className="space-y-2 rounded-lg border border-brand-border p-3">
          <p className="text-[12px] font-medium uppercase tracking-wide text-brand-muted">
            Order &amp; required
          </p>
          {orderedSelected.map((row, index) => {
            const analyte = analytes.find((item) => item.uuid === row.analyte_uuid);
            return (
              <div
                key={row.analyte_uuid}
                className="flex flex-wrap items-center gap-2 text-sm"
              >
                <span className="min-w-0 flex-1 truncate text-brand-navy">
                  {analyte
                    ? `${analyte.code} — ${analyte.name}`
                    : row.analyte_uuid}
                </span>
                <label className="flex items-center gap-1.5 text-brand-muted">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-brand-border"
                    checked={row.is_required}
                    disabled={disabled}
                    onChange={(event) =>
                      setRequired(row.analyte_uuid, event.target.checked)
                    }
                  />
                  Required
                </label>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={disabled || index === 0}
                    onClick={() => move(index, -1)}
                    aria-label="Move up"
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={disabled || index === orderedSelected.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label="Move down"
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
