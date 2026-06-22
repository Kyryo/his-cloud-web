"use client";

import { Building2, Plus, RefreshCw, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/constants/routes";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
  ListPageHeaderActions,
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
  ListPageLayout,
  ListPagePagination,
  ListPageStatsSection,
  ListPageTableSection,
  ListPageToolbarActions,
  ListPageToolbarSearch,
  ListPageToolbarSection,
} from "@/features/app-shell/components/page-layout";
import { PlatformAdminStatusBadge } from "@/features/platform-admin/components/PlatformAdminStatusBadge";
import { PlatformAdminStatusDialog } from "@/features/platform-admin/components/PlatformAdminStatusDialog";
import { PlatformAdminTenantDialog } from "@/features/platform-admin/components/PlatformAdminTenantDialog";
import {
  createPlatformAdminTenant,
  fetchPlatformAdminDashboard,
  fetchPlatformAdminTenants,
  updatePlatformAdminTenantStatus,
} from "@/features/platform-admin/services/platform-admin.service";
import type {
  PlatformAdminDashboard,
  PlatformAdminTenant,
  PlatformAdminTenantPayload,
  PlatformAdminTenantStatus,
} from "@/features/platform-admin/types/platform-admin.types";

const PAGE_SIZE = 20;

type ActionStatus = Exclude<PlatformAdminTenantStatus, "PENDING">;

