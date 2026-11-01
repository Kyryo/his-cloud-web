"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowUpRight, Plus, Search } from "lucide-react";
import { useDeferredValue, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { CreateTemplateDialog } from "@/features/oh-template-builder/components/CreateTemplateDialog";
import { formatEditedAgo } from "@/features/oh-template-builder/lib/formatEdited";
import { getTemplateAdapter } from "@/features/oh-template-builder/lib/templateAdapters";
import {
  TEMPLATE_KIND_ICONS,
  TEMPLATE_KIND_META,
  templateQueryKeys,
} from "@/features/oh-template-builder/lib/templateKinds";
import type {
  BuilderTemplate,
  TemplateKind,
} from "@/features/oh-template-builder/template-builder.types";
import { getErrorMessage } from "@/lib/fetch-error";
import { cn } from "@/lib/utils";

/** Show the search box once the list is too long to scan at a glance. */
const SEARCH_THRESHOLD = 6;
/** Ticks drawn in a row's structure strip before it switches to "+n". */
const MAX_STRUCTURE_TICKS = 14;
/** Fixed rhythm so the strip reads like a document outline rather than a bar chart. */
const TICK_HEIGHTS = ["h-4", "h-2.5", "h-3", "h-2", "h-3.5", "h-2.5"] as const;
const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 md:grid-cols-[minmax(0,1fr)_12rem_9rem_1.25rem]";

export function TemplateGallery({ kind }: { kind: TemplateKind }) {
  const meta = TEMPLATE_KIND_META[kind];
  const [isCreating, setIsCreating] = useState(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const templatesQuery = useQuery({
    queryKey: templateQueryKeys.list(kind),
    queryFn: () => getTemplateAdapter(kind).listTemplates(),
  });

  const templates = (templatesQuery.data ?? []).filter((row) => row.active);
  const visible = deferredQuery
    ? templates.filter(
        (row) =>
          row.name.toLowerCase().includes(deferredQuery) ||
          row.code.toLowerCase().includes(deferredQuery),
      )
    : templates;

  return (
    <section className="pt-6" aria-labelledby={`oh-${kind}-templates-title`}>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-[56ch]">
          <div className="flex items-baseline gap-3">
            <h2
              id={`oh-${kind}-templates-title`}
              className="text-xl font-semibold tracking-tight text-brand-navy"
            >
              {meta.pluralLabel}
            </h2>
            {templatesQuery.isSuccess ? (
              <span className="text-sm tabular-nums text-dash-muted">{templates.length}</span>
            ) : null}
          </div>
          <p className="mt-1.5 text-sm leading-6 text-dash-muted">{meta.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {templates.length > SEARCH_THRESHOLD ? (
            <div className="relative w-full sm:w-56">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dash-muted"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                aria-label={`Search ${meta.pluralLabel.toLowerCase()}`}
                className="pl-9"
              />
            </div>
          ) : null}
          <PrimaryButton
            type="button"
            onClick={() => setIsCreating(true)}
            className="shrink-0 gap-1.5 active:translate-y-px"
          >
            <Plus className="size-4" aria-hidden />
            New template
          </PrimaryButton>
        </div>
      </header>

      <div className="mt-8">
        {templatesQuery.isPending ? (
          <ListSkeleton />
        ) : templatesQuery.isError ? (
          <div className="border-l-2 border-red-400 py-2 pl-4">
            <p className="text-sm font-medium text-red-800">Templates could not be loaded</p>
            <p className="mt-1 text-sm text-red-700">{getErrorMessage(templatesQuery.error)}</p>
            <SecondaryButton
              type="button"
              size="sm"
              className="mt-3"
              onClick={() => void templatesQuery.refetch()}
            >
              Try again
            </SecondaryButton>
          </div>
        ) : templates.length === 0 ? (
          <EmptyTemplates kind={kind} onCreate={() => setIsCreating(true)} />
        ) : (
          <>
            <div
              aria-hidden
              className={cn(
                ROW_GRID,
                "hidden border-b border-dash-border pb-2.5 pl-3 pr-2 text-xs font-medium text-dash-muted md:grid",
              )}
            >
              <span>Template</span>
              <span>Structure</span>
              <span>Last edited</span>
              <span />
            </div>
            {visible.length === 0 ? (
              <p className="py-10 text-center text-sm text-dash-muted">
                No templates match &ldquo;{query.trim()}&rdquo;.
              </p>
            ) : (
              <ul className="divide-y divide-dash-border">
                {visible.map((template) => (
                  <li key={template.uuid}>
                    <TemplateRow kind={kind} template={template} />
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="group mt-1 flex w-full items-center gap-3 border-t border-dashed border-dash-border py-3.5 pl-3 text-sm text-dash-muted transition-colors hover:text-brand-primary focus-visible:text-brand-primary focus-visible:outline-none"
            >
              <span className="flex size-9 items-center justify-center rounded-lg border border-dashed border-slate-300 transition-colors group-hover:border-brand-primary/50 group-hover:bg-brand-tint">
                <Plus className="size-4" aria-hidden />
              </span>
              New {meta.label.toLowerCase()}
            </button>
          </>
        )}
      </div>

      {isCreating ? (
        <CreateTemplateDialog kind={kind} open onOpenChange={setIsCreating} />
      ) : null}
    </section>
  );
}

function TemplateRow({ kind, template }: { kind: TemplateKind; template: BuilderTemplate }) {
  const Icon = TEMPLATE_KIND_ICONS[kind];
  const edited = formatEditedAgo(template.updatedAt);

  return (
    <Link
      href={ROUTES.ohTemplateBuilder(kind, template.uuid)}
      className={cn(
        ROW_GRID,
        "group relative py-4 pl-3 pr-2 transition-colors duration-200",
        "hover:bg-brand-tint/35 focus-visible:bg-brand-tint/35 focus-visible:outline-none",
        "before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:scale-y-0 before:rounded-full before:bg-brand-primary before:transition-transform before:duration-200",
        "hover:before:scale-y-100 focus-visible:before:scale-y-100 motion-reduce:before:transition-none",
      )}
    >
      <span className="flex min-w-0 items-center gap-3.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand-primary transition-colors duration-200 group-hover:bg-brand-primary group-hover:text-white">
          <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-medium text-brand-navy">
            {template.name}
          </span>
          <span className="mt-0.5 block truncate font-mono text-xs text-dash-muted">
            {template.code}
          </span>
        </span>
      </span>

      <StructureStrip count={template.sectionCount} />

      <span className="hidden text-sm text-brand-slate md:block">
        {edited ?? <span className="text-slate-300">Unknown</span>}
      </span>

      <ArrowUpRight
        className="size-4 text-slate-300 transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-primary motion-reduce:transition-none"
        aria-hidden
      />
    </Link>
  );
}

/** One tick per section: a quick read of how substantial each template is. */
function StructureStrip({ count }: { count: number | null }) {
  if (count == null) {
    return <span className="hidden text-sm text-dash-muted md:block">Open to view</span>;
  }
  const ticks = Math.min(count, MAX_STRUCTURE_TICKS);
  const overflow = count - ticks;

  return (
    <span className="hidden items-center gap-3 md:flex">
      {count === 0 ? (
        <span className="h-4 w-10 rounded-[3px] border border-dashed border-slate-300" aria-hidden />
      ) : (
        <span className="flex h-4 items-end gap-[3px]" aria-hidden>
          {Array.from({ length: ticks }, (_, index) => (
            <span
              key={index}
              className={cn(
                "w-[3px] rounded-full bg-brand-primary/35 transition-colors duration-200 group-hover:bg-brand-primary",
                TICK_HEIGHTS[index % TICK_HEIGHTS.length],
              )}
            />
          ))}
          {overflow > 0 ? (
            <span className="ml-1 text-[11px] leading-none text-dash-muted">+{overflow}</span>
          ) : null}
        </span>
      )}
      <span className="text-sm tabular-nums text-brand-slate">
        {count === 0 ? "Empty" : `${count} section${count === 1 ? "" : "s"}`}
      </span>
    </span>
  );
}

function EmptyTemplates({ kind, onCreate }: { kind: TemplateKind; onCreate: () => void }) {
  const meta = TEMPLATE_KIND_META[kind];
  const Icon = TEMPLATE_KIND_ICONS[kind];
  return (
    <div className="grid items-center gap-8 border-y border-dash-border py-12 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-10 sm:px-4">
      <div aria-hidden className="relative mx-auto h-28 w-24 sm:mx-0">
        <span className="absolute inset-0 translate-x-2 translate-y-2 rounded-md border border-dashed border-brand-primary/30" />
        <span className="absolute inset-0 flex flex-col gap-1.5 rounded-md border border-dash-border bg-white p-3">
          <Icon className="mb-1 size-5 text-brand-primary" strokeWidth={1.75} />
          <span className="h-1.5 w-3/4 rounded-full bg-brand-primary/25" />
          <span className="h-1 w-full rounded-full bg-slate-200" />
          <span className="h-1 w-5/6 rounded-full bg-slate-200" />
          <span className="h-1 w-2/3 rounded-full bg-slate-200" />
        </span>
      </div>
      <div className="text-center sm:text-left">
        <p className="text-base font-semibold text-brand-navy">
          No {meta.pluralLabel.toLowerCase()} yet
        </p>
        <p className="mt-1 max-w-[46ch] text-sm leading-6 text-dash-muted">
          Create one, then build it from reusable sections in the full-screen builder.
        </p>
        <PrimaryButton type="button" onClick={onCreate} className="mt-4 gap-1.5">
          <Plus className="size-4" aria-hidden />
          New template
        </PrimaryButton>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="divide-y divide-dash-border border-t border-dash-border" aria-hidden>
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className={cn(ROW_GRID, "py-4 pl-3 pr-2")}>
          <span className="flex items-center gap-3.5">
            <span className="size-9 animate-pulse rounded-lg bg-slate-100" />
            <span className="space-y-1.5">
              <span className="block h-3.5 w-48 animate-pulse rounded bg-slate-100" />
              <span className="block h-3 w-20 animate-pulse rounded bg-slate-100" />
            </span>
          </span>
          <span className="hidden h-3.5 w-32 animate-pulse rounded bg-slate-100 md:block" />
          <span className="hidden h-3.5 w-20 animate-pulse rounded bg-slate-100 md:block" />
          <span />
        </div>
      ))}
    </div>
  );
}
