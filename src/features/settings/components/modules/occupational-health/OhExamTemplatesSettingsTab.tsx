"use client";

import { TemplateGallery } from "@/features/oh-template-builder/components/TemplateGallery";

type OhExamTemplatesSettingsTabProps = {
  isActive: boolean;
};

export function OhExamTemplatesSettingsTab({ isActive }: OhExamTemplatesSettingsTabProps) {
  if (!isActive) {
    return null;
  }
  return <TemplateGallery kind="exam" />;
}
