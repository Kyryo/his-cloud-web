"use client";

import { Plus } from "lucide-react";

import {
  CANVAS_ITEM_GRID,
  CANVAS_ITEM_INDENT,
  CanvasSection,
} from "@/features/oh-template-builder/components/CanvasSection";
import { useTemplateBuilder } from "@/features/oh-template-builder/hooks/useTemplateBuilder";
import { cn } from "@/lib/utils";

type TemplateCanvasProps = {
  onAddSection: () => void;
};

export function TemplateCanvas({ onAddSection }: TemplateCanvasProps) {
  const { attachments, isLoading, select } = useTemplateBuilder();
  const hasSections = !isLoading && attachments.length > 0;

  return (
    <div
      className="h-full min-h-0 overflow-y-auto bg-white"
      onClick={() => select({ type: "template" })}
    >
      {hasSections ? (
        <div className="sticky top-0 z-10 border-b border-dash-border bg-white/95 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-[52rem] px-5 sm:px-8">
            <div className={CANVAS_ITEM_INDENT}>
              <div
                aria-hidden
                className={cn(
                  CANVAS_ITEM_GRID,
                  "h-8 px-2 text-[11.5px] font-medium text-dash-muted",
                )}
              >
                <span />
                <span>Item</span>
                <span className="hidden sm:block">Answers</span>
                <span className="hidden sm:block">Repeats</span>
                <span />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-[52rem] px-5 pb-16 pt-2 sm:px-8">
        {isLoading ? (
          <CanvasSkeleton />
        ) : attachments.length === 0 ? (
          <EmptyCanvas onAddSection={onAddSection} />
        ) : (
          <>
            <ol className="divide-y divide-dash-border">
              {attachments.map((attachment, index) => (
                <CanvasSection
                  key={attachment.uuid}
                  attachment={attachment}
                  isFirst={index === 0}
                  isLast={index === attachments.length - 1}
                />
              ))}
            </ol>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onAddSection();
              }}
              className="-mx-1.5 mt-1 flex h-9 w-[calc(100%+0.75rem)] items-center gap-2 rounded-md border border-dashed border-dash-border px-2.5 text-[13px] font-medium text-dash-muted transition-colors hover:border-brand-primary/40 hover:bg-brand-tint/40 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
            >
              <Plus className="size-3.5" aria-hidden />
              Add section
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyCanvas({ onAddSection }: { onAddSection: () => void }) {
  return (
    <div className="pt-14" onClick={(event) => event.stopPropagation()}>
      <p className="text-[15px] font-semibold text-brand-navy">This form is empty</p>
      <p className="mt-1 max-w-[48ch] text-[13px] leading-5 text-dash-muted">
        Add a section for each part of the examination, for example vision, hearing or the
        fitness outcome.
      </p>
      <button
        type="button"
        onClick={onAddSection}
        className="mt-4 flex h-8 items-center gap-1.5 rounded-md border border-dash-border px-3 text-[13px] font-medium text-brand-navy transition-colors hover:border-brand-primary/40 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 active:translate-y-px"
      >
        <Plus className="size-3.5" aria-hidden />
        Add section
      </button>
    </div>
  );
}

function CanvasSkeleton() {
  return (
    <div className="divide-y divide-dash-border" aria-hidden>
      {[3, 2].map((rows, index) => (
        <div key={index} className="py-2.5">
          <div className="flex h-9 items-center gap-2">
            <span className="size-3.5 animate-pulse rounded bg-slate-100" />
            <span className="h-3.5 w-40 animate-pulse rounded bg-slate-100" />
          </div>
          <div className={CANVAS_ITEM_INDENT}>
            {Array.from({ length: rows }, (_, row) => (
              <div key={row} className="flex h-8 items-center gap-3 px-2">
                <span className="size-3.5 animate-pulse rounded bg-slate-100" />
                <span className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
