"use client";

import type { ReactNode } from "react";

import { FabButton } from "@/components/ui/fab-button";
import { PanelRight } from "lucide-react";

import { OpdEncounterSummaryPanel } from "@/features/clinical-opd/components/detail/OpdEncounterSummaryPanel";
import { OpdEncounterWorkspaceChrome } from "@/features/clinical-opd/components/detail/OpdEncounterWorkspaceChrome";
import type { Customer } from "@/features/customers/types/customer.types";
import { cn } from "@/lib/utils";

type OpdEncounterWorkspaceBodyProps = {
  children: ReactNode;
  customer: Customer | null;
  showSummaryPanel: boolean;
  onToggleSummaryPanel: () => void;
};

export function OpdEncounterWorkspaceBody({
  children,
  customer,
  showSummaryPanel,
  onToggleSummaryPanel,
}: OpdEncounterWorkspaceBodyProps) {
  return (
    <>
      <div
        className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_23rem]"
        data-testid="opd-encounter-workspace-grid"
      >
        <div className="order-1 min-w-0 xl:col-start-1 xl:row-start-1">
          <OpdEncounterWorkspaceChrome />
          <div className="px-4 pb-4 sm:px-6">{children}</div>
        </div>

        <OpdEncounterSummaryPanel
          customer={customer}
          className={cn(
            "order-2 xl:col-start-2 xl:row-start-1 xl:self-stretch",
            !showSummaryPanel && "hidden xl:block",
          )}
        />
      </div>

      <FabButton
        label={
          showSummaryPanel
            ? "Hide encounter summary"
            : "Show encounter summary"
        }
        icon={PanelRight}
        variant="outline"
        hideFrom="xl"
        className="bg-white"
        onClick={onToggleSummaryPanel}
        data-testid="opd-encounter-summary-fab"
      />
    </>
  );
}
