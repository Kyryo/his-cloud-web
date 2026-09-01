import { ClipboardList, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { DetailTabEmptyState } from "@/components/detail/detail-tab-empty-state";

type LineItemsEmptyStateProps = {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  "data-testid"?: string;
};

export function LineItemsEmptyState({
  title = "No items yet",
  description = "Click Add line item to get started.",
  icon = ClipboardList,
  action,
  "data-testid": testId,
}: LineItemsEmptyStateProps) {
  return (
    <DetailTabEmptyState
      icon={icon}
      title={title}
      description={description}
      action={action}
      data-testid={testId}
    />
  );
}
