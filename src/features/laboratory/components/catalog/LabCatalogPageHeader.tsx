"use client";

import type { ReactNode } from "react";

import { AddActionButton } from "@/components/ui/app-buttons";
import {
  ListPageHeaderActions,
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
} from "@/features/app-shell/components/page-layout";

type LabCatalogPageHeaderProps = {
  title: string;
  description: string;
  addLabel?: string;
  onAdd?: () => void;
  filters?: ReactNode;
  "data-testid"?: string;
};

export function LabCatalogPageHeader({
  title,
  description,
  addLabel,
  onAdd,
  filters,
  "data-testid": dataTestId,
}: LabCatalogPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <ListPageHeaderTopRow>
        <ListPageHeaderTitleBlock title={title} description={description} />
        {addLabel && onAdd ? (
          <ListPageHeaderActions>
            <AddActionButton
              label={addLabel}
              className="shrink-0 self-start"
              onClick={onAdd}
              data-testid={dataTestId}
            />
          </ListPageHeaderActions>
        ) : null}
      </ListPageHeaderTopRow>
      {filters ? <div className="mt-3">{filters}</div> : null}
    </ListPageHeaderSection>
  );
}
