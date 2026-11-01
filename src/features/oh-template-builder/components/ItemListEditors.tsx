"use client";

import { Plus, X } from "lucide-react";
import type { ReactNode } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toUpperCode } from "@/features/oh-template-builder/lib/templateCodes";
import type {
  ItemFormInput,
  ItemFormValues,
} from "@/features/oh-template-builder/template-builder.schema";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const SCHEDULE_UNITS: Array<{ value: ItemFormValues["schedule"][number]["unit"]; label: string }> = [
  { value: "day", label: "days" },
  { value: "week", label: "weeks" },
  { value: "month", label: "months" },
  { value: "year", label: "years" },
];

function EditorBlock({
  title,
  description,
  onAdd,
  addLabel,
  children,
}: {
  title: string;
  description: string;
  onAdd: () => void;
  addLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3 border-t border-dash-border pt-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-brand-navy">{title}</h3>
          <p className="mt-0.5 text-xs leading-5 text-dash-muted">{description}</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-brand-primary transition-colors hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
        >
          <Plus className="size-3.5" aria-hidden />
          {addLabel}
        </button>
      </div>
      {children}
    </div>
  );
}

function RemoveRowButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
    >
      <X className="size-4" aria-hidden />
    </button>
  );
}

export function ItemResponsesEditor() {
  const { control, register, getValues, setValue, formState } =
    useFormContext<ItemFormInput, unknown, ItemFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "responses" });
  const errors = formState.errors.responses;

  return (
    <EditorBlock
      title="Possible outcomes"
      description="Options staff choose when recording this item, e.g. Normal or Abnormal."
      addLabel="Outcome"
      onAdd={() => append({ label: "", code: "" })}
    >
      {fields.length === 0 ? (
        <p className="text-xs text-dash-muted">No outcomes. The item is recorded as done or not done.</p>
      ) : (
        <ul className="space-y-2">
          {fields.map((field, index) => {
            const labelError = errors?.[index]?.label?.message;
            return (
              <li key={field.id}>
                <div className="flex items-center gap-2">
                  <Input
                    {...register(`responses.${index}.label`, {
                      onBlur: (event) => {
                        if (!getValues(`responses.${index}.code`).trim()) {
                          setValue(
                            `responses.${index}.code`,
                            toUpperCode(event.target.value),
                            { shouldDirty: true },
                          );
                        }
                      },
                    })}
                    placeholder="Label"
                    aria-label={`Outcome ${index + 1} label`}
                    aria-invalid={Boolean(labelError)}
                    className="h-9 flex-[3]"
                  />
                  <Input
                    {...register(`responses.${index}.code`)}
                    placeholder="CODE"
                    aria-label={`Outcome ${index + 1} code`}
                    className="h-9 flex-[2] font-mono text-xs"
                  />
                  <RemoveRowButton
                    label={`Remove outcome ${index + 1}`}
                    onClick={() => remove(index)}
                  />
                </div>
                {labelError ? (
                  <p className="mt-1 text-xs text-destructive">{labelError}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </EditorBlock>
  );
}

export function ItemScheduleEditor() {
  const { control, register, watch, setValue, formState } =
    useFormContext<ItemFormInput, unknown, ItemFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "schedule" });
  const errors = formState.errors.schedule;

  return (
    <EditorBlock
      title="Recall schedule"
      description="How often this item is due again. Drives recall reminders."
      addLabel="Interval"
      onAdd={() => append({ interval: 12, unit: "month", notes: "" })}
    >
      {fields.length === 0 ? (
        <p className="text-xs text-dash-muted">Not scheduled.</p>
      ) : (
        <ul className="space-y-2">
          {fields.map((field, index) => {
            const intervalError = errors?.[index]?.interval?.message;
            return (
              <li key={field.id} className="rounded-xl bg-slate-50 p-2.5">
                <div className="flex items-center gap-2">
                  <span className="pl-1 text-xs text-dash-muted">Every</span>
                  <Input
                    type="number"
                    min={1}
                    {...register(`schedule.${index}.interval`, { valueAsNumber: true })}
                    aria-label={`Interval ${index + 1}`}
                    aria-invalid={Boolean(intervalError)}
                    className="h-9 w-20 bg-white"
                  />
                  <Select
                    value={watch(`schedule.${index}.unit`)}
                    onValueChange={(value) =>
                      setValue(
                        `schedule.${index}.unit`,
                        value as ItemFormValues["schedule"][number]["unit"],
                        { shouldDirty: true },
                      )
                    }
                  >
                    <SelectTrigger
                      aria-label={`Interval ${index + 1} unit`}
                      className="h-9 flex-1 bg-white"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={cn(appFont.className)}>
                      {SCHEDULE_UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <RemoveRowButton
                    label={`Remove interval ${index + 1}`}
                    onClick={() => remove(index)}
                  />
                </div>
                <Input
                  {...register(`schedule.${index}.notes`)}
                  placeholder="Note, e.g. after 40 years of age"
                  aria-label={`Interval ${index + 1} note`}
                  className="mt-2 h-9 bg-white"
                />
                {intervalError ? (
                  <p className="mt-1 text-xs text-destructive">{intervalError}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </EditorBlock>
  );
}
