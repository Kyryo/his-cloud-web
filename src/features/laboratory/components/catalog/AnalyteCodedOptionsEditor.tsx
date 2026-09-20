"use client";

import { Plus, Trash2 } from "lucide-react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AnalyteCodedOptionFormValues } from "@/features/laboratory/schemas/analyte.schema";

type AnalyteCodedOptionsEditorProps = {
  value: AnalyteCodedOptionFormValues[];
  onChange: (next: AnalyteCodedOptionFormValues[]) => void;
  disabled?: boolean;
  error?: string | null;
};

export function AnalyteCodedOptionsEditor({
  value,
  onChange,
  disabled = false,
  error = null,
}: AnalyteCodedOptionsEditorProps) {
  function updateRow(
    index: number,
    patch: Partial<AnalyteCodedOptionFormValues>,
  ) {
    onChange(
      value.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
  }

  function removeRow(index: number) {
    onChange(value.filter((_, rowIndex) => rowIndex !== index));
  }

  function addRow() {
    onChange([...value, { code: "", label: "" }]);
  }

  return (
    <div className="space-y-3" data-testid="analyte-coded-options-editor">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <Label>Coded options</Label>
          <p className="text-xs text-brand-muted">
            Define the allowed codes and display labels for result entry.
          </p>
        </div>
        <SecondaryButton
          type="button"
          size="sm"
          className="h-8 gap-1.5"
          disabled={disabled}
          onClick={addRow}
          data-testid="analyte-coded-option-add"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Add option
        </SecondaryButton>
      </div>

      {value.length === 0 ? (
        <p className="text-sm text-brand-muted">
          No coded options yet. Add at least one option.
        </p>
      ) : (
        <div className="space-y-2">
          {value.map((row, index) => (
            <div
              key={`coded-option-${index}`}
              className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] gap-2"
            >
              <Input
                value={row.code}
                disabled={disabled}
                placeholder="Code"
                aria-label={`Option ${index + 1} code`}
                onChange={(event) =>
                  updateRow(index, { code: event.target.value })
                }
              />
              <Input
                value={row.label}
                disabled={disabled}
                placeholder="Label"
                aria-label={`Option ${index + 1} label`}
                onChange={(event) =>
                  updateRow(index, { label: event.target.value })
                }
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                disabled={disabled}
                onClick={() => removeRow(index)}
                aria-label={`Remove option ${index + 1}`}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
