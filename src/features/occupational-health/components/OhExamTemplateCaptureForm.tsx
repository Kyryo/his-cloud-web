"use client";

import { Check } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OhResponseField } from "@/features/occupational-health/types";
import {
  emptyExamTemplateAnswers,
  fieldOwnerKey,
  type ExamTemplateAnswers,
  type ExamTemplateSnapshot,
  type ExamTemplateSnapshotItem,
  type ExamTemplateSnapshotSection,
} from "@/features/occupational-health/lib/exam-template-snapshot";
import { cn } from "@/lib/utils";

type OhExamTemplateCaptureFormProps = {
  snapshot: ExamTemplateSnapshot;
  templateName?: string | null;
  value?: ExamTemplateAnswers;
  onChange: (next: ExamTemplateAnswers) => void;
  disabled?: boolean;
};

export function OhExamTemplateCaptureForm({
  snapshot,
  templateName,
  value,
  onChange,
  disabled,
}: OhExamTemplateCaptureFormProps) {
  const answers = value ?? emptyExamTemplateAnswers();

  function setPicks(sectionCode: string, next: string[]) {
    onChange({
      ...answers,
      picks: { ...answers.picks, [sectionCode]: next },
    });
  }

  function setField(owner: string, fieldCode: string, fieldValue: string) {
    onChange({
      ...answers,
      fields: {
        ...answers.fields,
        [owner]: {
          ...(answers.fields[owner] ?? {}),
          [fieldCode]: fieldValue,
        },
      },
    });
  }

  return (
    <div data-testid="oh-exam-template-capture">
      <header className="pb-4">
        <h2 className="text-lg font-semibold tracking-tight text-brand-navy">
          {templateName?.trim() || "Examination template"}
        </h2>
      </header>

      <ol className="space-y-0">
        {snapshot.sections.map((section, index) => (
          <CaptureSection
            key={section.code}
            section={section}
            index={index}
            answers={answers}
            disabled={disabled}
            onSetPicks={setPicks}
            onSetField={setField}
          />
        ))}
      </ol>
    </div>
  );
}

