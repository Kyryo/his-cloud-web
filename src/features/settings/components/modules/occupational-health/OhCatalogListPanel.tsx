"use client";

import type { ReactNode } from "react";

import { TabAddActionButton } from "@/components/ui/app-buttons";
import { SettingsPanelSection } from "@/features/settings/components/SettingsPageLayout";

type OhCatalogListPanelProps = {
  title: string;
  description: string;
  addLabel: string;
  onAdd: () => void;
  isLoading?: boolean;
  error?: string | null;
  emptyTitle: string;
  emptyDescription: string;
  toolbar?: ReactNode;
  children: ReactNode;
  isEmpty: boolean;
};

export function OhCatalogListPanel({
  title,
  description,
  addLabel,
  onAdd,
  isLoading = false,
  error = null,
  emptyTitle,
  emptyDescription,
  toolbar,
  children,
  isEmpty,
}: OhCatalogListPanelProps) {
  return (
    <SettingsPanelSection
      title={title}
      description={description}
      action={
        <TabAddActionButton type="button" onClick={onAdd}>
          {addLabel}
        </TabAddActionButton>
      }
    >
      {toolbar ? <div className="mb-4">{toolbar}</div> : null}
      {isLoading ? (
        <p className="text-sm text-brand-muted">Loading…</p>
      ) : error ? (
        <p className="text-sm text-red-700">{error}</p>
      ) : isEmpty ? (
        <div className="rounded-xl border border-dashed border-dash-border px-4 py-10 text-center">
          <p className="text-sm font-medium text-brand-navy">{emptyTitle}</p>
          <p className="mt-1 text-sm text-brand-muted">{emptyDescription}</p>
        </div>
      ) : (
        children
      )}
    </SettingsPanelSection>
  );
}
