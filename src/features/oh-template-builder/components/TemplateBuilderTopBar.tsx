"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Check, Eye, Loader2, PencilRuler } from "lucide-react";
import { useState } from "react";

import { useTemplateBuilder } from "@/features/oh-template-builder/hooks/useTemplateBuilder";
import { PublishTemplateButton } from "@/features/settings/components/modules/occupational-health/template-library/PublishTemplateButton";
import { VersionStatusChip } from "@/features/settings/components/modules/occupational-health/template-library/VersionStatusChip";
import {
  TEMPLATE_KIND_META,
  templateGalleryHref,
} from "@/features/oh-template-builder/lib/templateKinds";
import { cn } from "@/lib/utils";

export type BuilderMode = "edit" | "preview";

type TemplateBuilderTopBarProps = {
  mode: BuilderMode;
  onModeChange: (mode: BuilderMode) => void;
};

export function TemplateBuilderTopBar({ mode, onModeChange }: TemplateBuilderTopBarProps) {
  const { kind, template, isBusy } = useTemplateBuilder();
  const meta = TEMPLATE_KIND_META[kind];
  const galleryHref = templateGalleryHref(kind);

  return (
    <header className="relative flex h-12 shrink-0 items-center border-b border-dash-border bg-white px-2 sm:px-3">
      <div className="flex min-w-0 max-w-[calc(50%-7.25rem)] flex-1 items-center gap-1.5">
        <Link
          href={galleryHref}
          aria-label={`Back to ${meta.pluralLabel.toLowerCase()}`}
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-brand-slate transition-colors hover:bg-slate-100 hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        {template ? (
          <TemplateNameField
            key={`${template.uuid}:${template.name}`}
            initialName={template.name}
          />
        ) : (
          <span className="h-4 w-36 animate-pulse rounded bg-slate-100" />
        )}
        {template ? (
          <span className="hidden shrink-0 font-mono text-[11px] text-dash-muted lg:inline">
            {template.code}
          </span>
        ) : null}
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="pointer-events-auto">
          <ModeSwitch mode={mode} onModeChange={onModeChange} />
        </div>
      </div>

      <div className="ml-auto flex min-w-0 max-w-[calc(50%-7.25rem)] flex-1 items-center justify-end gap-1">
        {template ? (
          <VersionStatusChip
            versionNumber={template.publishedVersionNumber}
            status={template.publishedVersionStatus}
          />
        ) : null}
        <PublishTemplateButton disabled={!template || isBusy} />
        <SaveStatus isBusy={isBusy} />
        <Link
          href={galleryHref}
          className="flex h-8 items-center rounded-md bg-brand-primary px-3 text-[13px] font-medium text-white transition-colors hover:bg-brand-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 active:translate-y-px"
        >
          Done
        </Link>
      </div>
    </header>
  );
}

function SaveStatus({ isBusy }: { isBusy: boolean }) {
  return (
    <span
      aria-live="polite"
      className={cn(
        "hidden items-center gap-1.5 px-2 text-xs sm:inline-flex",
        isBusy ? "text-amber-700" : "text-dash-muted",
      )}
    >
      {isBusy ? (
        <>
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
          Saving
        </>
      ) : (
        <>
          <Check className="size-3.5 text-brand-primary" aria-hidden />
          Saved
        </>
      )}
    </span>
  );
}

const MODE_OPTIONS = [
  { id: "edit", label: "Build", icon: PencilRuler },
  { id: "preview", label: "Preview", icon: Eye },
] as const;

function ModeSwitch({ mode, onModeChange }: TemplateBuilderTopBarProps) {
  const reduceMotion = useReducedMotion();
  return (
    <div
      role="radiogroup"
      aria-label="Builder mode"
      className="flex items-center rounded-lg bg-slate-100 p-0.5"
    >
      {MODE_OPTIONS.map((option) => {
        const OptionIcon = option.icon;
        const selected = mode === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onModeChange(option.id)}
            className={cn(
              "relative flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[13px] transition-colors sm:px-3",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30",
              selected ? "font-medium text-brand-navy" : "text-dash-muted hover:text-brand-navy",
            )}
          >
            {selected ? (
              <motion.span
                layoutId="builder-mode"
                transition={
                  reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 38 }
                }
                className="absolute inset-0 rounded-md bg-white shadow-[0_1px_2px_rgb(31_42_36/0.1)]"
              />
            ) : null}
            <OptionIcon
              className={cn("relative size-3.5", selected && "text-brand-primary")}
              aria-hidden
            />
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
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
      className="h-8 min-w-0 max-w-[16rem] rounded-md border border-transparent bg-transparent px-1.5 text-sm font-semibold text-brand-navy transition-colors hover:border-dash-border focus:max-w-[24rem] focus:border-brand-primary/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/15 sm:max-w-[22rem]"
    />
  );
}
