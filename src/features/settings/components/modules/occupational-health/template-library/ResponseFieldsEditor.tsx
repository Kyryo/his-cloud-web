"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OhResponseField } from "@/features/occupational-health/types";
import { ResponseConfigFields } from "@/features/settings/components/modules/occupational-health/template-library/ResponseConfigFields";
import {
  defaultResponseField,
  normalizeResponseField,
  normalizeResponseFields,
} from "@/features/settings/components/modules/occupational-health/template-library/responseConfig";
import { toSectionCode } from "@/features/oh-template-builder/lib/templateCodes";
import { cn } from "@/lib/utils";

type ResponseFieldsEditorProps = {
  value: OhResponseField[];
  onChange: (next: OhResponseField[]) => void;
  disabled?: boolean;
  emptyHint?: string;
  className?: string;
};

export function ResponseFieldsEditor({
  value,
  onChange,
  disabled,
  emptyHint = "No fields yet. Add a field to capture typed values.",
  className,
}: ResponseFieldsEditorProps) {
  const fields = normalizeResponseFields(value);

  function updateAt(index: number, next: OhResponseField) {
    const copy = [...fields];
    copy[index] = normalizeResponseField(next, index);
    onChange(copy);
  }

  function removeAt(index: number) {
    onChange(fields.filter((_, i) => i !== index));
  }

  function addField() {
    const nextIndex = fields.length + 1;
    onChange([
      ...fields,
      defaultResponseField("text", {
        code: `field_${nextIndex}`,
        label: `Field ${nextIndex}`,
      }),
    ]);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= fields.length) {
      return;
    }
    const copy = [...fields];
    const [row] = copy.splice(index, 1);
    copy.splice(target, 0, row);
    onChange(copy);
  }

  return (
    <div className={cn("space-y-3", className)}>
      {fields.length === 0 ? (
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-dash-muted">
          {emptyHint}
        </p>
      ) : (
        <ul className="space-y-3">
          {fields.map((field, index) => (
            <li
              key={`${field.code}-${index}`}
              className="space-y-3 rounded-xl border border-dash-border p-3"
            >
              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-1 pt-1">
                  <button
                    type="button"
                    aria-label="Move field up"
                    disabled={disabled || index === 0}
                    onClick={() => move(index, -1)}
                    className="flex size-7 items-center justify-center rounded text-dash-muted hover:bg-slate-100 disabled:opacity-30"
                  >
                    <GripVertical className="size-3.5 rotate-90" aria-hidden />
                  </button>
                </div>
                <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Label</Label>
                    <Input
                      value={field.label}
                      disabled={disabled}
                      onChange={(event) => {
                        const label = event.target.value;
                        const codeDirty = field.code !== toSectionCode(field.label);
                        updateAt(index, {
                          ...field,
                          label,
                          code: codeDirty ? field.code : toSectionCode(label) || field.code,
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Code</Label>
                    <Input
                      value={field.code}
                      disabled={disabled}
                      className="font-mono text-[13px]"
                      onChange={(event) =>
                        updateAt(index, {
                          ...field,
                          code: toSectionCode(event.target.value) || field.code,
                        })
                      }
                    />
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Remove field"
                  disabled={disabled}
                  onClick={() => removeAt(index)}
                  className="mt-6 flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
              <ResponseConfigFields
                value={field}
                disabled={disabled}
                onChange={(config) => updateAt(index, { ...field, ...config })}
              />
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={addField}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:underline disabled:opacity-50"
      >
        <Plus className="size-3.5" aria-hidden />
        Add field
      </button>
    </div>
  );
}
