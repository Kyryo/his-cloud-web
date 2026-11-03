"use client";

import { Briefcase } from "lucide-react";
import type { ReactNode } from "react";

import {
  OH_ENCOUNTER_MODULES,
  type OhEncounterPanelId,
} from "@/features/occupational-health/lib/oh-encounter-modules";
import { cn } from "@/lib/utils";

type OhEncounterModuleNavProps = {
  activePanel: OhEncounterPanelId;
  onPanelChange: (panel: OhEncounterPanelId) => void;
  className?: string;
};

export function OhEncounterModuleNav({
  activePanel,
  onPanelChange,
  className,
}: OhEncounterModuleNavProps) {
  return (
    <nav
      aria-label="Occupational health modules"
      className={cn(
        "flex h-full min-h-0 flex-col border-b border-dash-border bg-slate-50/80 xl:border-b-0 xl:border-r",
        className,
      )}
      data-testid="oh-encounter-module-nav"
    >
      <div className="hidden border-b border-dash-border/80 px-4 py-3 xl:block">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
          Modules
        </p>
      </div>

      <div className="scrollbar-hide flex gap-1 overflow-x-auto px-2 py-2 xl:min-h-0 xl:flex-1 xl:flex-col xl:overflow-y-auto xl:px-2 xl:py-3">
        {OH_ENCOUNTER_MODULES.map((module) => {
          const Icon = module.icon;
          const selected = activePanel === module.id;
          return (
            <NavButton
              key={module.id}
              selected={selected}
              label={module.label}
              description={module.description}
              onClick={() => onPanelChange(module.id)}
              icon={<Icon className="size-4" aria-hidden />}
            />
          );
        })}
        <div className="hidden xl:mt-auto xl:block xl:border-t xl:border-dash-border/80 xl:pt-2">
          <NavButton
            selected={activePanel === "employment"}
            label="Employment"
            description="Risk profile and job assignment"
            onClick={() => onPanelChange("employment")}
            icon={<Briefcase className="size-4" aria-hidden />}
          />
        </div>
        <div className="xl:hidden">
          <NavButton
            selected={activePanel === "employment"}
            label="Employment"
            description="Risk profile and job assignment"
            onClick={() => onPanelChange("employment")}
            icon={<Briefcase className="size-4" aria-hidden />}
          />
        </div>
      </div>
    </nav>
  );
}

function NavButton({
  selected,
  label,
  description,
  onClick,
  icon,
}: {
  selected: boolean;
  label: string;
  description: string;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={selected ? "page" : undefined}
      className={cn(
        "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30",
        "xl:w-full",
        selected
          ? "bg-white text-brand-navy shadow-[0_1px_2px_rgb(15_23_42/0.08)] ring-1 ring-dash-border/80"
          : "text-brand-slate hover:bg-white/70 hover:text-brand-navy",
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          selected
            ? "bg-brand-primary/10 text-brand-primary"
            : "bg-white text-dash-muted ring-1 ring-dash-border/70",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-medium leading-5">{label}</span>
        <span className="mt-0.5 hidden text-[11px] leading-4 text-dash-muted xl:block">
          {description}
        </span>
      </span>
    </button>
  );
}
