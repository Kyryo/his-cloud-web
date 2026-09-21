"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import type { ChiefComplaintSuggestion } from "@/features/clinical-opd/types/clinical-opd.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type OpdPastComplaintsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: ChiefComplaintSuggestion[];
  onSelect: (text: string) => void;
};

export function OpdPastComplaintsDialog({
  open,
  onOpenChange,
  suggestions,
  onSelect,
}: OpdPastComplaintsDialogProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return suggestions;
    }
    return suggestions.filter((item) =>
      item.text.toLowerCase().includes(query),
    );
  }, [search, suggestions]);

  return (
    <SectionedDialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setSearch("");
        }
      }}
      title="Past complaints"
      description="Search previous chief complaints for this client."
      className={cn(appFont.className, "sm:max-w-md")}
      data-testid="opd-past-complaints-dialog"
    >
      <div className="space-y-3">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search complaints..."
          autoComplete="off"
          autoFocus
          data-testid="opd-past-complaints-search"
        />
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-brand-muted">
            No matching complaints.
          </p>
        ) : (
          <ul
            className="max-h-72 overflow-y-auto rounded-md border border-dash-border"
            data-testid="opd-past-complaints-list"
          >
            {filtered.map((item) => (
              <li key={item.text} className="border-b border-dash-border/70 last:border-b-0">
                <button
                  type="button"
                  className="flex w-full flex-col gap-0.5 px-3 py-2.5 text-left hover:bg-dash-canvas"
                  onClick={() => {
                    onSelect(item.text);
                    onOpenChange(false);
                    setSearch("");
                  }}
                >
                  <span className="text-sm font-medium text-brand-navy">
                    {item.text}
                  </span>
                  {item.occurrence_count > 1 ? (
                    <span className="text-[11px] text-brand-muted">
                      Used {item.occurrence_count} times
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectionedDialog>
  );
}
