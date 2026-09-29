"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ListPageHeaderActions,
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
  ListPageLayout,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { OhAccessDenied } from "@/features/occupational-health/components/OhAccessDenied";
import { useOhComplianceDashboard } from "@/features/occupational-health/hooks/use-occupational-health";
import { downloadOhComplianceExtract } from "@/features/occupational-health/services/oh.service";
import { useUser } from "@/providers/user-provider";
import { useToast } from "@/providers/toast-provider";

const METRIC_LABELS: Record<string, string> = {
  due: "Due",
  overdue: "Overdue",
  completed: "Completed",
  waived: "Waived",
  open_episodes: "Open employment episodes",
  due_within_30_days: "Due within 30 days",
  fitness_validity_alerts: "Fitness validity alerts",
};

export function OhCompliancePage() {
  const { userData, isLoading: isUserLoading } = useUser();
  const { toast } = useToast();
  const { data, isLoading, error, refetch, isFetching } =
    useOhComplianceDashboard();
  const [isExtracting, setIsExtracting] = useState(false);

  const hasAccess = (userData?.groups ?? []).includes("OccupationalHealth");

  async function handleExtract() {
    setIsExtracting(true);
    try {
      const { blob, filename } = await downloadOhComplianceExtract();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      toast({ title: "Compliance CSV downloaded" });
    } catch (extractError) {
      toast({
        title: "Extract failed",
        description:
          extractError instanceof Error ? extractError.message : undefined,
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  }

  if (isUserLoading) {
    return (
      <ListPageLayout data-testid="oh-compliance-page">
        <div className="p-8 text-sm text-brand-muted">Loading compliance…</div>
      </ListPageLayout>
    );
  }

  if (!hasAccess) {
    return (
      <OhAccessDenied
        data-testid="oh-compliance-page"
        description="Occupational health compliance is limited to users in the OccupationalHealth group. Ask an administrator to grant access for this workspace."
      />
    );
  }

  return (
    <ListPageLayout data-testid="oh-compliance-page">
      <ListPageHeaderSection className="border-b border-brand-border bg-white px-4 py-5 md:px-6">
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title="OH compliance"
            description="Surveillance requirement counts for your organization."
          />
          <ListPageHeaderActions>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg border-dash-border text-xs text-brand-slate"
              disabled={isFetching}
              onClick={() => void refetch()}
            >
              <RefreshCw className="size-3.5" />
              Refresh
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => void handleExtract()}
              disabled={isExtracting}
            >
              {isExtracting ? "Exporting…" : "Download extract"}
            </Button>
          </ListPageHeaderActions>
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>

      <ListPageTableSection>
        {isLoading ? (
          <p className="text-sm text-brand-muted">Loading compliance…</p>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-sm font-semibold text-red-800">
              Could not load compliance dashboard
            </h2>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => void refetch()}
            >
              Try again
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(data ?? {}).map(([key, value]) => (
              <div
                key={key}
                className="rounded-xl border border-dash-border bg-white p-4"
                data-testid={`oh-compliance-metric-${key}`}
              >
                <p className="text-sm text-brand-muted">
                  {METRIC_LABELS[key] ?? key.replace(/_/g, " ")}
                </p>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-brand-navy">
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}
      </ListPageTableSection>
    </ListPageLayout>
  );
}
