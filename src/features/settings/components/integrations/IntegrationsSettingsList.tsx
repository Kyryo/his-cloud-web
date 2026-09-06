"use client";

import Link from "next/link";

import { AppIcon } from "@/components/icons/app-icon";
import { SettingsSection } from "@/features/settings/components/SettingsPageLayout";
import {
  getIntegrationSettingsSections,
  type IntegrationSettingsItem,
} from "@/features/settings/constants/integration-settings-cards";

function IntegrationRow({ item }: { item: IntegrationSettingsItem }) {
  return (
    <li>
      <Link href={item.href} className="flex items-center gap-3 py-3.5">
        <AppIcon
          name={item.icon}
          size={16}
          className="mt-0.5 shrink-0 text-slate-400"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-brand-navy">
            {item.label}
          </p>
          <p className="mt-0.5 text-sm text-slate-400">{item.description}</p>
        </div>
        {item.region ? (
          <span className="shrink-0 text-xs text-slate-400">{item.region}</span>
        ) : null}
        <AppIcon
          name="chevronRight"
          size={16}
          className="shrink-0 text-slate-300"
        />
      </Link>
    </li>
  );
}

export function IntegrationsSettingsList() {
  const sections = getIntegrationSettingsSections();

  return (
    <>
      {sections.map((section) => (
        <SettingsSection
          key={section.id}
          title={section.title}
          description={section.description}
          flush
        >
          <ul className="divide-y divide-brand-border">
            {section.items.map((item) => (
              <IntegrationRow key={item.id} item={item} />
            ))}
          </ul>
        </SettingsSection>
      ))}
    </>
  );
}
