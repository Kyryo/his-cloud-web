"use client";

import { useMemo, useState } from "react";
import { FlaskConical, ImageIcon } from "lucide-react";

import {
  OpdConsultContentPanel,
  OpdConsultFormPanel,
  OpdConsultLayout,
} from "@/features/clinical-opd/components/detail/OpdConsultLayout";
import { OpdEncounterTabEmptyState } from "@/features/clinical-opd/components/detail/OpdEncounterTabEmptyState";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import { OpdVitalSetCard } from "@/features/clinical-opd/components/detail/OpdVitalSetCard";
import {
  useEncounterLabResults,
  useEncounterOrders,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import { labResultGroupToVitalReadings, groupEncounterLabResults } from "@/features/clinical-opd/utils/opd-lab-result-readings";
import { cn } from "@/lib/utils";

type InvestigationNavId = "laboratory" | "radiology";

type OpdInvestigationResultsTabPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  isActive?: boolean;
};

const NAV_ITEMS: Array<{
  id: InvestigationNavId;
  label: string;
  description: string;
  icon: typeof FlaskConical;
}> = [
  {
    id: "laboratory",
    label: "Lab results",
    description: "Released laboratory findings",
    icon: FlaskConical,
  },
  {
    id: "radiology",
    label: "Radiology results",
    description: "Imaging reports and findings",
    icon: ImageIcon,
  },
];

export function OpdInvestigationResultsTabPanel({
  visitUuid,
  encounterUuid,
  isActive = true,
}: OpdInvestigationResultsTabPanelProps) {
  const [activeNav, setActiveNav] = useState<InvestigationNavId>("laboratory");
  const labResults = useEncounterLabResults(visitUuid, encounterUuid, {
    enabled: isActive,
  });
  const orders = useEncounterOrders(visitUuid, encounterUuid, {
    enabled: isActive,
  });

  const labItems = labResults.data ?? [];
  const labGroups = useMemo(
    () => groupEncounterLabResults(labItems),
    [labItems],
  );
  const radiologyOrders = useMemo(
    () =>
      (orders.data ?? []).filter(
        (order) =>
          order.is_active !== false &&
          order.item_type?.toUpperCase() === "RADIOLOGY",
      ),
    [orders.data],
  );
  const referredPendingLabs = useMemo(
    () =>
      (orders.data ?? []).filter(
        (order) =>
          order.is_active !== false &&
          order.item_type?.toUpperCase() === "LABORATORY" &&
          order.status === "REFERRED",
      ),
    [orders.data],
  );

  if (!isActive) return null;
  if (labResults.isLoading || orders.isLoading) {
    return <OpdEncounterTabSkeleton rows={5} />;
  }

  const labCount = labGroups.length;
  const radiologyCount = radiologyOrders.length;

  return (
    <OpdConsultLayout
      historySection="investigations"
      historyAllowedSections={["investigations"]}
      data-testid="opd-investigation-results-layout"
      form={
        <OpdConsultFormPanel title="Investigations">
          <nav
            aria-label="Investigation result types"
            className="space-y-1.5"
            data-testid="opd-investigation-results-nav"
          >
            {NAV_ITEMS.map((item) => {
              const selected = activeNav === item.id;
              const count =
                item.id === "laboratory" ? labCount : radiologyCount;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveNav(item.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                    selected
                      ? "border-brand-primary/30 bg-brand-primary/[0.06] shadow-sm"
                      : "border-transparent bg-dash-canvas/80 hover:border-dash-border/80 hover:bg-white",
                  )}
                  aria-current={selected ? "page" : undefined}
                  data-testid={`opd-investigation-nav-${item.id}`}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                      selected
                        ? "bg-brand-primary/10 text-brand-primary"
                        : "bg-white text-brand-muted",
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-brand-navy">
                        {item.label}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums",
                          selected
                            ? "bg-brand-primary/15 text-brand-primary"
                            : "bg-white text-dash-muted",
                        )}
                      >
                        {count}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-dash-muted">
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        </OpdConsultFormPanel>
      }
      content={
        activeNav === "laboratory" ? (
          <OpdConsultContentPanel
            title="Lab results"
            count={labCount}
            data-testid="opd-investigation-lab-panel"
          >
            {labCount === 0 ? (
              referredPendingLabs.length > 0 ? (
                <ul
                  className="space-y-2"
                  data-testid="opd-investigation-referred-pending"
                >
                  {referredPendingLabs.map((order) => (
                    <li
                      key={order.uuid}
                      className="rounded-xl border border-dash-border/80 bg-white px-4 py-3"
                    >
                      <p className="text-sm font-medium text-brand-navy">
                        {order.description || order.item_type_display}
                      </p>
                      <p className="mt-1 text-xs text-brand-muted">
                        Referred — awaiting results from the receiving laboratory
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <OpdEncounterTabEmptyState
                  icon={FlaskConical}
                  title="No lab results yet"
                  description="Released laboratory results for this visit will appear here."
                />
              )
            ) : (
              <ul
                className="space-y-3"
                data-testid="opd-investigation-lab-results-list"
              >
                {labGroups.map((group) => (
                  <li key={group.key}>
                    <OpdVitalSetCard
                      title={group.title}
                      readings={labResultGroupToVitalReadings(group)}
                      recordedAt={group.releasedAt}
                      releasedByName={group.releasedByName}
                      recordedByName={group.panelCode}
                      data-testid={`opd-investigation-lab-${group.key}`}
                    />
                  </li>
                ))}
                {referredPendingLabs.length > 0 ? (
                  <li>
                    <ul
                      className="space-y-2"
                      data-testid="opd-investigation-referred-pending"
                    >
                      {referredPendingLabs.map((order) => (
                        <li
                          key={order.uuid}
                          className="rounded-xl border border-dashed border-dash-border/80 bg-dash-canvas/50 px-4 py-3"
                        >
                          <p className="text-sm font-medium text-brand-navy">
                            {order.description || order.item_type_display}
                          </p>
                          <p className="mt-1 text-xs text-brand-muted">
                            Referred — awaiting results from the receiving laboratory
                          </p>
                        </li>
                      ))}
                    </ul>
                  </li>
                ) : null}
              </ul>
            )}
          </OpdConsultContentPanel>
        ) : (
          <OpdConsultContentPanel
            title="Radiology results"
            count={radiologyCount}
            data-testid="opd-investigation-radiology-panel"
          >
            {radiologyCount === 0 ? (
              <OpdEncounterTabEmptyState
                icon={ImageIcon}
                title="No radiology results yet"
                description="Imaging reports will appear here when radiology results are released."
              />
            ) : (
              <ul className="space-y-3">
                {radiologyOrders.map((order) => (
                  <li
                    key={order.uuid}
                    className="rounded-xl border border-dash-border/70 bg-white px-4 py-3"
                    data-testid={`opd-investigation-radiology-${order.uuid}`}
                  >
                    <p className="text-sm font-semibold text-brand-navy">
                      {order.description || order.item_type_display}
                    </p>
                    <p className="mt-1 text-xs text-dash-muted">
                      {order.status_display || order.status}
                      {order.ordered_at
                        ? ` · Ordered ${new Date(order.ordered_at).toLocaleString()}`
                        : null}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-dash-muted">
                      Report not available yet. Results will show here once
                      imaging is reported.
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </OpdConsultContentPanel>
        )
      }
    />
  );
}
