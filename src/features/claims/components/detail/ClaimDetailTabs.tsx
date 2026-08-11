"use client";

import { PanelRight } from "lucide-react";
import { useState } from "react";

import { FabButton } from "@/components/ui/fab-button";
import {
  DetailPageMainAsideGrid,
  DetailPageMainSection,
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { ClaimDetailActivityTab } from "@/features/claims/components/detail/ClaimDetailActivityTab";
import { ClaimDetailAdvisoriesTab } from "@/features/claims/components/detail/ClaimDetailAdvisoriesTab";
import { ClaimDetailClaimedItemsTab } from "@/features/claims/components/detail/ClaimDetailClaimedItemsTab";
import { ClaimDetailOdontogramTab } from "@/features/claims/components/detail/ClaimDetailOdontogramTab";
import { ClaimDetailReferenceTab } from "@/features/claims/components/detail/ClaimDetailReferenceTab";
import { ClaimSummaryPanel } from "@/features/claims/components/detail/ClaimSummaryPanel";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { shouldShowClaimOdontogramTab } from "@/features/claims/utils/claim-odontogram-tab";
import { VisitDetailDialog } from "@/features/visits/components/VisitDetailDialog";
import { cn } from "@/lib/utils";

type ClaimDetailTabsProps = {
  claim: ClaimDetail;
  onClaimUpdated?: (claim: ClaimDetail) => void;
  onRequestSubmit?: () => void;
};

type DetailTabId =
  | "claimed-items"
  | "odontogram"
  | "advisories"
  | "reference"
  | "activity";

const ALL_TABS: Array<{ id: DetailTabId; label: string }> = [
  { id: "advisories", label: "Claim" },
  { id: "claimed-items", label: "Claimed items" },
  { id: "odontogram", label: "Odontogram" },
  { id: "reference", label: "Reference" },
  { id: "activity", label: "Activity" },
];

export function ClaimDetailTabs({
  claim,
  onClaimUpdated,
  onRequestSubmit,
}: ClaimDetailTabsProps) {
  const showOdontogram = shouldShowClaimOdontogramTab(claim);
  const tabs = ALL_TABS.filter(
    (tab) => tab.id !== "odontogram" || showOdontogram,
  );
  const [activeTab, setActiveTab] = useState<DetailTabId>("advisories");
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const [visitDialogOpen, setVisitDialogOpen] = useState(false);
  const invoiceId = claim.invoice_id || claim.invoice || null;
  const visitUuid = claim.visit_uuid || null;
  const claimedItemCount =
    claim.claim_invoices?.reduce(
      (count, invoice) => count + (invoice.line_items?.length ?? 0),
      0,
    ) ?? 0;
  const findingCount =
    claim.latest_advisor_evaluation?.deterministic_count ?? 0;
  const resolvedActiveTab =
    activeTab === "odontogram" && !showOdontogram ? "advisories" : activeTab;

  return (
    <DetailPageTabsSection>
      <VisitDetailDialog
        visitUuid={visitUuid}
        open={visitDialogOpen}
        onOpenChange={setVisitDialogOpen}
      />

      <DetailPageTabsNavSection aria-label="Claim sections">
        {tabs.map((tab) => (
          <DetailPageTabNavItem
            key={tab.id}
            isActive={resolvedActiveTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="relative inline-flex items-center gap-2">
              {tab.id === "claimed-items" && claimedItemCount > 0
                ? `${tab.label} (${claimedItemCount})`
                : tab.id === "advisories" && findingCount > 0
                  ? `${tab.label} (${findingCount})`
                  : tab.label}
              {tab.id === "advisories" && claim.has_blocking_advisories ? (
                <span
                  className="size-2 rounded-full bg-red-500"
                  aria-label="Blocking advisories"
                />
              ) : null}
            </span>
          </DetailPageTabNavItem>
        ))}
      </DetailPageTabsNavSection>

      <DetailPageMainAsideGrid>
        <DetailPageMainSection>
          <ClaimDetailAdvisoriesTab
            claim={claim}
            isActive={resolvedActiveTab === "advisories"}
            onClaimUpdated={onClaimUpdated}
            onRequestSubmit={onRequestSubmit}
          />
          <ClaimDetailClaimedItemsTab
            claim={claim}
            isActive={resolvedActiveTab === "claimed-items"}
          />
          {showOdontogram ? (
            <ClaimDetailOdontogramTab
              claim={claim}
              isActive={resolvedActiveTab === "odontogram"}
              onClaimUpdated={onClaimUpdated}
            />
          ) : null}
          <ClaimDetailReferenceTab
            claim={claim}
            isActive={resolvedActiveTab === "reference"}
          />
          <ClaimDetailActivityTab
            invoiceId={invoiceId}
            isActive={resolvedActiveTab === "activity"}
          />
        </DetailPageMainSection>

        <ClaimSummaryPanel
          claim={claim}
          className={cn(!showSummaryPanel && "hidden xl:block")}
          onOpenVisit={
            visitUuid ? () => setVisitDialogOpen(true) : undefined
          }
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
