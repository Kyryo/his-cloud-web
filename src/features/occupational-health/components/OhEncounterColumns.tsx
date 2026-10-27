import type { LucideIcon } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";

import {
  OpdConsultColumnHeader,
  OpdConsultCountBadge,
} from "@/features/clinical-opd/components/detail/OpdConsultColumnHeader";
import { cn } from "@/lib/utils";

/** On desktop the columns fill the remaining viewport and each scrolls on its own. */
const COLUMN_SCROLL_CLASS = "flex flex-col xl:min-h-0 xl:overflow-y-auto";

type OhEncounterColumnsProps = {
  form: ReactNode;
  records: ReactNode;
  aside: ReactNode;
  /** Remounts the form and records columns so each tab opens scrolled to the top. */
  sectionKey: string;
};

/** Record on the left, this encounter in the middle, previous visits on the right. */
export function OhEncounterColumns({
  form,
  records,
  aside,
  sectionKey,
}: OhEncounterColumnsProps) {
  return (
    <div
      className="grid flex-1 grid-cols-1 xl:min-h-0 xl:grid-cols-[22rem_minmax(0,1fr)_20rem] xl:grid-rows-[minmax(0,1fr)] 2xl:grid-cols-[25rem_minmax(0,1fr)_22rem]"
      data-testid="oh-encounter-columns"
    >
      <section
        key={`form-${sectionKey}`}
        className={cn(
          "border-b border-dash-border/70 bg-white xl:border-b-0 xl:border-r",
          COLUMN_SCROLL_CLASS,
        )}
        aria-label="Record"
        data-testid="oh-encounter-form-column"
      >
        {form}
      </section>
      <section
        key={`records-${sectionKey}`}
        className={cn("min-h-64 min-w-0 bg-white", COLUMN_SCROLL_CLASS)}
        aria-label="This encounter"
        data-testid="oh-encounter-records-column"
      >
        {records}
      </section>
      <div
        className="flex min-h-0 min-w-0 flex-col xl:min-h-0"
        data-testid="oh-encounter-history-column"
      >
        {aside}
      </div>
    </div>
  );
}

type OhColumnPanelProps = {
  eyebrow: string;
  title: string;
  count?: number;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function OhColumnPanel({
  eyebrow,
  title,
  count,
  action,
  className,
  children,
}: OhColumnPanelProps) {
  return (
    <div className="flex flex-1 flex-col">
      <OpdConsultColumnHeader
        eyebrow={eyebrow}
        title={title}
        meta={count === undefined ? null : <OpdConsultCountBadge count={count} />}
        action={action}
        className={className}
      />
      {children}
    </div>
  );
}

type OhRecordsEmptyProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  "data-testid"?: string;
};

/** Fills the rest of the column so the prompt sits in the middle of the viewport. */
export function OhRecordsEmpty({
  icon: Icon,
  title,
  description,
  "data-testid": dataTestId,
}: OhRecordsEmptyProps) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center"
      data-testid={dataTestId}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-white text-brand-primary ring-1 ring-dash-border/80">
        <Icon className="size-4.5" aria-hidden="true" />
      </div>
      <p className="mt-3 text-sm font-semibold text-brand-navy">{title}</p>
      <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-dash-muted">
        {description}
      </p>
    </div>
  );
}

/** Lets clinicians save from any field, including multi-line notes, with Ctrl/⌘ + Enter. */
export function submitOnModEnter(event: KeyboardEvent<HTMLFormElement>) {
  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    event.currentTarget.requestSubmit();
  }
}

type OhFormFooterProps = {
  children: ReactNode;
};

/** Keeps the save action reachable at the bottom of the column on long forms. */
export function OhFormFooter({ children }: OhFormFooterProps) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 -mb-4 mt-2 border-t border-dash-border/60 bg-white/95 px-4 py-3 backdrop-blur-sm sm:-mx-5 sm:px-5">
      {children}
      <p className="mt-1.5 text-center text-[11px] text-dash-muted">
        <kbd className="font-sans">Ctrl</kbd> / <kbd className="font-sans">⌘</kbd> +{" "}
        <kbd className="font-sans">Enter</kbd> to save
      </p>
    </div>
  );
}

type OhPanelSectionProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  "data-testid"?: string;
};

/** Flat sub-section separated by a hairline rule instead of a card border. */
export function OhPanelSection({
  title,
  description,
  action,
  children,
  "data-testid": dataTestId,
}: OhPanelSectionProps) {
  return (
    <section
      className="border-b border-dash-border/60 px-4 py-4 last:border-b-0 sm:px-5"
      data-testid={dataTestId}
    >
      {title ? (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[13px] font-semibold text-brand-navy">{title}</h3>
            {description ? (
              <p className="mt-0.5 text-xs leading-relaxed text-dash-muted">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

type OhRecordListProps = {
  children: ReactNode;
  "data-testid"?: string;
};

export function OhRecordList({ children, "data-testid": dataTestId }: OhRecordListProps) {
  return (
    <ul className="divide-y divide-dash-border/60" data-testid={dataTestId}>
      {children}
    </ul>
  );
}

type OhRecordItemProps = {
  title: ReactNode;
  badges?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  "data-testid"?: string;
};

export function OhRecordItem({
  title,
  badges,
  meta,
  action,
  children,
  "data-testid": dataTestId,
}: OhRecordItemProps) {
  return (
    <li className="py-3 first:pt-0 last:pb-0" data-testid={dataTestId}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium leading-tight text-brand-navy">{title}</p>
            {badges}
          </div>
          {meta ? <p className="text-xs text-brand-muted">{meta}</p> : null}
          {children ? (
            <div className="text-[13px] leading-relaxed text-brand-slate">{children}</div>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </li>
  );
}

type OhColumnMessageProps = {
  children: ReactNode;
  tone?: "muted" | "error";
  "data-testid"?: string;
};

export function OhColumnMessage({
  children,
  tone = "muted",
  "data-testid": dataTestId,
}: OhColumnMessageProps) {
  return (
    <p
      className={cn(
        "text-[13px] leading-relaxed",
        tone === "error" ? "text-red-700" : "text-dash-muted",
      )}
      data-testid={dataTestId}
    >
      {children}
    </p>
  );
}

type OhFactListProps = {
  facts: Array<{ label: string; value: ReactNode }>;
};

export function OhFactList({ facts }: OhFactListProps) {
  return (
    <dl className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[13px]">
      {facts.map((fact) => (
        <div key={fact.label} className="contents">
          <dt className="text-dash-muted">{fact.label}</dt>
          <dd className="min-w-0 truncate text-brand-navy">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
