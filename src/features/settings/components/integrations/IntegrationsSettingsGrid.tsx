"use client";

import Link from "next/link";

import { getIntegrationSettingsCards } from "@/features/settings/constants/integration-settings-cards";
import { cn } from "@/lib/utils";

export function IntegrationsSettingsGrid() {
  const integrations = getIntegrationSettingsCards();

  return (
    <div className="w-full max-w-[50%] space-y-4">
      {integrations.map((integration) => {
        const Icon = integration.icon;

        return (
          <Link
            key={integration.id}
            href={integration.href}
            className="block h-full"
          >
            <div
              className={cn(
                "flex h-full flex-col rounded-xl border border-brand-border bg-white p-5 transition-colors",
                "hover:border-brand-primary hover:bg-brand-tint/40",
              )}
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-brand-tint text-brand-primary">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-brand-navy">
                {integration.label}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-brand-muted">
                {integration.description}
              </p>
              <p className="mt-4 text-sm font-medium text-brand-primary">
                Configure integration →
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