export function PlatformAdminDashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<PlatformAdminDashboard | null>(null);
  const [tenants, setTenants] = useState<PlatformAdminTenant[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusTenant, setStatusTenant] = useState<PlatformAdminTenant | null>(null);
  const [nextStatus, setNextStatus] = useState<ActionStatus | null>(null);

  const listOptions = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: activeSearch,
      status: statusFilter === "all" ? undefined : statusFilter,
      ordering: "name",
    }),
    [activeSearch, page, statusFilter],
  );

  const load = useCallback(async () => {
    setError(null);
    setIsRefreshing(true);
    try {
      const [dashboardData, tenantData] = await Promise.all([
        fetchPlatformAdminDashboard(),
        fetchPlatformAdminTenants(listOptions),
      ]);
      setDashboard(dashboardData);
      setTenants(tenantData.results);
      setTotalCount(tenantData.pagination?.count ?? tenantData.results.length);
      setHasNext(Boolean(tenantData.pagination?.next));
      setHasPrevious(Boolean(tenantData.pagination?.previous));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load tenants.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [listOptions]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreateTenant(payload: PlatformAdminTenantPayload) {
    setIsSaving(true);
    try {
      const tenant = await createPlatformAdminTenant(payload);
      toast.success("Tenant created");
      setCreateOpen(false);
      router.push(ROUTES.platformAdminTenant(tenant.uuid));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to create tenant.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStatusConfirm() {
    if (!statusTenant || !nextStatus) return;
    setIsSaving(true);
    try {
      await updatePlatformAdminTenantStatus(statusTenant.uuid, nextStatus);
      toast.success("Tenant status updated");
      setStatusTenant(null);
      setNextStatus(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update status.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <PageLoader message="Loading platform admin..." />;
  }

  return (
    <ListPageLayout>
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title="Platform admin"
            description="Tenant operations, lifecycle controls, and system health."
          />
          <ListPageHeaderActions>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 size-4" />
              Tenant
            </Button>
          </ListPageHeaderActions>
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>

      <ListPageStatsSection>
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard
            icon={Building2}
            label="Tenants"
            value={dashboard?.total_tenants ?? 0}
            detail={`${dashboard?.active_tenants ?? 0} active`}
          />
          <MetricCard
            icon={Building2}
            label="Suspended"
            value={dashboard?.suspended_tenants ?? 0}
            detail={`${dashboard?.pending_tenants ?? 0} pending`}
          />
          <MetricCard
            icon={Building2}
            label="Structure"
            value={dashboard?.total_locations ?? 0}
            detail={`${dashboard?.total_clinics ?? 0} clinics`}
          />
          <MetricCard
            icon={Users}
            label="Products"
            value={dashboard?.total_products ?? 0}
            detail={`${dashboard?.total_users ?? 0} users`}
          />
        </div>
      </ListPageStatsSection>

      <ListPageToolbarSection>
        <ListPageToolbarSearch>
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-muted" />
            <Input
              className="pl-9"
              value={search}
              placeholder="Search tenants"
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setPage(1);
                  setActiveSearch(search.trim());
                }
              }}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setPage(1);
              setActiveSearch(search.trim());
            }}
          >
            Search
          </Button>
        </ListPageToolbarSearch>
        <ListPageToolbarActions>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setPage(1);
              setStatusFilter(value);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => void load()} disabled={isRefreshing}>
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>
        </ListPageToolbarActions>
      </ListPageToolbarSection>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <ListPageTableSection>
        <ListPageDataTable>
          <ListPageDataTableHeader>
            <ListPageDataTableHeaderRow>
              <ListPageDataTableHeaderCell>Tenant</ListPageDataTableHeaderCell>
              <ListPageDataTableHeaderCell>Status</ListPageDataTableHeaderCell>
              <ListPageDataTableHeaderCell>Country</ListPageDataTableHeaderCell>
              <ListPageDataTableHeaderCell>Clinics</ListPageDataTableHeaderCell>
              <ListPageDataTableHeaderCell>Locations</ListPageDataTableHeaderCell>
              <ListPageDataTableHeaderCell>Products</ListPageDataTableHeaderCell>
              <ListPageDataTableHeaderCell>Users</ListPageDataTableHeaderCell>
              <ListPageDataTableHeaderCell>Actions</ListPageDataTableHeaderCell>
            </ListPageDataTableHeaderRow>
          </ListPageDataTableHeader>
          <ListPageDataTableBody>
            {tenants.map((tenant) => (
              <ListPageDataTableRow
                key={tenant.uuid}
                className="cursor-pointer"
                onClick={() => router.push(ROUTES.platformAdminTenant(tenant.uuid))}
              >
                <ListPageDataTableCell>
                  <div>
                    <p className="font-medium text-brand-navy">{tenant.name}</p>
                    <p className="text-xs text-brand-muted">{tenant.code}</p>
                  </div>
                </ListPageDataTableCell>
                <ListPageDataTableCell>
                  <PlatformAdminStatusBadge
                    status={tenant.status}
                    isActive={tenant.is_active}
                  />
                </ListPageDataTableCell>
                <ListPageDataTableCell>{tenant.country || "Not set"}</ListPageDataTableCell>
                <ListPageDataTableCell>{tenant.clinic_count}</ListPageDataTableCell>
                <ListPageDataTableCell>{tenant.location_count}</ListPageDataTableCell>
                <ListPageDataTableCell>{tenant.product_count}</ListPageDataTableCell>
                <ListPageDataTableCell>{tenant.user_count}</ListPageDataTableCell>
                <ListPageDataTableCell>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(event) => {
                        event.stopPropagation();
                        setStatusTenant(tenant);
                        setNextStatus("ACTIVE");
                      }}
                    >
                      Activate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(event) => {
                        event.stopPropagation();
                        setStatusTenant(tenant);
                        setNextStatus("SUSPENDED");
                      }}
                    >
                      Suspend
                    </Button>
                  </div>
                </ListPageDataTableCell>
              </ListPageDataTableRow>
            ))}
          </ListPageDataTableBody>
        </ListPageDataTable>
      </ListPageTableSection>

      <ListPagePagination
        page={page}
        pageSize={PAGE_SIZE}
        totalCount={totalCount}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        onPageChange={setPage}
      />

      <PlatformAdminTenantDialog
        open={createOpen}
        isSubmitting={isSaving}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateTenant}
      />
      <PlatformAdminStatusDialog
        tenant={statusTenant}
        status={nextStatus}
        isSubmitting={isSaving}
        onOpenChange={(open) => {
          if (!open) {
            setStatusTenant(null);
            setNextStatus(null);
          }
        }}
        onConfirm={handleStatusConfirm}
      />
    </ListPageLayout>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Building2;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <Card className="rounded-lg">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-10 items-center justify-center rounded-md bg-brand-tint text-brand-primary">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-brand-muted">{label}</p>
          <p className="text-2xl font-semibold text-brand-navy">{value}</p>
          <p className="text-xs text-brand-muted">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}
