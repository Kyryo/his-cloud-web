"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, RotateCcw } from "lucide-react";
import { useState } from "react";

import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import {
  useSectionItems,
  useTemplateBuilder,
} from "@/features/oh-template-builder/hooks/useTemplateBuilder";
import {
  isPreviewSectionAnswered,
  previewProgress,
  setPreviewValue,
  togglePreviewPick,
  type PreviewAnswers,
  type PreviewValues,
} from "@/features/oh-template-builder/lib/previewAnswers";
import {
  TEMPLATE_KIND_ICONS,
  TEMPLATE_KIND_META,
} from "@/features/oh-template-builder/lib/templateKinds";
import type {
  BuilderAttachment,
  BuilderItem,
  TemplateKind,
} from "@/features/oh-template-builder/template-builder.types";
import type { OhResponseField } from "@/features/occupational-health/types";
import { cn } from "@/lib/utils";

const RECORD_FIELDS = ["Employee", "Employer", "Job title", "Examination date"] as const;
const SPRING = { type: "spring", stiffness: 520, damping: 34 } as const;

type ValueChange = (ownerUuid: string, fieldCode: string, value: string) => void;

function sectionAnchorId(attachmentUuid: string) {
  return `preview-section-${attachmentUuid}`;
}

/** The form as a clinician fills it in. Answers live in memory only. */
export function TemplatePreview() {
  const { kind, template, attachments, isLoading } = useTemplateBuilder();
  const [answers, setAnswers] = useState<PreviewAnswers>({});
  const [values, setValues] = useState<PreviewValues>({});
  const progress = previewProgress(attachments, answers, values);
  const hasAnswers =
    Object.values(answers).some((picked) => picked.length > 0) ||
    Object.values(values).some((fields) => Object.values(fields).some(Boolean));
  const answeredByUuid = new Map(
    attachments.map((attachment) => [
      attachment.uuid,
      isPreviewSectionAnswered(attachment, answers, values),
    ]),
  );
  const meta = TEMPLATE_KIND_META[kind];
  const Icon = TEMPLATE_KIND_ICONS[kind];
  const onValue: ValueChange = (ownerUuid, fieldCode, value) =>
    setValues((current) => setPreviewValue(current, ownerUuid, fieldCode, value));

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-dash-canvas">
      <ProgressRail
        answered={progress.answered}
        total={progress.total}
        canClear={hasAnswers}
        onClear={() => {
          setAnswers({});
          setValues({});
        }}
      />

      <div className="mx-auto flex w-full max-w-[74rem] items-start gap-10 px-3 pb-20 pt-6 sm:px-6">
        {attachments.length > 0 ? (
          <SectionNav attachments={attachments} answeredByUuid={answeredByUuid} />
        ) : null}

        <article className="mx-auto w-full min-w-0 max-w-[46rem] overflow-hidden rounded-[4px] bg-white shadow-[0_0_0_1px_rgb(31_42_36/0.06),0_1px_2px_rgb(31_42_36/0.05),0_24px_48px_-28px_rgb(31_42_36/0.28)]">
          <div className="h-1 bg-brand-primary" aria-hidden />

          <div className="px-5 pb-8 pt-6 sm:px-10 sm:pt-8">
            <header>
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-full border border-brand-primary/25 text-brand-primary">
                    <Icon className="size-4" strokeWidth={1.7} aria-hidden />
                  </span>
                  <div className="text-[11.5px] leading-4">
                    <p className="font-semibold text-brand-navy">Occupational health</p>
                    <p className="text-dash-muted">
                      {kind === "certificate" ? "Certificate of fitness" : meta.label}
                    </p>
                  </div>
                </div>
                <p className="font-mono text-[11px] text-dash-muted">{template?.code}</p>
              </div>

              <h1 className="mt-5 text-[22px] font-semibold leading-tight tracking-tight text-brand-navy sm:text-2xl">
                {template?.name ?? "\u00a0"}
              </h1>
              <div className="mt-4 border-b-[3px] border-double border-brand-navy/80" aria-hidden />

              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                {RECORD_FIELDS.map((field) => (
                  <div key={field}>
                    <p className="text-[11px] font-medium text-dash-muted">{field}</p>
                    <span className="mt-3 block border-b border-slate-300" aria-hidden />
                  </div>
                ))}
              </div>
            </header>

            <div className="mt-6">
              {isLoading ? (
                <PreviewSkeleton />
              ) : attachments.length === 0 ? (
                <p className="border-t border-dash-border py-10 text-center text-[13px] text-dash-muted">
                  This template has no sections yet. Switch to Build to add some.
                </p>
              ) : (
                <ol>
                  {attachments.map((attachment, index) => (
                    <PreviewSection
                      key={attachment.uuid}
                      attachment={attachment}
                      index={index}
                      isAnswered={answeredByUuid.get(attachment.uuid) ?? false}
                      picked={answers[attachment.uuid] ?? []}
                      values={values}
                      onValue={onValue}
                      onToggle={(itemUuid) =>
                        setAnswers((current) => ({
                          ...current,
                          [attachment.uuid]: togglePreviewPick(
                            current[attachment.uuid] ?? [],
                            itemUuid,
                            attachment.section?.selectionMode ?? "inclusive",
                          ),
                        }))
                      }
                    />
                  ))}
                </ol>
              )}
            </div>

            <SignOff kind={kind} />
          </div>

          <footer className="flex items-center justify-between gap-4 border-t border-dash-border bg-slate-50/70 px-5 py-2.5 text-[11px] text-dash-muted sm:px-10">
            <span>Preview only. Not a valid record.</span>
            <span className="font-mono">{template?.code}</span>
          </footer>
        </article>

        {attachments.length > 0 ? <div className="hidden w-44 shrink-0 2xl:block" aria-hidden /> : null}
      </div>
    </div>
  );
}

