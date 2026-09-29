"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
  ListPageLayout,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import {
  createPlatformAdminPayerPolicy,
  fetchPlatformAdminPayerPolicies,
  fetchPlatformAdminPayerRegistry,
  reviewPlatformAdminPayerRegistry,
  updatePlatformAdminPayerPolicy,
} from "@/features/platform-admin/services/platform-admin.service";
import type {
  CountryPayer,
  CountryPayerPolicy,
} from "@/features/settings/types/settings.types";
import { useToast } from "@/providers/toast-provider";

export function PlatformAdminPayerRegistryPage() {
  const { toast } = useToast();
  const [payers, setPayers] = useState<CountryPayer[]>([]);
  const [policies, setPolicies] = useState<CountryPayerPolicy[]>([]);
  const [statusFilter, setStatusFilter] = useState("pending_approval");
  const [isLoading, setIsLoading] = useState(false);
  const [newPolicyCountry, setNewPolicyCountry] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      try {
        const [registry, policyResponse] = await Promise.all([
          fetchPlatformAdminPayerRegistry({
            pageSize: 100,
            status: statusFilter || undefined,
            ordering: "country_code,display_name",
          }),
          fetchPlatformAdminPayerPolicies(),
        ]);
        if (!active) {
          return;
        }
        setPayers(registry.results);
        setPolicies(policyResponse.results);
      } catch (error) {
        if (!active) {
          return;
        }
        toast({
          variant: "error",
          title: "Unable to load payer registry",
          description:
            error instanceof Error ? error.message : "Something went wrong.",
        });
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [reloadToken, statusFilter, toast]);

  async function handleReview(payer: CountryPayer, approve: boolean) {
    try {
      await reviewPlatformAdminPayerRegistry(payer.uuid, {
        approve,
        review_note: approve ? "Approved by platform admin." : "Rejected.",
      });
      toast({
        variant: "success",
        title: approve ? "Payer approved" : "Payer rejected",
        description: `${payer.display_name} (${payer.country_code})`,
      });
      reload();
    } catch (error) {
      toast({
        variant: "error",
        title: "Review failed",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  async function handleTogglePolicy(policy: CountryPayerPolicy) {
    try {
      await updatePlatformAdminPayerPolicy(policy.uuid, {
        requires_admin_approval: !policy.requires_admin_approval,
      });
      toast({
        variant: "success",
        title: "Policy updated",
        description: `${policy.country_code}: approval ${
          policy.requires_admin_approval ? "disabled" : "required"
        }`,
      });
      reload();
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update policy",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  async function handleCreatePolicy() {
    const country = newPolicyCountry.trim().toUpperCase();
    if (country.length !== 2) {
      toast({
        variant: "error",
        title: "Invalid country code",
        description: "Use a 2-letter ISO country code (e.g. MW).",
      });
      return;
    }
    try {
      await createPlatformAdminPayerPolicy({
        country_code: country,
        requires_admin_approval: true,
      });
      setNewPolicyCountry("");
      toast({
        variant: "success",
        title: "Policy created",
        description: `${country} now requires admin approval for new payers.`,
      });
      reload();
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not create policy",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  return (
    <ListPageLayout data-testid="platform-admin-payer-registry">
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title="Payer registry"
            description="Approve country-level payers and configure whether new payers require platform approval per country."
          />
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>

      <ListPageTableSection>
        <section className="mb-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-brand-navy">
              Registry payers
            </h2>
            <select
              className="h-9 rounded-lg border border-brand-border bg-white px-3 text-sm"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
            >
              <option value="pending_approval">Pending approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="retired">Retired</option>
              <option value="">All statuses</option>
            </select>
          </div>

          {isLoading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : payers.length === 0 ? (
            <p className="text-sm text-slate-400">No payers for this filter.</p>
          ) : (
            <ul className="divide-y divide-brand-border rounded-lg border border-brand-border bg-white">
              {payers.map((payer) => (
                <li
                  key={payer.uuid}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-navy">
                      {payer.display_name}{" "}
                      <span className="font-normal text-slate-400">
                        ({payer.country_code}/{payer.code})
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {payer.official_name}
                      {payer.needs_review ? " · Needs review" : ""}
                      {payer.integration_code
                        ? ` · Integration: ${payer.integration_code}`
                        : ""}
                    </p>
                  </div>
                  {payer.status === "pending_approval" ? (
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void handleReview(payer, true)}
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => void handleReview(payer, false)}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs uppercase tracking-wide text-slate-400">
                      {payer.status.replaceAll("_", " ")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-brand-navy">
            Country approval policies
          </h2>
          <p className="text-sm text-slate-400">
            When approval is required, tenant-proposed registry payers stay
            pending until a platform admin approves them. Malawi (MW) is seeded
            with approval required.
          </p>

          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <label
                htmlFor="new-policy-country"
                className="text-xs text-slate-500"
              >
                Add country policy
              </label>
              <Input
                id="new-policy-country"
                value={newPolicyCountry}
                onChange={(event) => setNewPolicyCountry(event.target.value)}
                placeholder="e.g. ZA"
                className="w-28 uppercase"
                maxLength={2}
              />
            </div>
            <Button type="button" size="sm" onClick={() => void handleCreatePolicy()}>
              Require approval
            </Button>
          </div>

          {policies.length === 0 ? (
            <p className="text-sm text-slate-400">No policies yet.</p>
          ) : (
            <ul className="divide-y divide-brand-border rounded-lg border border-brand-border bg-white">
              {policies.map((policy) => (
                <li
                  key={policy.uuid}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-brand-navy">
                      {policy.country_code}
                    </p>
                    <p className="text-xs text-slate-400">
                      {policy.requires_admin_approval
                        ? "New payers require platform approval"
                        : "Tenants can create registry payers immediately"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void handleTogglePolicy(policy)}
                  >
                    {policy.requires_admin_approval
                      ? "Allow open create"
                      : "Require approval"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </ListPageTableSection>
    </ListPageLayout>
  );
}
