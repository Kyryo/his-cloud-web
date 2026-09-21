"use client";

import Link from "next/link";

import { AppIcon } from "@/components/icons/app-icon";
import { SettingsSection } from "@/features/settings/components/SettingsPageLayout";
import {
  getModuleSettingsItems,
  type ModuleSettingsItem,
} from "@/features/settings/constants/module-settings-cards";
import { cn } from "@/lib/utils";

function ModuleRow({ module }: { module: ModuleSettingsItem }) {
  return (
    <li>
      <Link
        href={module.href}
        className={cn(
          "group flex items-center gap-3 rounded-lg py-3.5 transition-colors",
          "hover:bg-slate-50/80 focus-visible:bg-slate-50/80 focus-visible:outline-none",
        )}
        data-testid={`module-settings-link-${module.slug}`}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-200/70 transition-colors group-hover:bg-white group-hover:text-brand-primary">
          <AppIcon name={module.icon} size={16} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-brand-navy">
            {module.label}
          </p>
          <p className="mt-0.5 text-sm text-slate-400">{module.description}</p>
        </div>
        <AppIcon
          name="chevronRight"
          size={16}
          className="shrink-0 text-slate-300 transition-colors group-hover:text-slate-400"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}

export function ModuleSettingsList() {
  const modules = getModuleSettingsItems();

  return (
    <SettingsSection
      title="Operational modules"
      description="Configure workflows and defaults for each module."
      flush
    >
      <ul className="divide-y divide-brand-border">
        {modules.map((module) => (
          <ModuleRow key={module.id} module={module} />
        ))}
      </ul>
    </SettingsSection>
  );
}
