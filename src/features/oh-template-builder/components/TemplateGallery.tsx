"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useDeferredValue, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { CreateTemplateDialog } from "@/features/oh-template-builder/components/CreateTemplateDialog";
import { formatEditedAgo } from "@/features/oh-template-builder/lib/formatEdited";
import { getTemplateAdapter } from "@/features/oh-template-builder/lib/templateAdapters";
import {
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
const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 md:grid-cols-[minmax(0,1.4fr)_9rem_9rem]";

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
    <section className="pt-5" aria-labelledby={`oh-${kind}-templates-title`}>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2
            id={`oh-${kind}-templates-title`}
            className="text-[15px] font-semibold text-brand-navy"
          >
            {meta.pluralLabel}
            {templatesQuery.isSuccess ? (
              <span className="ml-2 text-[13px] font-normal tabular-nums text-dash-muted">
                {templates.length}
              </span>
            ) : null}
          </h2>
          <p className="mt-0.5 text-[13px] text-dash-muted">{meta.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {templates.length > SEARCH_THRESHOLD ? (
            <div className="relative w-full sm:w-52">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dash-muted"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                aria-label={`Search ${meta.pluralLabel.toLowerCase()}`}
                className="h-8 pl-9 text-[13px]"
              />
            </div>
          ) : null}
          <PrimaryButton
            type="button"
            size="sm"
            onClick={() => setIsCreating(true)}
            className="h-8 shrink-0 gap-1.5 px-3 text-[13px]"
          >
            <Plus className="size-3.5" aria-hidden />
            New template
          </PrimaryButton>
        </div>
      </header>

      <div className="mt-4">
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
                "hidden border-b border-dash-border px-2 pb-2 text-[12px] font-medium text-dash-muted md:grid",
              )}
            >
              <span>Template</span>
              <span>Sections</span>
              <span>Last edited</span>
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
          </>
        )}
      </div>

      {isCreating ? (
        <CreateTemplateDialog kind={kind} open onOpenChange={setIsCreating} />
      ) : null}
    </section>
  );
}

function sectionLabel(count: number | null) {
  if (count == null) {
    return "Open to view";
  }
  if (count === 0) {
    return "Empty";
  }
  return count === 1 ? "1 section" : `${count} sections`;
}

function TemplateRow({ kind, template }: { kind: TemplateKind; template: BuilderTemplate }) {
  const edited = formatEditedAgo(template.updatedAt);

  return (
    <Link
      href={ROUTES.ohTemplateBuilder(kind, template.uuid)}
      className={cn(
        ROW_GRID,
        "px-2 py-3 hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none",
      )}
    >
      <span className="min-w-0">
        <span className="block truncate text-[13.5px] font-medium text-brand-navy">
          {template.name}
        </span>
        <span className="mt-0.5 block truncate text-[12px] text-dash-muted">{template.code}</span>
      </span>

      <span className="hidden text-[13px] text-brand-slate md:block">
        {sectionLabel(template.sectionCount)}
      </span>

      <span className="hidden text-[13px] text-brand-slate md:block">
        {edited ?? <span className="text-dash-muted">Unknown</span>}
      </span>
    </Link>
  );
}

function EmptyTemplates({ kind, onCreate }: { kind: TemplateKind; onCreate: () => void }) {
  const meta = TEMPLATE_KIND_META[kind];
  return (
    <div className="border-b border-dash-border py-14 text-center">
      <p className="text-[15px] font-semibold text-brand-navy">
        No {meta.pluralLabel.toLowerCase()} yet
      </p>
      <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-dash-muted">
        Create one, then build it from sections in the builder.
      </p>
      <PrimaryButton
        type="button"
        size="sm"
        onClick={onCreate}
        className="mt-4 h-8 gap-1.5 px-3 text-[13px]"
      >
        <Plus className="size-3.5" aria-hidden />
        New template
      </PrimaryButton>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="divide-y divide-dash-border border-t border-dash-border" aria-hidden>
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className={cn(ROW_GRID, "px-2 py-3")}>
          <span className="space-y-1.5">
            <span className="block h-3.5 w-48 animate-pulse rounded bg-slate-100" />
            <span className="block h-3 w-20 animate-pulse rounded bg-slate-100" />
          </span>
          <span className="hidden h-3.5 w-20 animate-pulse rounded bg-slate-100 md:block" />
          <span className="hidden h-3.5 w-20 animate-pulse rounded bg-slate-100 md:block" />
        </div>
      ))}
    </div>
  );
}
