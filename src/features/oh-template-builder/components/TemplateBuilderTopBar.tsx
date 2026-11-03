"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

import { useTemplateBuilder } from "@/features/oh-template-builder/hooks/useTemplateBuilder";
import { PublishTemplateButton } from "@/features/settings/components/modules/occupational-health/template-library/PublishTemplateButton";
import {
  TEMPLATE_KIND_META,
  templateGalleryHref,
} from "@/features/oh-template-builder/lib/templateKinds";
import { cn } from "@/lib/utils";

export type BuilderMode = "edit" | "preview";

type TemplateBuilderTopBarProps = {
  view: BuilderMode;
};

export function TemplateBuilderTopBar({ view }: TemplateBuilderTopBarProps) {
  const { kind, template, isBusy } = useTemplateBuilder();
  const meta = TEMPLATE_KIND_META[kind];
  const galleryHref = templateGalleryHref(kind);

  return (
    <header className="grid h-14 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center border-b border-dash-border bg-white px-4 sm:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href={galleryHref}
          className="shrink-0 text-[13px] text-dash-muted transition-colors hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
        >
          {meta.pluralLabel}
        </Link>
        <span aria-hidden className="text-dash-border">
          /
        </span>
        {template ? (
          <TemplateNameField
            key={`${template.uuid}:${template.name}`}
            initialName={template.name}
          />
        ) : (
          <span className="h-4 w-36 animate-pulse rounded bg-slate-100" />
        )}
        {template ? (
          <span className="hidden shrink-0 font-mono text-[11px] text-dash-muted md:inline">
            {template.code}
          </span>
        ) : null}
      </div>

      <ViewTabs view={view} />

      <div className="flex min-w-0 items-center justify-end gap-3">
        <SaveStatus isBusy={isBusy} />
        {template ? (
          <VersionLabel
            versionNumber={template.publishedVersionNumber}
            status={template.publishedVersionStatus}
          />
        ) : null}
        <PublishTemplateButton disabled={!template || isBusy} />
      </div>
    </header>
  );
}

function VersionLabel({
  versionNumber,
  status,
}: {
  versionNumber: number | null | undefined;
  status: string | null | undefined;
}) {
  const label =
    versionNumber == null
      ? "Draft"
      : `v${versionNumber} ${(status || "published").replaceAll("_", " ")}`;

  return <span className="hidden text-[12px] capitalize text-dash-muted sm:inline">{label}</span>;
}

function SaveStatus({ isBusy }: { isBusy: boolean }) {
  return (
    <span
      aria-live="polite"
      className={cn(
        "hidden items-center gap-1.5 text-[12px] md:inline-flex",
        isBusy ? "text-amber-700" : "text-dash-muted",
      )}
    >
      {isBusy ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}
      {isBusy ? "Saving" : "Saved"}
    </span>
  );
}

const VIEW_TABS = [
  { id: "edit", label: "Build", query: "" },
  { id: "preview", label: "Preview", query: "?view=preview" },
] as const;

function ViewTabs({ view }: TemplateBuilderTopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { flushPendingSaves, isBusy } = useTemplateBuilder();
  const [isFlushing, startFlush] = useTransition();

  function goTo(tabId: BuilderMode, href: string) {
    if (tabId === view) {
      return;
    }
    startFlush(() => {
      void (async () => {
        await flushPendingSaves();
        router.replace(href, { scroll: false });
      })();
    });
  }

  return (
    <nav
      aria-label="Builder view"
      className="mx-3 flex h-8 items-center rounded-full bg-slate-100 p-0.5"
    >
      {VIEW_TABS.map((tab) => {
        const active = view === tab.id;
        const href = `${pathname}${tab.query}`;
        return (
          <button
            key={tab.id}
            type="button"
            disabled={isFlushing || isBusy}
            aria-current={active ? "page" : undefined}
            onClick={() => goTo(tab.id, href)}
            className={cn(
              "relative flex h-7 items-center rounded-full px-3.5 text-[13px] transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30",
              "disabled:pointer-events-none disabled:opacity-60",
              active ? "font-medium text-brand-navy" : "text-dash-muted hover:text-brand-navy",
            )}
          >
            {active ? (
              <motion.span
                layoutId="builder-view"
                transition={
                  reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 38 }
                }
                className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgb(31_42_36/0.12)]"
              />
            ) : null}
            <span className="relative">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function TemplateNameField({ initialName }: { initialName: string }) {
  const { renameTemplate, isPending } = useTemplateBuilder();
  const [name, setName] = useState(initialName);

  async function commit() {
    const next = name.trim();
    if (!next) {
      setName(initialName);
      return;
    }
    if (next === initialName) {
      return;
    }
    const saved = await renameTemplate(next);
    if (!saved) {
      setName(initialName);
    }
  }

  return (
    <input
      value={name}
      aria-label="Template name"
      disabled={isPending("template:rename")}
      onChange={(event) => setName(event.target.value)}
      onBlur={() => void commit()}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
        if (event.key === "Escape") {
          setName(initialName);
          event.currentTarget.blur();
        }
      }}
      size={Math.max(name.length, 8)}
      className="h-8 min-w-0 max-w-[14rem] border-b border-transparent bg-transparent text-[15px] font-semibold text-brand-navy outline-none transition-colors placeholder:text-dash-muted focus:border-brand-primary/40 sm:max-w-[22rem]"
    />
  );
}
