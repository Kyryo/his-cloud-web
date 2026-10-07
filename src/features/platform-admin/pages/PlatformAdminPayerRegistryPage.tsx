"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ListPagePagination } from "@/features/app-shell/components/page-layout";
import { AddRegistryCountryDialog } from "@/features/platform-admin/components/AddRegistryCountryDialog";
import { AddRegistryPayerDialog } from "@/features/platform-admin/components/AddRegistryPayerDialog";
import { RegistryPayerDialog } from "@/features/platform-admin/components/RegistryPayerDialog";
import {
  AddRegistrySchemeDialog,
  EditRegistrySchemeDialog,
  RegistrySchemeActivityDialog,
} from "@/features/platform-admin/components/RegistrySchemeDialogs";
import {
  fetchPlatformAdminPayerPolicies,
  fetchPlatformAdminPayerRegistry,
  fetchPlatformAdminPayerSchemeCatalog,
  reviewPlatformAdminPayerRegistry,
  updatePlatformAdminPayerPolicy,
} from "@/features/platform-admin/services/platform-admin.service";
import { SettingsUnderlineTabs } from "@/features/settings/components/SettingsPageLayout";
import type {
  CountryPayer,
  CountryPayerPolicy,
  RegistryPayerSchemeCatalogItem,
} from "@/features/settings/types/settings.types";
import { useToast } from "@/providers/toast-provider";

type RegistryTab = "countries" | "payers" | "schemes" | "approvals";

const TABS: Array<{ id: RegistryTab; label: string }> = [
  { id: "countries", label: "Countries" },
  { id: "payers", label: "Payers" },
  { id: "schemes", label: "Schemes" },
  { id: "approvals", label: "Approvals" },
];

const PAGE_SIZE = 8;

const PAYER_STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "approved", label: "Approved" },
  { id: "pending_approval", label: "Pending" },
  { id: "rejected", label: "Rejected" },
  { id: "retired", label: "Retired" },
] as const;

