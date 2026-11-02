"use client";

import { Plus } from "lucide-react";

import type { AddSectionTab } from "@/features/oh-template-builder/components/AddSectionSheet";
import type { SectionInteractionMode } from "@/features/oh-template-builder/components/SelectionModeToggle";
import { FormsIllustration } from "@/features/oh-template-builder/components/UndrawIllustrations";

type AddSectionRequest = {
  tab: AddSectionTab;
  interaction?: SectionInteractionMode;
};

type EmptyTemplateProps = {
  onAddSection: (request: AddSectionRequest) => void;
};

export function EmptyTemplate({ onAddSection }: EmptyTemplateProps) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto bg-white px-8">
      <div className="flex flex-row items-center justify-center gap-12">
        <FormsIllustration className="h-52 w-auto shrink-0 text-brand-primary" />
        <div className="max-w-xs">
          <h2 className="text-xl font-semibold tracking-tight text-brand-navy">
            Add the first section
          </h2>
          <p className="mt-2 text-sm leading-6 text-dash-muted">
            A section is one part of the examination, such as vision, hearing or the fitness
            outcome. The form is built from these sections.
          </p>
          <button
            type="button"
            onClick={() => onAddSection({ tab: "new" })}
            className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-md bg-brand-primary px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-brand-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
          >
            <Plus className="size-3.5" aria-hidden />
            Add section
          </button>
        </div>
      </div>
    </div>
  );
}
