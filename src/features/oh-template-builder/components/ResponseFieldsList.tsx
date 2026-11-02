"use client";

import {
  Calendar,
  Hash,
  ListChecks,
  Paperclip,
  Plus,
  Trash2,
  Type,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { PrimaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { FormsIllustration } from "@/features/oh-template-builder/components/UndrawIllustrations";
import { toSectionCode } from "@/features/oh-template-builder/lib/templateCodes";
import type { OhResponseField } from "@/features/occupational-health/types";
import { ResponseConfigFields } from "@/features/settings/components/modules/occupational-health/template-library/ResponseConfigFields";
import {
  defaultResponseField,
  normalizeResponseField,
} from "@/features/settings/components/modules/occupational-health/template-library/responseConfig";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type ResponseFieldsListProps = {
  title: string;
  value: OhResponseField[];
  onChange: (next: OhResponseField[]) => void;
  emptyHint: string;
};

const FIELD_TYPE_ICONS: Record<string, LucideIcon> = {
  text: Type,
  number: Hash,
  decimal: Hash,
  date: Calendar,
  datetime: Calendar,
  time: Calendar,
  boolean: ListChecks,
  single_select: ListChecks,
  multi_select: ListChecks,
  file: Paperclip,
};

type FieldDraft = {
  index: number | null;
  field: OhResponseField;
  codeTouched: boolean;
};

function responseTypeLabel(type: string) {
  return type.replaceAll("_", " ");
}

export function ResponseFieldsList({ title, value, onChange, emptyHint }: ResponseFieldsListProps) {
  const [draft, setDraft] = useState<FieldDraft | null>(null);

  function openNew() {
    const nextIndex = value.length + 1;
    setDraft({
      index: null,
      codeTouched: false,
      field: defaultResponseField("text", { code: `field_${nextIndex}`, label: "" }),
    });
  }

  function commit(field: OhResponseField, index: number | null) {
    const label = field.label.trim();
    const code = toSectionCode(field.code);
    if (!label || !code) {
      return false;
    }
    const next = normalizeResponseField({ ...field, label, code }, index ?? value.length);
    if (index === null) {
      onChange([...value, next]);
    } else {
      onChange(value.map((row, rowIndex) => (rowIndex === index ? next : row)));
    }
    return true;
  }

  function removeAt(index: number) {
    onChange(value.filter((_, rowIndex) => rowIndex !== index));
  }

  return (
    <div>
      {value.length === 0 ? (
        <div className="flex flex-col items-center px-2 py-6 text-center">
          <FormsIllustration className="h-28 w-auto text-brand-primary" />
          <p className="mt-4 text-[14px] font-medium text-brand-navy">{title}</p>
          <p className="mt-1 max-w-[32ch] text-[12.5px] leading-5 text-dash-muted">{emptyHint}</p>
          <button
            type="button"
            onClick={openNew}
            className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-primary px-3 text-[13px] font-medium text-white transition-colors hover:bg-brand-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
          >
            <Plus className="size-3.5" aria-hidden />
            Add field
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-medium text-brand-navy">{title}</p>
            <button
              type="button"
              onClick={openNew}
              className="inline-flex h-7 items-center gap-1 rounded-md px-1.5 text-[13px] font-medium text-brand-primary hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
            >
              <Plus className="size-3.5" aria-hidden />
              Add
            </button>
          </div>
          <ul className="mt-2">
            {value.map((field, index) => {
              const TypeIcon = FIELD_TYPE_ICONS[field.response_type] ?? Type;
              return (
                <li key={`${field.code}-${index}`} className="group flex items-center">
                  <button
                    type="button"
                    onClick={() => setDraft({ index, field, codeTouched: true })}
                    className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md py-1.5 pr-1 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-tint text-brand-primary">
                      <TypeIcon className="size-3.5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] text-brand-navy">{field.label}</span>
                      <span className="block truncate text-[11.5px] capitalize text-dash-muted">
                        {responseTypeLabel(field.response_type)}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${field.label}`}
                    onClick={() => removeAt(index)}
                    className="flex size-7 shrink-0 items-center justify-center rounded text-slate-300 opacity-0 transition-opacity hover:text-red-600 focus-visible:opacity-100 focus-visible:outline-none group-hover:opacity-100"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {draft ? (
        <FieldSheet
          draft={draft}
          onDraftChange={setDraft}
          onOpenChange={(open) => {
            if (!open) {
              setDraft(null);
            }
          }}
          onCommit={() => {
            if (commit(draft.field, draft.index)) {
              setDraft(null);
            }
          }}
          onRemove={
            draft.index === null
              ? null
              : () => {
                  removeAt(draft.index as number);
                  setDraft(null);
                }
          }
        />
      ) : null}
    </div>
  );
}

function FieldSheet({
  draft,
  onDraftChange,
  onOpenChange,
  onCommit,
  onRemove,
}: {
  draft: FieldDraft;
  onDraftChange: (draft: FieldDraft) => void;
  onOpenChange: (open: boolean) => void;
  onCommit: () => void;
  onRemove: (() => void) | null;
}) {
  const isNew = draft.index === null;
  const labelMissing = draft.field.label.trim().length === 0;
  const [showError, setShowError] = useState(false);

  function patch(partial: Partial<OhResponseField>, codeTouched = draft.codeTouched) {
    onDraftChange({ ...draft, codeTouched, field: { ...draft.field, ...partial } });
  }

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(appFont.className, "flex w-full flex-col gap-0 p-0 sm:max-w-[400px]")}
      >
        <div className="border-b border-dash-border px-5 py-4 pr-12">
          <SheetTitle className="text-base font-semibold text-brand-navy">
            {isNew ? "Add field" : "Edit field"}
          </SheetTitle>
          <SheetDescription className="mt-0.5 text-[13px] text-dash-muted">
            {isNew
              ? "Shown to staff when they reach this part of the form."
              : "Changes apply when you save."}
          </SheetDescription>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="space-y-1.5">
            <label htmlFor="oh-field-label" className="text-[13px] font-medium text-brand-navy">
              Label <RequiredFieldMarker />
            </label>
            <Input
              id="oh-field-label"
              autoFocus
              value={draft.field.label}
              placeholder="e.g. Blood pressure"
              className="h-9 text-[13.5px]"
              onChange={(event) => {
                const label = event.target.value;
                patch(
                  {
                    label,
                    code: draft.codeTouched ? draft.field.code : toSectionCode(label),
                  },
                  draft.codeTouched,
                );
              }}
            />
            {showError && labelMissing ? (
              <p className="text-xs text-red-600">Give the field a label.</p>
            ) : (
              <p className="text-[12px] text-dash-muted">
                Code <span className="font-mono text-brand-slate">{draft.field.code || "auto"}</span>
              </p>
            )}
          </div>

          <ResponseConfigFields
            value={draft.field}
            onChange={(config) => patch(config)}
          />
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-dash-border px-5 py-3">
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="h-9 text-[13px] text-red-600 hover:underline"
            >
              Remove
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-9 rounded-md px-3 text-[13px] text-brand-slate hover:bg-slate-100"
            >
              Cancel
            </button>
            <PrimaryButton
              type="button"
              className="h-9 text-[13px]"
              onClick={() => {
                if (labelMissing || !toSectionCode(draft.field.code)) {
                  setShowError(true);
                  return;
                }
                onCommit();
              }}
            >
              {isNew ? "Add field" : "Done"}
            </PrimaryButton>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
