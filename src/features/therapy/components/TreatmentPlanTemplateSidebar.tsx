"use client";

import { ArrowLeft, ClipboardCopy } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TherapyTreatmentPlan } from "@/features/therapy/types/therapy.types";

export function TreatmentPlanTemplateSidebar({
  templates,
  onSelect,
}: {
  templates: TherapyTreatmentPlan[];
  onSelect: (template: TherapyTreatmentPlan) => void;
}) {
  return (
    <aside className="border-t border-brand-border pt-5 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
      <div className="flex items-center gap-2">
        <ClipboardCopy className="size-4 text-brand-primary" aria-hidden="true" />
        <h3 className="font-semibold text-brand-navy">Plan templates</h3>
      </div>
      <p className="mt-1 text-sm text-brand-muted">
        Reuse values from plans in this clinic.
      </p>
      {templates.length === 0 ? (
        <p className="mt-5 text-sm text-brand-muted">
          No clinic plan templates are available.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {templates.map((template) => (
            <Button
              key={template.uuid}
              type="button"
              variant="ghost"
              className="group h-auto w-full justify-between whitespace-normal px-3 py-2 text-left hover:bg-transparent"
              onClick={() => onSelect(template)}
            >
              <span className="min-w-0">
                <span className="block truncate font-medium text-brand-navy">
                  {template.title}
                </span>
                <span className="mt-0.5 block line-clamp-2 text-xs font-normal text-brand-muted">
                  {template.diagnosis}
                </span>
              </span>
              <ArrowLeft
                className="size-4 shrink-0 text-brand-primary opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              />
            </Button>
          ))}
        </div>
      )}
    </aside>
  );
}
