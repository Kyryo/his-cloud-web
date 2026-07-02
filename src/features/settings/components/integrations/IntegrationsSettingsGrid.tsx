"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { getIntegrationSettingsSections } from "@/features/settings/constants/integration-settings-cards";
import { cn } from "@/lib/utils";

export function IntegrationsSettingsGrid() {
  const sections = getIntegrationSettingsSections();

  return (
    <div className="w-full max-w-[75%] space-y-8">
      {sections.map((section) => (
        <section key={section.id} aria-labelledby={`integration-section-${section.id}`}>
          <div className="mb-3">
            <h2
              id={`integration-section-${section.id}`}
              className="text-sm font-semibold text-brand-navy"
            >
              {section.title}
            </h2>
            {section.description ? (
              <p className="mt-0.5 text-xs text-brand-muted">{section.description}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            {section.items.map((integration) => {
              const Icon = integration.icon;

              return (
                <Link
                  key={integration.id}
                  href={integration.href}
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
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-medium text-brand-navy">
                          {integration.label}
                        </h3>
                        {integration.badge ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-muted">
                            {integration.badge}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-xs text-brand-muted">
                        {integration.description}
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
      ))}
    </div>
  );
}
