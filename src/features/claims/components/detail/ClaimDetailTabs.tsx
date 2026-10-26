"use client";

import { PanelRight } from "lucide-react";
import { useState, type ReactNode } from "react";

import { FabButton } from "@/components/ui/fab-button";
import {
  DetailPageMainAsideGrid,
  DetailPageMainSection,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { ClaimDetailTabNav } from "@/features/claims/components/detail/ClaimDetailTabNav";
import { ClaimSummaryPanel } from "@/features/claims/components/detail/ClaimSummaryPanel";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { VisitDetailDialog } from "@/features/visits/components/VisitDetailDialog";
import { cn } from "@/lib/utils";

type ClaimDetailTabsProps = {
  claimId: string;
  claim: ClaimDetail;
  /** The active tab route rendered by the claim layout. */
  children: ReactNode;
};

export function ClaimDetailTabs({ claimId, claim, children }: ClaimDetailTabsProps) {
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const [visitDialogOpen, setVisitDialogOpen] = useState(false);
  const visitUuid = claim.visit_uuid || null;

  return (
    <DetailPageTabsSection>
      <VisitDetailDialog
        visitUuid={visitUuid}
        open={visitDialogOpen}
        onOpenChange={setVisitDialogOpen}
      />

      <ClaimDetailTabNav claimId={claimId} claim={claim} />

      <DetailPageMainAsideGrid>
        <DetailPageMainSection>{children}</DetailPageMainSection>

        <ClaimSummaryPanel
          claim={claim}
          className={cn(!showSummaryPanel && "hidden xl:block")}
          onOpenVisit={visitUuid ? () => setVisitDialogOpen(true) : undefined}
        />
      </DetailPageMainAsideGrid>

      <FabButton
        label={showSummaryPanel ? "Hide claim summary" : "Show claim summary"}
        icon={PanelRight}
        variant="outline"
        hideFrom="xl"
        className="bg-white"
        onClick={() => setShowSummaryPanel((current) => !current)}
        data-testid="claim-summary-fab"
      />
    </DetailPageTabsSection>
  );
}
