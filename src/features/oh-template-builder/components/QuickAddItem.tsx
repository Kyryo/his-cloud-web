"use client";

import { CornerDownLeft, Loader2, Plus } from "lucide-react";
import { useState } from "react";

import { useTemplateBuilder } from "@/features/oh-template-builder/hooks/useTemplateBuilder";
import { toUpperCode } from "@/features/oh-template-builder/lib/templateCodes";

type QuickAddItemProps = {
  sectionUuid: string;
  attachmentUuid: string;
};

/** Inline "type a name, press Enter" item creation; stays open for rapid entry. */
export function QuickAddItem({ sectionUuid, attachmentUuid }: QuickAddItemProps) {
  const { createItem, isPending, select } = useTemplateBuilder();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const isSaving = isPending(`item:create:${sectionUuid}`);
  const code = toUpperCode(name);

  async function submit() {
    if (!code || isSaving) {
      return;
    }
    const created = await createItem(sectionUuid, {
      name: name.trim(),
      code,
      isMandatory: false,
      schedule: [],
      responses: [],
      inheritsResponseFields: true,
      overrideResponseFields: [],
    });
    if (created) {
      setName("");
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-dash-muted transition-colors hover:bg-slate-50 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
      >
        <Plus className="size-3.5" aria-hidden />
        Add item
      </button>
    );
  }

  return (
    <div className="space-y-1.5 px-1 pb-1">
      <div className="flex items-center gap-2 rounded-lg border border-brand-primary/40 bg-white px-3 ring-4 ring-brand-primary/10">
        <Plus className="size-3.5 shrink-0 text-brand-primary" aria-hidden />
        <input
          autoFocus
          value={name}
          aria-label="New item name"
          placeholder="Item name, e.g. Blood pressure"
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void submit();
            }
            if (event.key === "Escape") {
              setName("");
              setIsOpen(false);
            }
          }}
          onBlur={() => {
            if (!name.trim()) {
              setIsOpen(false);
            }
          }}
          className="h-9 min-w-0 flex-1 bg-transparent text-sm text-brand-navy placeholder:text-slate-400 focus:outline-none"
        />
        {isSaving ? (
          <Loader2 className="size-3.5 animate-spin text-dash-muted" aria-hidden />
        ) : (
          <kbd className="flex items-center gap-1 rounded border border-dash-border px-1.5 py-0.5 text-[10px] text-dash-muted">
            <CornerDownLeft className="size-3" aria-hidden />
            Enter
          </kbd>
        )}
      </div>
      <div className="flex items-center justify-between px-1 text-[11px] text-dash-muted">
        <span>
          {code ? (
            <>
              Code <span className="font-mono text-brand-slate">{code}</span>
            </>
          ) : (
            "Esc to close"
          )}
        </span>
        <button
          type="button"
          className="text-brand-primary hover:underline"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setIsOpen(false);
            setName("");
            select({ type: "section", attachmentUuid });
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
