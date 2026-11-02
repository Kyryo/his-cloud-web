"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Eye, RotateCcw } from "lucide-react";
import { useState } from "react";

import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import {
  useSectionItems,
  useTemplateBuilder,
} from "@/features/oh-template-builder/hooks/useTemplateBuilder";
import {
  previewProgress,
  togglePreviewPick,
  type PreviewAnswers,
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

type Outcomes = Readonly<Record<string, string>>;

/** The form as a clinician fills it in. Answers live in memory only. */
export function TemplatePreview() {
  const { kind, template, attachments, isLoading } = useTemplateBuilder();
  const [answers, setAnswers] = useState<PreviewAnswers>({});
  const [outcomes, setOutcomes] = useState<Outcomes>({});
  const progress = previewProgress(attachments, answers);
  const hasAnswers = Object.values(answers).some((picked) => picked.length > 0);
  const meta = TEMPLATE_KIND_META[kind];
  const Icon = TEMPLATE_KIND_ICONS[kind];

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-dash-canvas bg-[radial-gradient(rgb(31_42_36/0.07)_1px,transparent_1px)] [background-size:18px_18px]">
      <ProgressRail
        answered={progress.answered}
        total={progress.total}
        canClear={hasAnswers}
        onClear={() => {
          setAnswers({});
          setOutcomes({});
        }}
      />

      <div className="px-3 pb-24 pt-8 sm:px-6 sm:pt-12">
        <article className="mx-auto w-full max-w-[50rem] overflow-hidden rounded-[4px] bg-white shadow-[0_0_0_1px_rgb(31_42_36/0.06),0_1px_2px_rgb(31_42_36/0.05),0_32px_64px_-32px_rgb(31_42_36/0.3)]">
          <div className="h-1.5 bg-brand-primary" aria-hidden />

          <div className="px-6 pb-12 pt-9 sm:px-14 sm:pt-12">
            <header>
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full border border-brand-primary/25 text-brand-primary">
                    <Icon className="size-5" strokeWidth={1.6} aria-hidden />
                  </span>
                  <div className="text-[12px] leading-4">
                    <p className="font-semibold text-brand-navy">Occupational health</p>
                    <p className="text-dash-muted">
                      {kind === "certificate" ? "Certificate of fitness" : meta.label}
                    </p>
                  </div>
                </div>
                <p className="pt-0.5 text-right font-mono text-[11px] leading-4 text-dash-muted">
                  {template?.code}
                </p>
              </div>

              <h1 className="mt-8 text-[28px] font-semibold leading-tight tracking-tight text-brand-navy sm:text-[32px]">
                {template?.name ?? "\u00a0"}
              </h1>
              <div className="mt-6 border-b-[3px] border-double border-brand-navy/80" aria-hidden />

              <div className="mt-7 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
                {RECORD_FIELDS.map((field) => (
                  <div key={field}>
                    <p className="text-[11px] font-medium text-dash-muted">{field}</p>
                    <span className="mt-4 block border-b border-slate-300" aria-hidden />
                  </div>
                ))}
              </div>
            </header>

            <div className="mt-10">
              {isLoading ? (
                <PreviewSkeleton />
              ) : attachments.length === 0 ? (
                <p className="border-t border-dash-border py-12 text-center text-sm text-dash-muted">
                  This template has no sections yet. Switch to Build to add some.
                </p>
              ) : (
                <ol>
                  {attachments.map((attachment, index) => (
                    <PreviewSection
                      key={attachment.uuid}
                      attachment={attachment}
                      index={index}
                      picked={answers[attachment.uuid] ?? []}
                      outcomes={outcomes}
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
                      onOutcome={(itemUuid, code) =>
                        setOutcomes((current) => ({ ...current, [itemUuid]: code }))
                      }
                    />
                  ))}
                </ol>
              )}
            </div>

            <SignOff kind={kind} />
          </div>

          <footer className="flex items-center justify-between gap-4 border-t border-dash-border bg-slate-50/70 px-6 py-3 text-[11px] text-dash-muted sm:px-14">
            <span>Preview only. Not a valid record.</span>
            <span className="font-mono">{template?.code}</span>
          </footer>
        </article>
      </div>
    </div>
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
    <div className="sticky top-0 z-10 border-b border-dash-border bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-[50rem] items-center gap-4 px-4 sm:px-2">
        <p className="flex min-w-0 items-center gap-2 text-[13px] text-brand-slate">
          <Eye className="size-4 shrink-0 text-brand-primary" aria-hidden />
          <span className="truncate">Filling in as a clinician. Nothing is saved.</span>
        </p>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          {total > 0 ? (
            <div className="flex items-center gap-2.5" aria-live="polite">
              <span className="relative hidden h-1.5 w-28 overflow-hidden rounded-full bg-slate-200 sm:block">
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
                <span className="font-semibold text-brand-navy">{answered}</span> of {total}{" "}
                required
              </span>
            </div>
          ) : null}
          <button
            type="button"
            onClick={onClear}
            disabled={!canClear}
            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-brand-primary transition-colors hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 disabled:pointer-events-none disabled:text-slate-300"
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
  picked: readonly string[];
  outcomes: Outcomes;
  onToggle: (itemUuid: string) => void;
  onOutcome: (itemUuid: string, code: string) => void;
};

function PreviewSection({
  attachment,
  index,
  picked,
  outcomes,
  onToggle,
  onOutcome,
}: PreviewSectionProps) {
  const reduceMotion = useReducedMotion();
  const itemsQuery = useSectionItems(attachment.sectionUuid);
  const section = attachment.section;
  const isDirect = section?.contentMode === "direct";
  const mode = section?.selectionMode ?? "inclusive";
  const items = itemsQuery.data?.items ?? [];
  const isAnswered = isDirect
    ? (section?.defaultResponseFields.length ?? 0) > 0
    : picked.length > 0;
  const headingId = `preview-${attachment.uuid}`;
  const modeLabel = isDirect
    ? "Enter values"
    : mode === "exclusive"
      ? "Choose one"
      : "Choose all that apply";

  return (
    <li className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 border-t border-dash-border py-7 sm:grid-cols-[2.75rem_minmax(0,1fr)]">
      <span
        aria-hidden
        className={cn(
          "relative flex size-8 items-center justify-center overflow-hidden rounded-full border text-xs font-semibold tabular-nums transition-colors duration-200",
          isAnswered
            ? "border-brand-primary bg-brand-primary text-white"
            : "border-dash-border text-dash-muted",
        )}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {isAnswered ? (
            <motion.span
              key="done"
              initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reduceMotion ? undefined : { scale: 0.4, opacity: 0 }}
              transition={SPRING}
            >
              <Check className="size-4" strokeWidth={2.5} />
            </motion.span>
          ) : (
            <motion.span
              key="number"
              initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reduceMotion ? undefined : { scale: 0.4, opacity: 0 }}
              transition={SPRING}
            >
              {index + 1}
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pt-1">
          <h2 id={headingId} className="text-base font-semibold tracking-tight text-brand-navy">
            {section?.name ?? "Untitled section"}
            {section?.isMandatory ? (
              <span className="ml-1">
                <RequiredFieldMarker />
              </span>
            ) : null}
          </h2>
          <span className="text-xs text-dash-muted">{modeLabel}</span>
        </div>

        {isDirect ? (
          <PreviewFieldsList
            fields={section?.defaultResponseFields ?? []}
            emptyMessage="No fields configured on this section yet."
          />
        ) : itemsQuery.isPending ? (
          <div className="mt-4 space-y-2" aria-hidden>
            <div className="h-10 animate-pulse rounded-lg bg-slate-50" />
            <div className="h-10 animate-pulse rounded-lg bg-slate-50" />
          </div>
        ) : items.length === 0 ? (
          <p className="mt-3 text-sm text-dash-muted">No items in this section yet.</p>
        ) : (
          <ul
            role={mode === "exclusive" ? "radiogroup" : "group"}
            aria-labelledby={headingId}
            className="-mx-3 mt-3 space-y-0.5"
          >
            {items.map((item) => (
              <PreviewOption
                key={item.uuid}
                item={item}
                exclusive={mode === "exclusive"}
                checked={picked.includes(item.uuid)}
                outcome={outcomes[item.uuid] ?? null}
                onToggle={() => onToggle(item.uuid)}
                onOutcome={(code) => onOutcome(item.uuid, code)}
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
  outcome: string | null;
  onToggle: () => void;
  onOutcome: (code: string) => void;
};

function PreviewOption({
  item,
  exclusive,
  checked,
  outcome,
  onToggle,
  onOutcome,
}: PreviewOptionProps) {
  const reduceMotion = useReducedMotion();
  const promptFields = item.effectiveResponseFields.filter(
    (field) => field.prompt_after_select !== false,
  );
  const showFields = checked && promptFields.length > 0;
  const optionFields = promptFields.filter((field) => field.options.length > 0);

  return (
    <li
      className={cn(
        "rounded-xl transition-colors duration-200",
        checked ? "bg-brand-tint/55" : "hover:bg-slate-50",
      )}
    >
      <button
        type="button"
        role={exclusive ? "radio" : "checkbox"}
        aria-checked={checked}
        onClick={onToggle}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
      >
        <OptionIndicator exclusive={exclusive} checked={checked} />
        <span className={cn("min-w-0 flex-1", checked ? "font-medium text-brand-navy" : "text-brand-navy")}>
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
            <div className="space-y-3 pb-3 pl-11 pr-3">
              {promptFields.map((field) =>
                field.options.length > 0 ? (
                  <div key={field.code} className="space-y-1.5">
                    {promptFields.length > 1 || optionFields.length > 1 ? (
                      <p className="text-xs font-medium text-brand-slate">{field.label}</p>
                    ) : null}
                    <div
                      role="radiogroup"
                      aria-label={`${item.name} ${field.label}`}
                      className="flex flex-wrap gap-1.5"
                    >
                      {field.options.map((option) => {
                        const selected = outcome === option.code;
                        return (
                          <button
                            key={option.code}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => onOutcome(option.code)}
                            className={cn(
                              "rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 active:translate-y-px",
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
                ) : (
                  <PreviewFieldInput key={field.code} field={field} />
                ),
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

function PreviewFieldsList({
  fields,
  emptyMessage,
}: {
  fields: OhResponseField[];
  emptyMessage: string;
}) {
  if (fields.length === 0) {
    return <p className="mt-3 text-sm text-dash-muted">{emptyMessage}</p>;
  }
  return (
    <div className="mt-4 space-y-3">
      {fields.map((field) => (
        <PreviewFieldInput key={field.code} field={field} />
      ))}
    </div>
  );
}

function PreviewFieldInput({ field }: { field: OhResponseField }) {
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

  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-brand-slate">{field.label}</span>
      {field.options.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {field.options.map((option) => (
            <span
              key={option.code}
              className="rounded-full border border-dash-border px-3 py-1 text-xs text-brand-slate"
            >
              {option.label}
            </span>
          ))}
        </div>
      ) : (
        <input
          type={inputType}
          disabled
          placeholder={field.response_type.replaceAll("_", " ")}
          className="h-9 w-full rounded-lg border border-dash-border bg-slate-50 px-3 text-sm text-dash-muted"
        />
      )}
    </label>
  );
}

function OptionIndicator({ exclusive, checked }: { exclusive: boolean; checked: boolean }) {
  const reduceMotion = useReducedMotion();
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-[18px] shrink-0 items-center justify-center border-[1.5px] transition-colors duration-150",
        exclusive ? "rounded-full" : "rounded-[5px]",
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
              <span className="size-2 rounded-full bg-brand-primary" />
            ) : (
              <Check className="size-3 text-white" strokeWidth={3} />
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
    <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-7 border-t-[3px] border-double border-brand-navy/80 pt-10 sm:grid-cols-3">
      {lines.map((line) => (
        <div key={line}>
          <span className="block h-9 border-b border-slate-300" aria-hidden />
          <p className="mt-2 text-[11px] font-medium text-dash-muted">{line}</p>
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
          className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3 border-t border-dash-border py-7"
        >
          <span className="size-8 animate-pulse rounded-full bg-slate-100" />
          <div className="space-y-3 pt-1">
            <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
            <div className="h-10 animate-pulse rounded-lg bg-slate-50" />
          </div>
        </div>
      ))}
    </div>
  );
}