function countryLabel(code: string) {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function RegistryRows({
  isLoading,
  empty,
  children,
}: {
  isLoading: boolean;
  empty: string;
  children: ReactNode;
}) {
  if (isLoading) {
    return <p className="py-6 text-sm text-slate-400">Loading…</p>;
  }
  if (!children) {
    return <p className="text-sm text-slate-400">{empty}</p>;
  }
  return <div className="divide-y divide-brand-border">{children}</div>;
}

function Row({
  title,
  meta,
  actions,
  onOpen,
}: {
  title: string;
  meta: string;
  actions?: ReactNode;
  onOpen?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      {onOpen ? (
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-medium text-brand-navy">{title}</p>
          <p className="mt-0.5 text-sm text-slate-400">{meta}</p>
        </button>
      ) : (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-brand-navy">{title}</p>
          <p className="mt-0.5 text-sm text-slate-400">{meta}</p>
        </div>
      )}
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

function CountriesTab() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [policies, setPolicies] = useState<CountryPayerPolicy[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    void fetchPlatformAdminPayerPolicies({ page, pageSize: PAGE_SIZE })
      .then((response) => {
        if (!active) return;
        setPolicies(response.results);
        setTotalCount(response.pagination?.count ?? response.results.length);
        setHasNext(Boolean(response.pagination?.next));
        setHasPrevious(Boolean(response.pagination?.previous));
      })
      .catch((error: unknown) => {
        if (!active) return;
        toast({
          variant: "error",
          title: "Unable to load countries",
          description: error instanceof Error ? error.message : "Something went wrong.",
        });
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, reloadToken, toast]);

  async function handleToggle(policy: CountryPayerPolicy) {
    try {
      await updatePlatformAdminPayerPolicy(policy.uuid, {
        requires_admin_approval: !policy.requires_admin_approval,
      });
      setReloadToken((current) => current + 1);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update country",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-xl text-sm text-slate-400">
          Countries in the payer registry. Those with an approved payer are listed first.
        </p>
        <Button type="button" size="sm" className="shrink-0" onClick={() => setAddOpen(true)}>
          Add country
        </Button>
      </div>
      <RegistryRows isLoading={isLoading} empty="No countries yet.">
        {policies.length === 0 && !isLoading
          ? null
          : policies.map((policy) => (
              <Row
                key={policy.uuid}
                title={`${countryLabel(policy.country_code)} (${policy.country_code})`}
                meta={
                  policy.has_approved_payer
                    ? policy.requires_admin_approval
                      ? "Approved payers · new payers need approval"
                      : "Approved payers · clinics can add payers immediately"
                    : policy.requires_admin_approval
                      ? "No approved payers yet · new payers need approval"
                      : "No approved payers yet · clinics can add payers immediately"
                }
                actions={
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void handleToggle(policy)}
                  >
                    {policy.requires_admin_approval ? "Allow open create" : "Require approval"}
                  </Button>
                }
              />
            ))}
      </RegistryRows>
      <ListPagePagination
        page={page}
        pageSize={PAGE_SIZE}
        totalCount={totalCount}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        isLoading={isLoading}
        onPageChange={setPage}
      />
      <AddRegistryCountryDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={() => {
          setPage(1);
          setReloadToken((current) => current + 1);
        }}
      />
    </div>
  );
}

function PayerList({
  status,
  empty,
  showReview,
  refreshKey,
  onOpen,
  onReviewed,
}: {
  status?: string;
  empty: string;
  showReview?: boolean;
  refreshKey: number;
  onOpen: (payer: CountryPayer) => void;
  onReviewed: (payer: CountryPayer) => void;
}) {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [payers, setPayers] = useState<CountryPayer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(status ?? "all");

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    void fetchPlatformAdminPayerRegistry({
      page,
      pageSize: PAGE_SIZE,
      status: statusFilter === "all" ? undefined : statusFilter,
      ordering: "country_code,display_name",
    })
      .then((response) => {
        if (!active) return;
        setPayers(response.results);
        setTotalCount(response.pagination?.count ?? response.results.length);
        setHasNext(Boolean(response.pagination?.next));
        setHasPrevious(Boolean(response.pagination?.previous));
      })
      .catch((error: unknown) => {
        if (!active) return;
        toast({
          variant: "error",
          title: "Unable to load payers",
          description: error instanceof Error ? error.message : "Something went wrong.",
        });
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, refreshKey, status, statusFilter, toast]);

  async function handleReview(payer: CountryPayer, approve: boolean) {
    try {
      const updated = await reviewPlatformAdminPayerRegistry(payer.uuid, {
        approve,
        review_note: approve ? "Approved by platform admin." : "Rejected.",
      });
      toast({
        variant: "success",
        title: approve ? "Payer approved" : "Payer rejected",
        description: `${payer.display_name} (${payer.country_code})`,
      });
      onReviewed(updated);
    } catch (error) {
      toast({
        variant: "error",
        title: "Review failed",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  return (
    <div className="space-y-6">
      {status ? null : (
        <div className="flex flex-wrap gap-4">
          {PAYER_STATUS_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => {
                setStatusFilter(filter.id);
                setPage(1);
              }}
              className={
                statusFilter === filter.id
                  ? "text-sm font-medium text-brand-navy"
                  : "text-sm text-slate-400 hover:text-brand-navy"
              }
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}
      <RegistryRows isLoading={isLoading} empty={empty}>
        {payers.length === 0 && !isLoading
          ? null
          : payers.map((payer) => {
              const schemeCount = payer.schemes?.length ?? 0;
              const capabilityCount = payer.capabilities?.length ?? 0;
              return (
                <Row
                  key={payer.uuid}
                  title={payer.display_name}
                  onOpen={() => onOpen(payer)}
                  meta={[
                    `${countryLabel(payer.country_code)} · ${payer.code}`,
                    status ? null : statusLabel(payer.status),
                    schemeCount === 0 ? "No schemes" : `${schemeCount} ${schemeCount === 1 ? "scheme" : "schemes"}`,
                    capabilityCount === 0
                      ? "No capabilities"
                      : `${capabilityCount} ${capabilityCount === 1 ? "capability" : "capabilities"}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  actions={
                    showReview && payer.status === "pending_approval" ? (
                      <>
                        <Button type="button" size="sm" onClick={() => void handleReview(payer, true)}>
                          Approve
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => void handleReview(payer, false)}
                        >
                          Reject
                        </Button>
                      </>
                    ) : null
                  }
                />
              );
            })}
      </RegistryRows>
      <ListPagePagination
        page={page}
        pageSize={PAGE_SIZE}
        totalCount={totalCount}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        isLoading={isLoading}
        onPageChange={setPage}
      />
    </div>
  );
}

function SchemesTab({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => void }) {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [schemes, setSchemes] = useState<RegistryPayerSchemeCatalogItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<RegistryPayerSchemeCatalogItem | null>(null);
  const [activityScheme, setActivityScheme] = useState<RegistryPayerSchemeCatalogItem | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    void fetchPlatformAdminPayerSchemeCatalog({ page, pageSize: PAGE_SIZE })
      .then((response) => {
        if (!active) return;
        setSchemes(response.results);
        setTotalCount(response.pagination?.count ?? response.results.length);
        setHasNext(Boolean(response.pagination?.next));
        setHasPrevious(Boolean(response.pagination?.previous));
      })
      .catch((error: unknown) => {
        if (!active) return;
        toast({
          variant: "error",
          title: "Unable to load schemes",
          description: error instanceof Error ? error.message : "Something went wrong.",
        });
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, refreshKey, toast]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-xl text-sm text-slate-400">
          Schemes belong to a registry payer. A payer can have none, one, or several.
        </p>
        <Button type="button" size="sm" className="shrink-0" onClick={() => setAddOpen(true)}>
          Add scheme
        </Button>
      </div>
      <RegistryRows isLoading={isLoading} empty="No schemes yet.">
        {schemes.length === 0 && !isLoading
          ? null
          : schemes.map((scheme) => (
              <Row
                key={scheme.uuid}
                title={scheme.name}
                meta={`${scheme.payer_name} · ${countryLabel(scheme.country_code)} · ${scheme.code}${scheme.is_active ? "" : " · Inactive"}`}
                actions={
                  <>
                    <Button type="button" size="sm" variant="outline" onClick={() => setEditing(scheme)}>
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setActivityScheme(scheme)}
                    >
                      {scheme.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </>
                }
              />
            ))}
      </RegistryRows>
      <ListPagePagination
        page={page}
        pageSize={PAGE_SIZE}
        totalCount={totalCount}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        isLoading={isLoading}
        onPageChange={setPage}
      />
      <AddRegistrySchemeDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={() => {
          setPage(1);
          onChanged();
        }}
      />
      <EditRegistrySchemeDialog
        scheme={editing}
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onSaved={onChanged}
      />
      <RegistrySchemeActivityDialog
        scheme={activityScheme}
        open={activityScheme !== null}
        onOpenChange={(open) => {
          if (!open) setActivityScheme(null);
        }}
        onSaved={onChanged}
      />
    </div>
  );
}

export function PlatformAdminPayerRegistryPage() {
  const [activeTab, setActiveTab] = useState<RegistryTab>("countries");
  const [selectedPayer, setSelectedPayer] = useState<CountryPayer | null>(null);
  const [payerOpen, setPayerOpen] = useState(false);
  const [addPayerOpen, setAddPayerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function openPayer(payer: CountryPayer) {
    setSelectedPayer(payer);
    setPayerOpen(true);
  }

  function handlePayerUpdated(payer: CountryPayer) {
    setSelectedPayer(payer);
    setRefreshKey((current) => current + 1);
  }

  return (
    <div
      className="absolute inset-0 flex w-full flex-col overflow-hidden"
      data-testid="platform-admin-payer-registry"
    >
      <header className="shrink-0 border-b border-brand-border px-5 py-4 md:px-8">
        <Breadcrumb>
          <BreadcrumbList className="text-[13px] text-slate-400 sm:gap-1.5">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/platform-admin" className="font-semibold text-brand-navy hover:text-brand-navy">
                  Platform admin
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-slate-300 [&>svg]:hidden">
              <span aria-hidden="true">&gt;</span>
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-normal text-slate-400">
                Payer registry
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-12 pt-6 md:px-10 lg:px-14 lg:pt-8">
        <div className="max-w-3xl">
          <SettingsUnderlineTabs
            tabs={TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
            ariaLabel="Payer registry sections"
          />
          <div className="pt-8">
            {activeTab === "countries" ? <CountriesTab /> : null}
            {activeTab === "payers" ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <p className="max-w-xl text-sm text-slate-400">
                    Canonical payers clinics can link to for claims, benefits, and member lookup.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setAddPayerOpen(true)}
                  >
                    Add payer
                  </Button>
                </div>
                <PayerList
                  empty="No payers match this filter."
                  refreshKey={refreshKey}
                  onOpen={openPayer}
                  onReviewed={handlePayerUpdated}
                />
              </div>
            ) : null}
            {activeTab === "schemes" ? (
              <SchemesTab refreshKey={refreshKey} onChanged={() => setRefreshKey((current) => current + 1)} />
            ) : null}
            {activeTab === "approvals" ? (
              <div className="space-y-6">
                <p className="max-w-xl text-sm text-slate-400">
                  Registry payers waiting for a platform decision.
                </p>
                <PayerList
                  status="pending_approval"
                  empty="Nothing is waiting for approval."
                  showReview
                  refreshKey={refreshKey}
                  onOpen={openPayer}
                  onReviewed={handlePayerUpdated}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <AddRegistryPayerDialog
        open={addPayerOpen}
        onOpenChange={setAddPayerOpen}
        onCreated={() => setRefreshKey((current) => current + 1)}
      />
      <RegistryPayerDialog
        payer={selectedPayer}
        open={payerOpen}
        onOpenChange={setPayerOpen}
        onUpdated={handlePayerUpdated}
      />
    </div>
  );
}
