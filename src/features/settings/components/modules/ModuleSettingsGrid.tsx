"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { getModuleSettingsCards } from "@/features/settings/constants/module-settings-cards";
import { cn } from "@/lib/utils";

export function ModuleSettingsGrid() {
  const modules = getModuleSettingsCards();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {modules.map((module) => {
        const Icon = module.icon;
        const content = (
          <div
            className={cn(
              "flex h-full flex-col rounded-xl border border-brand-border bg-white p-5 transition-colors",
              module.href && "hover:border-brand-primary hover:bg-brand-tint/40",
              module.comingSoon && "opacity-80",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-brand-tint text-brand-primary">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              {module.comingSoon ? (
                <Badge variant="secondary" className="font-normal">
                  Coming soon
                </Badge>
              ) : null}
            </div>
            <h2 className="mt-4 text-base font-semibold text-brand-navy">
              {module.label}
            </h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-brand-muted">
              {module.description}
            </p>
            {module.href ? (
              <p className="mt-4 text-sm font-medium text-brand-primary">
                Configure module →
              </p>
            ) : null}
          </div>
        );

        if (module.href) {
          return (
            <Link key={module.id} href={module.href} className="block h-full">
              {content}
            </Link>
          );
        }

        return (
          <div key={module.id} className="h-full" aria-disabled="true">
            {content}
          </div>
        );
      })}
    </div>
  );
}
