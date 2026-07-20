"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { getModuleSettingsCards } from "@/features/settings/constants/module-settings-cards";
import { cn } from "@/lib/utils";

export function ModuleSettingsGrid() {
  const modules = getModuleSettingsCards();

  const configurable = modules.filter((m) => m.href);
  const upcoming = modules.filter((m) => !m.href);

  return (
    <div className="w-full max-w-[75%] space-y-8">
      {configurable.length > 0 ? (
        <section aria-labelledby="modules-active-heading">
          <div className="mb-3">
            <h2
              id="modules-active-heading"
              className="text-sm font-semibold text-brand-navy"
            >
              Active modules
            </h2>
            <p className="mt-0.5 text-xs text-brand-muted">
              Modules that are enabled and configurable.
            </p>
          </div>

          <div className="space-y-2">
            {configurable.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.id}
                  href={module.href!}
                  className="group block"
                >
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg border border-brand-border bg-white px-4 py-3 transition-colors",
                      "hover:border-brand-primary/40 hover:bg-brand-tint/30",
                    )}
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-tint text-brand-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-brand-navy">
                        {module.label}
                      </h3>
                      <p className="mt-0.5 line-clamp-1 text-xs text-brand-muted">
                        {module.description}
                      </p>
                    </div>

                    <ChevronRight
                      className="size-4 shrink-0 text-brand-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand-primary"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {upcoming.length > 0 ? (
        <section aria-labelledby="modules-upcoming-heading">
          <div className="mb-3">
            <h2
              id="modules-upcoming-heading"
              className="text-sm font-semibold text-brand-navy"
            >
              Coming soon
            </h2>
            <p className="mt-0.5 text-xs text-brand-muted">
              Additional modules will become available here over time.
            </p>
          </div>

          <div className="space-y-2">
            {upcoming.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.id}
                  className="flex items-center gap-3 rounded-lg border border-brand-border bg-white px-4 py-3 opacity-60"
                  aria-disabled="true"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-brand-muted">
                    <Icon className="size-4" aria-hidden="true" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-medium text-brand-navy">
                        {module.label}
                      </h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-muted">
                        Coming soon
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-brand-muted">
                      {module.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
