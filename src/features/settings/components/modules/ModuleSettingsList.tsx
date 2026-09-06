"use client";

import Link from "next/link";

import { AppIcon } from "@/components/icons/app-icon";
import { SettingsSection } from "@/features/settings/components/SettingsPageLayout";
import {
  getModuleSettingsItems,
  type ModuleSettingsItem,
} from "@/features/settings/constants/module-settings-cards";

function ModuleRow({
  module,
}: {
  module: ModuleSettingsItem;
}) {
  const body = (
    <>
      <AppIcon
        name={module.icon}
        size={16}
        className="mt-0.5 shrink-0 text-slate-400"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-brand-navy">
          {module.label}
        </p>
        <p className="mt-0.5 text-sm text-slate-400">{module.description}</p>
      </div>
    </>
  );

  if (module.href) {
    return (
      <li>
        <Link
          href={module.href}
          className="flex items-center gap-3 py-3.5"
        >
          {body}
          <AppIcon
            name="chevronRight"
            size={16}
            className="shrink-0 text-slate-300"
          />
        </Link>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 py-3.5">
      {body}
      <span className="shrink-0 text-xs text-slate-400">Coming soon</span>
    </li>
  );
}

export function ModuleSettingsList() {
  const modules = getModuleSettingsItems();
  const configurable = modules.filter((module) => module.href);
  const upcoming = modules.filter((module) => !module.href);

  return (
    <>
      <SettingsSection
        title="Configurable"
        description="Open a module to change clinic workflows and defaults."
        flush
      >
        <ul className="divide-y divide-brand-border">
          {configurable.map((module) => (
            <ModuleRow key={module.id} module={module} />
          ))}
        </ul>
      </SettingsSection>

      {upcoming.length > 0 ? (
        <SettingsSection
          title="Coming soon"
          description="These modules will get settings as they ship."
          flush
        >
          <ul className="divide-y divide-brand-border">
            {upcoming.map((module) => (
              <ModuleRow key={module.id} module={module} />
            ))}
          </ul>
        </SettingsSection>
      ) : null}
    </>
  );
}