function CaptureSection({
  section,
  index,
  answers,
  disabled,
  onSetPicks,
  onSetField,
}: {
  section: ExamTemplateSnapshotSection;
  index: number;
  answers: ExamTemplateAnswers;
  disabled?: boolean;
  onSetPicks: (sectionCode: string, next: string[]) => void;
  onSetField: (owner: string, fieldCode: string, value: string) => void;
}) {
  const isDirect = section.content_mode === "direct";
  const exclusive = section.selection_mode === "exclusive";
  const picked = answers.picks[section.code] ?? [];
  const headingId = `exam-section-${section.code}`;

  function toggleItem(itemCode: string) {
    if (disabled) {
      return;
    }
    if (exclusive) {
      onSetPicks(section.code, picked.includes(itemCode) ? [] : [itemCode]);
      return;
    }
    onSetPicks(
      section.code,
      picked.includes(itemCode)
        ? picked.filter((code) => code !== itemCode)
        : [...picked, itemCode],
    );
  }

  return (
    <li className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 border-t border-dash-border py-4">
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-6 items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums",
          picked.length > 0 || isDirect
            ? "border-brand-primary bg-brand-primary text-white"
            : "border-dash-border text-dash-muted",
        )}
      >
        {index + 1}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 id={headingId} className="text-[14.5px] font-semibold tracking-tight text-brand-navy">
            {section.name}
            {section.is_mandatory ? (
              <span className="ml-1 text-brand-primary" aria-label="Required">
                *
              </span>
            ) : null}
          </h3>
          <span className="text-xs text-dash-muted">
            {isDirect
              ? "Enter values"
              : exclusive
                ? "Choose one"
                : "Choose all that apply"}
          </span>
        </div>

        {isDirect ? (
          <div className="mt-4 space-y-3">
            {(section.response_fields ?? []).map((field) => (
              <FieldInput
                key={field.code}
                field={field}
                value={answers.fields[fieldOwnerKey(section.code)]?.[field.code] ?? ""}
                disabled={disabled}
                onChange={(next) =>
                  onSetField(fieldOwnerKey(section.code), field.code, next)
                }
              />
            ))}
            {(section.response_fields ?? []).length === 0 ? (
              <p className="text-sm text-dash-muted">No fields configured on this section.</p>
            ) : null}
          </div>
        ) : section.items.length === 0 ? (
          <p className="mt-3 text-sm text-dash-muted">No items in this section.</p>
        ) : (
          <ul
            role={exclusive ? "radiogroup" : "group"}
            aria-labelledby={headingId}
            className="-mx-1 mt-2 grid gap-px sm:grid-cols-2"
          >
            {section.items.map((item) => (
              <CaptureItem
                key={item.code}
                item={item}
                sectionCode={section.code}
                exclusive={exclusive}
                checked={picked.includes(item.code)}
                answers={answers}
                disabled={disabled}
                onToggle={() => toggleItem(item.code)}
                onSetField={onSetField}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

function CaptureItem({
  item,
  sectionCode,
  exclusive,
  checked,
  answers,
  disabled,
  onToggle,
  onSetField,
}: {
  item: ExamTemplateSnapshotItem;
  sectionCode: string;
  exclusive: boolean;
  checked: boolean;
  answers: ExamTemplateAnswers;
  disabled?: boolean;
  onToggle: () => void;
  onSetField: (owner: string, fieldCode: string, value: string) => void;
}) {
  const promptFields = (item.response_fields ?? []).filter(
    (field) => field.prompt_after_select !== false,
  );
  const owner = fieldOwnerKey(sectionCode, item.code);

  return (
    <li
      className={cn(
        "rounded-md transition-colors",
        promptFields.length > 0 && checked && "sm:col-span-2",
        checked ? "bg-brand-tint/55" : "hover:bg-slate-50",
      )}
    >
      <button
        type="button"
        role={exclusive ? "radio" : "checkbox"}
        aria-checked={checked}
        disabled={disabled}
        onClick={onToggle}
        className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[13.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 disabled:opacity-60"
      >
        <SelectionGlyph exclusive={exclusive} checked={checked} />
        <span className={cn("min-w-0 flex-1", checked ? "font-medium text-brand-navy" : "text-brand-navy")}>
          {item.name}
        </span>
      </button>
      {checked && promptFields.length > 0 ? (
        <div className="space-y-3 pb-3 pl-10 pr-2">
          {promptFields.map((field) =>
            field.options?.length ? (
              <OptionField
                key={field.code}
                field={field}
                value={answers.fields[owner]?.[field.code] ?? ""}
                disabled={disabled}
                onChange={(next) => onSetField(owner, field.code, next)}
              />
            ) : (
              <FieldInput
                key={field.code}
                field={field}
                value={answers.fields[owner]?.[field.code] ?? ""}
                disabled={disabled}
                onChange={(next) => onSetField(owner, field.code, next)}
              />
            ),
          )}
        </div>
      ) : null}
    </li>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  disabled,
}: {
  field: OhResponseField;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const inputType =
    field.response_type === "number" || field.response_type === "decimal"
      ? "number"
      : field.response_type === "date"
        ? "date"
        : field.response_type === "datetime"
          ? "datetime-local"
          : field.response_type === "time"
            ? "time"
            : "text";

  if (field.options?.length) {
    return (
      <OptionField field={field} value={value} onChange={onChange} disabled={disabled} />
    );
  }

  return (
    <label className="block space-y-1.5">
      <Label className="text-xs font-medium text-brand-slate">{field.label}</Label>
      <Input
        type={inputType}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.response_type.replaceAll("_", " ")}
      />
    </label>
  );
}

function OptionField({
  field,
  value,
  onChange,
  disabled,
}: {
  field: OhResponseField;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-brand-slate">{field.label}</p>
      <div role="radiogroup" aria-label={field.label} className="flex flex-wrap gap-1.5">
        {field.options.map((option) => {
          const selected = value === option.code;
          return (
            <button
              key={option.code}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(option.code)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 disabled:opacity-60",
                selected
                  ? "border-brand-primary bg-brand-primary font-medium text-white"
                  : "border-brand-primary/20 bg-white text-brand-slate hover:border-brand-primary/50 hover:text-brand-navy",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SelectionGlyph({
  exclusive,
  checked,
}: {
  exclusive: boolean;
  checked: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-[18px] shrink-0 items-center justify-center border-[1.5px]",
        exclusive ? "rounded-full" : "rounded-[5px]",
        checked
          ? exclusive
            ? "border-brand-primary bg-white"
            : "border-brand-primary bg-brand-primary"
          : "border-slate-300 bg-white",
      )}
    >
      {checked ? (
        exclusive ? (
          <span className="size-2 rounded-full bg-brand-primary" />
        ) : (
          <Check className="size-3 text-white" strokeWidth={3} />
        )
      ) : null}
    </span>
  );
}
