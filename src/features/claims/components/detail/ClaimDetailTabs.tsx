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
import { ClaimDetailClientTab } from "@/features/claims/components/detail/ClaimDetailClientTab";
import { ClaimDetailClinicalTab } from "@/features/claims/components/detail/ClaimDetailClinicalTab";
import { ClaimSummaryPanel } from "@/features/claims/components/detail/ClaimSummaryPanel";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { VisitDetailDialog } from "@/features/visits/components/VisitDetailDialog";
import { cn } from "@/lib/utils";

type ClaimDetailTabsProps = {
  claim: ClaimDetail;
  onClaimUpdated?: (claim: ClaimDetail) => void;
};

type DetailTabId =
  | "claimed-items"
  | "client-visit"
  | "clinical"
  | "advisories"
  | "activity";

const tabs: Array<{ id: DetailTabId; label: string }> = [
  { id: "advisories", label: "Advisories" },
  { id: "claimed-items", label: "Claimed Items" },
  { id: "client-visit", label: "Client & Visit" },
  { id: "clinical", label: "Clinical Info" },
  { id: "activity", label: "Activity" },
];

export function ClaimDetailTabs({
  claim,
  onClaimUpdated,
}: ClaimDetailTabsProps) {
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
            isActive={activeTab === tab.id}
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
            isActive={activeTab === "advisories"}
            onClaimUpdated={onClaimUpdated}
          />
          <ClaimDetailClaimedItemsTab
            claim={claim}
            isActive={activeTab === "claimed-items"}
          />
          <ClaimDetailClientTab
            claim={claim}
            isActive={activeTab === "client-visit"}
          />
          <ClaimDetailClinicalTab
            claim={claim}
            isActive={activeTab === "clinical"}
          />
          <ClaimDetailActivityTab
            invoiceId={invoiceId}
            isActive={activeTab === "activity"}
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
