"use client";

import type { ReactNode } from "react";

import {
  SettingsPageLayout,
  SettingsSection,
} from "@/features/settings/components/SettingsPageLayout";

type OrganizationSettingsSubpageProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function OrganizationSettingsSubpage({
  title,
  description,
  children,
}: OrganizationSettingsSubpageProps) {
  return (
    <SettingsPageLayout
      title={title}
      description={description}
      className="max-w-3xl"
    >
      <SettingsSection title={title} description={description} flush>
        {children}
      </SettingsSection>
    </SettingsPageLayout>
  );
}
