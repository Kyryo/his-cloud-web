"use client";

import { ArrowDown, ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { LabTestDefinition } from "@/features/laboratory/types/laboratory-catalog.types";

export type PanelTestMembershipValue = {
  test_uuid: string;
  sort_order: number;
};

type PanelTestMembershipEditorProps = {
  tests: LabTestDefinition[];
  value: PanelTestMembershipValue[];
  onChange: (next: PanelTestMembershipValue[]) => void;
  disabled?: boolean;
};

function reindex(rows: PanelTestMembershipValue[]): PanelTestMembershipValue[] {
  return rows.map((row, index) => ({ ...row, sort_order: index }));
}

export function PanelTestMembershipEditor({
  tests,
  value,
  onChange,
  disabled = false,
}: PanelTestMembershipEditorProps) {
  const selectedIds = new Set(value.map((row) => row.test_uuid));

  function toggleTest(testUuid: string, checked: boolean) {
    if (checked) {
      onChange(
        reindex([
          ...value,
          { test_uuid: testUuid, sort_order: value.length },
        ]),
      );
      return;
    }
    onChange(reindex(value.filter((row) => row.test_uuid !== testUuid)));
  }

  function move(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= value.length) return;
    const next = [...value];
    const [row] = next.splice(index, 1);
    next.splice(nextIndex, 0, row);
    onChange(reindex(next));
  }

  const orderedSelected = [...value].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-3" data-testid="panel-test-membership-editor">
      <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-brand-border p-3">
        {tests.length === 0 ? (
          <p className="text-sm text-brand-muted">No tests available.</p>
        ) : (
          tests.map((test) => {
            const checked = selectedIds.has(test.uuid);
            return (
              <label
                key={test.uuid}
                className="flex cursor-pointer items-center gap-2 text-sm text-brand-navy"
              >
                <input
                  type="checkbox"
                  className="size-4 rounded border-brand-border"
                  checked={checked}
                  disabled={disabled}
                  onChange={(event) =>
                    toggleTest(test.uuid, event.target.checked)
                  }
                />
                <span>
                  {test.code} — {test.name}
                </span>
              </label>
            );
          })
        )}
      </div>

      {orderedSelected.length > 0 ? (
        <div className="space-y-2 rounded-lg border border-brand-border p-3">
          <p className="text-[12px] font-medium uppercase tracking-wide text-brand-muted">
            Order
          </p>
          {orderedSelected.map((row, index) => {
            const test = tests.find((item) => item.uuid === row.test_uuid);
            return (
              <div
                key={row.test_uuid}
                className="flex flex-wrap items-center gap-2 text-sm"
              >
                <span className="min-w-0 flex-1 truncate text-brand-navy">
                  {test ? `${test.code} — ${test.name}` : row.test_uuid}
                </span>
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
