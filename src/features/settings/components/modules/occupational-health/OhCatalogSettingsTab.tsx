"use client";

import { TemplateGallery } from "@/features/oh-template-builder/components/TemplateGallery";

type OhCatalogSettingsTabProps = {
  isActive: boolean;
};

export function OhCatalogSettingsTab({ isActive }: OhCatalogSettingsTabProps) {
  if (!isActive) {
    return null;
  }
  return <TemplateGallery kind="certificate" />;
}
