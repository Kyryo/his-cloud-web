"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Briefcase } from "lucide-react";

import { TabAddActionButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { AddEmploymentEpisodeDialog } from "@/features/occupational-health/components/AddEmploymentEpisodeDialog";
import type { EmploymentEpisode } from "@/features/occupational-health/types";
import { fetchEmploymentEpisodes } from "@/features/occupational-health/services/oh.service";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import type { Customer } from "@/features/customers/types/customer.types";
import { isModuleEnabled } from "@/features/app-shell/utils/module-entitlements";
import { canAccessOccupationalHealth } from "@/features/occupational-health/utils/oh-access";
import { BffError } from "@/lib/bff-client";
import { useUser } from "@/providers/user-provider";

type CustomerEmploymentEpisodesSectionProps = {
  customer: Customer;
  isActive: boolean;
};

export function CustomerEmploymentEpisodesSection({
  customer,
  isActive,
}: CustomerEmploymentEpisodesSectionProps) {
  const { userData } = useUser();
  const hasOhModule = isModuleEnabled(userData, "OccupationalHealth");
  const hasOhAccess = canAccessOccupationalHealth(userData);
  const [episodes, setEpisodes] = useState<EmploymentEpisode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadEpisodes = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const results = await fetchEmploymentEpisodes(customer.uuid);
      setEpisodes(results);
      setHasLoaded(true);
    } catch (error) {
      setEpisodes([]);
      setLoadError(
        error instanceof BffError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Unable to load employment episodes.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [customer.uuid]);

  useEffect(() => {
    if (isActive && hasOhAccess && !hasLoaded && !loadError) {
      void loadEpisodes();
    }
  }, [hasLoaded, hasOhAccess, isActive, loadEpisodes, loadError]);

  if (!hasOhModule) {
    return (
      <CustomerDetailTabEmptyState
        icon={Briefcase}
        title="Occupational health isn’t enabled"
        description="Ask a platform administrator to enable the Occupational Health module for this workspace."
        data-testid="customer-employment-module-disabled"
      />
    );
  }

  if (!hasOhAccess) {
    return (
      <CustomerDetailTabEmptyState
        icon={Briefcase}
        title="Employment unavailable"
        description="Ask an administrator to add you to the OccupationalHealth group to manage employment episodes."
        data-testid="customer-employment-no-access"
      />
    );
  }

  if (isLoading && !hasLoaded) {
    return <CustomerTabSkeleton />;
  }

  if (loadError && episodes.length === 0) {
    return (
      <div className="space-y-4" data-testid="customer-employment-error">
        <p className="text-sm text-red-700">{loadError}</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setHasLoaded(false);
            setLoadError(null);
            void loadEpisodes();
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <section className="space-y-4" data-testid="customer-employment-section">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-brand-navy">Employment</h2>
          <p className="text-sm text-brand-muted">
            Occupational health employment episodes for this client.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={ROUTES.occupationalHealthEmployment(customer.uuid)}>
              Open OH employment
            </Link>
          </Button>
          <TabAddActionButton onClick={() => setDialogOpen(true)}>
            Add episode
          </TabAddActionButton>
        </div>
      </div>

      {episodes.length === 0 ? (
        <CustomerDetailTabEmptyState
          icon={Briefcase}
          title="No employment episodes yet"
          description="Record an employment episode to track occupational health for this client."
          action={
            <TabAddActionButton onClick={() => setDialogOpen(true)}>
              Add episode
            </TabAddActionButton>
          }
          data-testid="customer-employment-empty"
        />
      ) : (
        <ul className="divide-y rounded-xl border border-brand-border bg-white">
          {episodes.map((episode) => (
            <li key={episode.uuid} className="px-4 py-3 text-sm">
              <div className="font-medium">
                {episode.employee_number || "Employee"} — {episode.start_date}
                {episode.end_date ? ` → ${episode.end_date}` : " (open)"}
              </div>
              <div className="text-brand-muted">
                {episode.site || "No site"}
                {episode.department_name ? ` · ${episode.department_name}` : ""}
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddEmploymentEpisodeDialog
        customer={customer}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={() => void loadEpisodes()}
      />
    </section>
  );
}