function SectionNav({
  attachments,
  answeredByUuid,
}: {
  attachments: BuilderAttachment[];
  answeredByUuid: ReadonlyMap<string, boolean>;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <nav aria-label="Form sections" className="sticky top-16 hidden w-44 shrink-0 xl:block">
      <p className="px-2 text-[11px] font-medium text-dash-muted">Sections</p>
      <ol className="mt-1.5 space-y-px">
        {attachments.map((attachment, index) => {
          const answered = answeredByUuid.get(attachment.uuid) ?? false;
          return (
            <li key={attachment.uuid}>
              <a
                href={`#${sectionAnchorId(attachment.uuid)}`}
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById(sectionAnchorId(attachment.uuid))?.scrollIntoView({
                    behavior: reduceMotion ? "auto" : "smooth",
                    block: "start",
                  });
                }}
                className="flex h-7 items-center gap-2 rounded-md px-2 text-[12.5px] text-brand-slate transition-colors hover:bg-white hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full text-[9.5px] font-semibold tabular-nums transition-colors",
                    answered
                      ? "bg-brand-primary text-white"
                      : "border border-slate-300 text-dash-muted",
                  )}
                >
                  {answered ? <Check className="size-2.5" strokeWidth={3} /> : index + 1}
                </span>
                <span className="truncate">{attachment.section?.name ?? "Untitled section"}</span>
                {attachment.section?.isMandatory ? (
                  <span className="sr-only">(required)</span>
                ) : null}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function ProgressRail({
  answered,
  total,
  canClear,
  onClear,
}: {
  answered: number;
  total: number;
  canClear: boolean;
  onClear: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const ratio = total === 0 ? 0 : answered / total;
  const isComplete = total > 0 && answered === total;

  return (
    <div className="sticky top-0 z-10 border-b border-dash-border bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-10 max-w-[74rem] items-center gap-4 px-3 sm:px-6">
        <p className="truncate text-[12.5px] text-dash-muted">
          Filling in as a clinician. Nothing is saved.
        </p>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {total > 0 ? (
            <div className="flex items-center gap-2.5" aria-live="polite">
              <span className="relative hidden h-1 w-24 overflow-hidden rounded-full bg-slate-200 sm:block">
                <motion.span
                  className={cn(
                    "absolute inset-0 origin-left rounded-full",
                    isComplete ? "bg-emerald-500" : "bg-brand-primary",
                  )}
                  initial={false}
                  animate={{ scaleX: ratio }}
                  transition={reduceMotion ? { duration: 0 } : SPRING}
                />
              </span>
              <span className="text-xs tabular-nums text-brand-slate">
                <span className="font-semibold text-brand-navy">{answered}</span>/{total} required
              </span>
            </div>
          ) : null}
          <button
            type="button"
            onClick={onClear}
            disabled={!canClear}
            className="flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-brand-primary transition-colors hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 disabled:pointer-events-none disabled:text-slate-300"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

type PreviewSectionProps = {
  attachment: BuilderAttachment;
  index: number;
  isAnswered: boolean;
  picked: readonly string[];
  values: PreviewValues;
  onToggle: (itemUuid: string) => void;
  onValue: ValueChange;
};

function PreviewSection({
  attachment,
  index,
  isAnswered,
  picked,
  values,
  onToggle,
  onValue,
}: PreviewSectionProps) {
  const reduceMotion = useReducedMotion();
  const itemsQuery = useSectionItems(attachment.sectionUuid);
  const section = attachment.section;
  const isDirect = section?.contentMode === "direct";
  const mode = section?.selectionMode ?? "inclusive";
  const items = itemsQuery.data?.items ?? [];
  const headingId = `preview-heading-${attachment.uuid}`;
  const modeLabel = isDirect
    ? "Enter values"
    : mode === "exclusive"
      ? "Choose one"
      : "Choose all that apply";

  return (
    <li
      id={sectionAnchorId(attachment.uuid)}
      className="grid scroll-mt-14 grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 border-t border-dash-border py-5"
    >
      <span
        aria-hidden
        className={cn(
          "relative mt-px flex size-6 items-center justify-center overflow-hidden rounded-full border text-[11px] font-semibold tabular-nums transition-colors duration-200",
          isAnswered
            ? "border-brand-primary bg-brand-primary text-white"
            : "border-dash-border text-dash-muted",
        )}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={isAnswered ? "done" : "number"}
            initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduceMotion ? undefined : { scale: 0.4, opacity: 0 }}
            transition={SPRING}
          >
            {isAnswered ? <Check className="size-3.5" strokeWidth={2.75} /> : index + 1}
          </motion.span>
        </AnimatePresence>
      </span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 pt-0.5">
          <h2 id={headingId} className="text-[14.5px] font-semibold tracking-tight text-brand-navy">
            {section?.name ?? "Untitled section"}
            {section?.isMandatory ? (
              <span className="ml-1">
                <RequiredFieldMarker />
              </span>
            ) : null}
          </h2>
          <span className="text-[11.5px] text-dash-muted">{modeLabel}</span>
        </div>

        {isDirect ? (
          (section?.defaultResponseFields.length ?? 0) === 0 ? (
            <p className="mt-2 text-[13px] text-dash-muted">No fields set up on this section yet.</p>
          ) : (
            <div className="mt-3 grid gap-x-4 gap-y-3 sm:grid-cols-2">
              {section?.defaultResponseFields.map((field) => (
                <PreviewFieldInput
                  key={field.code}
                  field={field}
                  value={values[attachment.uuid]?.[field.code] ?? ""}
                  onChange={(value) => onValue(attachment.uuid, field.code, value)}
                />
              ))}
            </div>
          )
        ) : itemsQuery.isPending ? (
          <div className="mt-3 space-y-1.5" aria-hidden>
            <div className="h-8 animate-pulse rounded-md bg-slate-50" />
            <div className="h-8 animate-pulse rounded-md bg-slate-50" />
          </div>
        ) : items.length === 0 ? (
          <p className="mt-2 text-[13px] text-dash-muted">No items in this section yet.</p>
        ) : (
          <ul
            role={mode === "exclusive" ? "radiogroup" : "group"}
            aria-labelledby={headingId}
            className="-mx-2.5 mt-2 grid gap-px sm:grid-cols-2"
          >
            {items.map((item) => (
              <PreviewOption
                key={item.uuid}
                item={item}
                exclusive={mode === "exclusive"}
                checked={picked.includes(item.uuid)}
                values={values[item.uuid] ?? {}}
                onToggle={() => onToggle(item.uuid)}
                onValue={(fieldCode, value) => onValue(item.uuid, fieldCode, value)}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

type PreviewOptionProps = {
  item: BuilderItem;
  exclusive: boolean;
  checked: boolean;
  values: Readonly<Record<string, string>>;
  onToggle: () => void;
  onValue: (fieldCode: string, value: string) => void;
};

function PreviewOption({ item, exclusive, checked, values, onToggle, onValue }: PreviewOptionProps) {
  const reduceMotion = useReducedMotion();
  const promptFields = item.effectiveResponseFields.filter(
    (field) => field.prompt_after_select !== false,
  );
  const showFields = checked && promptFields.length > 0;

  return (
    <li
      className={cn(
        "rounded-md transition-colors duration-200",
        showFields && "sm:col-span-2",
        checked ? "bg-brand-tint/55" : "hover:bg-slate-50",
      )}
    >
      <button
        type="button"
        role={exclusive ? "radio" : "checkbox"}
        aria-checked={checked}
        onClick={onToggle}
        className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[13.5px] text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
      >
        <OptionIndicator exclusive={exclusive} checked={checked} />
        <span className={cn("min-w-0 flex-1", checked && "font-medium")}>
          {item.name}
          {item.isMandatory ? (
            <span className="ml-0.5">
              <RequiredFieldMarker />
            </span>
          ) : null}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {showFields ? (
          <motion.div
            key="fields"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="grid gap-x-4 gap-y-2.5 pb-2.5 pl-9 pr-2.5 sm:grid-cols-2">
              {promptFields.map((field) => (
                <PreviewFieldInput
                  key={field.code}
                  field={field}
                  value={values[field.code] ?? ""}
                  onChange={(value) => onValue(field.code, value)}
                  hideLabel={promptFields.length === 1 && field.options.length > 0}
                  label={`${item.name} ${field.label}`}
                />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

function inputTypeFor(field: OhResponseField) {
  switch (field.response_type) {
    case "number":
    case "decimal":
      return "number";
    case "date":
      return "date";
    case "datetime":
      return "datetime-local";
    case "time":
      return "time";
    default:
      return "text";
  }
}

function PreviewFieldInput({
  field,
  value,
  onChange,
  hideLabel = false,
  label = field.label,
}: {
  field: OhResponseField;
  value: string;
  onChange: (value: string) => void;
  hideLabel?: boolean;
  label?: string;
}) {
  if (field.options.length > 0) {
    return (
      <div className={cn("space-y-1", field.options.length > 3 && "sm:col-span-2")}>
        {hideLabel ? null : (
          <p className="text-[11.5px] font-medium text-brand-slate">{field.label}</p>
        )}
        <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1">
          {field.options.map((option) => {
            const selected = value === option.code;
            return (
              <button
                key={option.code}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(selected ? "" : option.code)}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 active:translate-y-px",
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

  return (
    <label className="block space-y-1">
      <span className="text-[11.5px] font-medium text-brand-slate">{field.label}</span>
      <input
        type={inputTypeFor(field)}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.response_type.replaceAll("_", " ")}
        className="h-8 w-full rounded-md border border-dash-border bg-white px-2.5 text-[13px] text-brand-navy placeholder:text-slate-400 focus:border-brand-primary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
      />
    </label>
  );
}

function OptionIndicator({ exclusive, checked }: { exclusive: boolean; checked: boolean }) {
  const reduceMotion = useReducedMotion();
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-4 shrink-0 items-center justify-center border-[1.5px] transition-colors duration-150",
        exclusive ? "rounded-full" : "rounded-[4px]",
        checked
          ? exclusive
            ? "border-brand-primary bg-white"
            : "border-brand-primary bg-brand-primary"
          : "border-slate-300 bg-white",
      )}
    >
      <AnimatePresence initial={false}>
        {checked ? (
          <motion.span
            key="mark"
            initial={reduceMotion ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            exit={reduceMotion ? undefined : { scale: 0 }}
            transition={SPRING}
            className="flex items-center justify-center"
          >
            {exclusive ? (
              <span className="size-[7px] rounded-full bg-brand-primary" />
            ) : (
              <Check className="size-2.5 text-white" strokeWidth={3.5} />
            )}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}

function SignOff({ kind }: { kind: TemplateKind }) {
  const lines =
    kind === "certificate"
      ? ["Examining practitioner", "Signature", "Date issued"]
      : ["Examiner", "Signature", "Date"];

  return (
    <div className="mt-2 grid grid-cols-1 gap-x-8 gap-y-5 border-t-[3px] border-double border-brand-navy/80 pt-6 sm:grid-cols-3">
      {lines.map((line) => (
        <div key={line}>
          <span className="block h-7 border-b border-slate-300" aria-hidden />
          <p className="mt-1.5 text-[11px] font-medium text-dash-muted">{line}</p>
        </div>
      ))}
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <div aria-hidden>
      {[0, 1].map((row) => (
        <div
          key={row}
          className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 border-t border-dash-border py-5"
        >
          <span className="size-6 animate-pulse rounded-full bg-slate-100" />
          <div className="space-y-2.5 pt-0.5">
            <div className="h-3.5 w-1/3 animate-pulse rounded bg-slate-100" />
            <div className="h-8 animate-pulse rounded-md bg-slate-50" />
          </div>
        </div>
      ))}
    </div>
  );
}
