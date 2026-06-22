"use client";

import { ArrowLeft, Edit, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import {
  DetailPageHeaderSection,
  DetailPageLayout,
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import { PlatformAdminStatusBadge } from "@/features/platform-admin/components/PlatformAdminStatusBadge";
import { PlatformAdminStatusDialog } from "@/features/platform-admin/components/PlatformAdminStatusDialog";
import { PlatformAdminTenantDialog } from "@/features/platform-admin/components/PlatformAdminTenantDialog";
import {
  fetchPlatformAdminTenant,
  fetchPlatformAdminTenantAuditEvents,
  fetchPlatformAdminTenantClinics,
  fetchPlatformAdminTenantConfiguration,
  fetchPlatformAdminTenantDepartments,
  fetchPlatformAdminTenantLocations,
  fetchPlatformAdminTenantUsers,
  updatePlatformAdminTenant,
  updatePlatformAdminTenantStatus,
} from "@/features/platform-admin/services/platform-admin.service";
import type {
  PlatformAdminAuditEvent,
  PlatformAdminClinic,
  PlatformAdminDepartment,
  PlatformAdminLocation,
  PlatformAdminTenant,
  PlatformAdminTenantConfiguration,
  PlatformAdminTenantPayload,
  PlatformAdminTenantStatus,
  PlatformAdminUser,
} from "@/features/platform-admin/types/platform-admin.types";
import { cn } from "@/lib/utils";

type TenantDetailTab = "profile" | "structure" | "users" | "configuration" | "audit";
type ActionStatus = Exclude<PlatformAdminTenantStatus, "PENDING">;

export function PlatformAdminTenantDetailPage({
  tenantUuid,
}: {
  tenantUuid: string;
}) {
  const router = useRouter();
  const [tenant, setTenant] = useState<PlatformAdminTenant | null>(null);
  const [clinics, setClinics] = useState<PlatformAdminClinic[]>([]);
  const [departments, setDepartments] = useState<PlatformAdminDepartment[]>([]);
  const [locations, setLocations] = useState<PlatformAdminLocation[]>([]);
  const [users, setUsers] = useState<PlatformAdminUser[]>([]);
  const [configuration, setConfiguration] =
    useState<PlatformAdminTenantConfiguration | null>(null);
  const [auditEvents, setAuditEvents] = useState<PlatformAdminAuditEvent[]>([]);
  const [activeTab, setActiveTab] = useState<TenantDetailTab>("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<ActionStatus | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setIsRefreshing(true);
    try {
      const [
        tenantData,
        clinicsData,
        departmentsData,
        locationsData,
        usersData,
        configurationData,
        auditData,
      ] = await Promise.all([
        fetchPlatformAdminTenant(tenantUuid),
        fetchPlatformAdminTenantClinics(tenantUuid),
        fetchPlatformAdminTenantDepartments(tenantUuid),
        fetchPlatformAdminTenantLocations(tenantUuid),
        fetchPlatformAdminTenantUsers(tenantUuid),
        fetchPlatformAdminTenantConfiguration(tenantUuid),
        fetchPlatformAdminTenantAuditEvents(tenantUuid),
      ]);
      setTenant(tenantData);
      setClinics(clinicsData.results);
      setDepartments(departmentsData.results);
      setLocations(locationsData.results);
      setUsers(usersData.results);
      setConfiguration(configurationData);
      setAuditEvents(auditData.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load tenant.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [tenantUuid]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleUpdateTenant(payload: PlatformAdminTenantPayload) {
    setIsSaving(true);
    try {
      const updated = await updatePlatformAdminTenant(tenantUuid, payload);
      setTenant(updated);
      setEditOpen(false);
      toast.success("Tenant updated");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update tenant.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStatusConfirm() {
    if (!nextStatus) return;
    setIsSaving(true);
    try {
      const updated = await updatePlatformAdminTenantStatus(tenantUuid, nextStatus);
      setTenant(updated);
      setNextStatus(null);
      toast.success("Tenant status updated");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update status.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <PageLoader message="Loading tenant..." />;
  }

  if (!tenant) {
    return (
      <div className="mx-auto w-full px-4 py-8 md:px-6">
        <p className="text-sm text-red-600">{error ?? "Tenant was not found."}</p>
      </div>
    );
  }

  return (
    <DetailPageLayout className="mx-0 px-4 py-6 md:px-6">
      <DetailPageHeaderSection>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Button
              variant="ghost"
              className="px-0"
              onClick={() => router.push(ROUTES.platformAdmin)}
            >
              <ArrowLeft className="mr-2 size-4" />
              Tenants
            </Button>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-extrabold text-brand-navy">
                  {tenant.name}
                </h1>
                <PlatformAdminStatusBadge
                  status={tenant.status}
                  isActive={tenant.is_active}
                />
              </div>
              <p className="mt-1 text-sm text-brand-muted">
                {tenant.code} · {tenant.country || "Country not set"} ·{" "}
                {tenant.email || "Email not set"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void load()} disabled={isRefreshing}>
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Edit className="mr-2 size-4" />
              Edit
            </Button>
            <Button variant="outline" onClick={() => setNextStatus("ACTIVE")}>
              Activate
            </Button>
            <Button variant="outline" onClick={() => setNextStatus("SUSPENDED")}>
              Suspend
            </Button>
          </div>
        </div>
      </DetailPageHeaderSection>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-brand-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium",
              activeTab === tab.id
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-brand-muted hover:text-brand-navy",
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === "profile" ? <ProfileTab tenant={tenant} /> : null}
        {activeTab === "structure" ? (
          <StructureTab
            clinics={clinics}
            departments={departments}
            locations={locations}
          />
        ) : null}
        {activeTab === "users" ? <UsersTab users={users} /> : null}
        {activeTab === "configuration" ? (
          <ConfigurationTab configuration={configuration} />
        ) : null}
        {activeTab === "audit" ? <AuditTab events={auditEvents} /> : null}
      </div>

      <PlatformAdminTenantDialog
        open={editOpen}
        tenant={tenant}
        isSubmitting={isSaving}
        onOpenChange={setEditOpen}
        onSubmit={handleUpdateTenant}
      />
      <PlatformAdminStatusDialog
        tenant={tenant}
        status={nextStatus}
        isSubmitting={isSaving}
        onOpenChange={(open) => {
          if (!open) setNextStatus(null);
        }}
        onConfirm={handleStatusConfirm}
      />
    </DetailPageLayout>
  );
}

const TABS: Array<{ id: TenantDetailTab; label: string }> = [
  { id: "profile", label: "Profile" },
  { id: "structure", label: "Structure" },
  { id: "users", label: "Users" },
  { id: "configuration", label: "Configuration" },
  { id: "audit", label: "Audit" },
];

function ProfileTab({ tenant }: { tenant: PlatformAdminTenant }) {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <SummaryCard label="Clinics" value={tenant.clinic_count} />
      <SummaryCard label="Locations" value={tenant.location_count} />
      <SummaryCard label="Products" value={tenant.product_count} />
      <SummaryCard label="Users" value={tenant.user_count} />
      <SummaryCard label="Active users" value={tenant.active_user_count} />
      <Card className="rounded-lg lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-base">Tenant profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-3">
          <Field label="Email" value={tenant.email} />
          <Field label="Phone" value={tenant.phone} />
          <Field label="Currency" value={tenant.currency_code} />
          <Field label="Address" value={tenant.full_address || tenant.address} />
          <Field label="Created" value={formatDate(tenant.created_at)} />
          <Field label="Updated" value={formatDate(tenant.updated_at)} />
        </CardContent>
      </Card>
    </div>
  );
}

function StructureTab({
  clinics,
  departments,
  locations,
}: {
  clinics: PlatformAdminClinic[];
  departments: PlatformAdminDepartment[];
  locations: PlatformAdminLocation[];
}) {
  return (
    <div className="space-y-6">
      <SimpleTable
        title="Clinics"
        columns={["Name", "Code", "Status", "Locations"]}
        rows={clinics.map((clinic) => [
          clinic.name,
          clinic.code,
          clinic.status,
          String(clinic.location_count),
        ])}
      />
      <SimpleTable
        title="Departments"
        columns={["Name", "Code", "Clinic", "Type", "Status"]}
        rows={departments.map((department) => [
          department.name,
          department.code,
          department.clinic_name,
          department.department_type,
          department.status,
        ])}
      />
      <SimpleTable
        title="Locations"
        columns={["Name", "Code", "Clinic", "Department", "Status"]}
        rows={locations.map((location) => [
          location.name,
          location.code,
          location.clinic_name,
          location.department_name,
          location.status,
        ])}
      />
    </div>
  );
}

function UsersTab({ users }: { users: PlatformAdminUser[] }) {
  return (
    <SimpleTable
      title="Tenant users"
      columns={["Name", "Email", "Role", "Admin", "Last login"]}
      rows={users.map((user) => [
        user.name,
        user.email,
        user.user_role || "Unassigned",
        user.is_admin ? "Yes" : "No",
        `${user.is_active ? "Active" : "Inactive"} - ${user.last_login_display}`,
      ])}
    />
  );
}

function ConfigurationTab({
  configuration,
}: {
  configuration: PlatformAdminTenantConfiguration | null;
}) {
  if (!configuration) return <p className="text-sm text-brand-muted">No data.</p>;
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="text-base">Configuration</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm md:grid-cols-3">
        <Field label="Currency" value={configuration.currency_code} />
        <Field label="Identifier prefix" value={configuration.customer_identifier_prefix} />
        <Field label="Identifier digits" value={configuration.customer_identifier_digits} />
        <Field label="Logo URL" value={configuration.branding_logo_url} />
        <Field label="Primary color" value={configuration.branding_primary_color} />
        <Field label="Dental notes" value={configuration.allow_dental_group_clinical_notes ? "Enabled" : "Disabled"} />
      </CardContent>
    </Card>
  );
}

function AuditTab({ events }: { events: PlatformAdminAuditEvent[] }) {
  return (
    <SimpleTable
      title="Audit events"
      columns={["Time", "Action", "Actor", "Status", "Request"]}
      rows={events.map((event) => [
        formatDate(event.created_at),
        event.action,
        event.actor_email || "System",
        event.status,
        event.request_id || "None",
      ])}
    />
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="rounded-lg">
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase text-brand-muted">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-brand-navy">{value}</p>
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-brand-muted">{label}</p>
      <p className="mt-1 break-words text-brand-navy">{value || "Not set"}</p>
    </div>
  );
}

function SimpleTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-brand-navy">{title}</h2>
      <ListPageDataTable>
        <ListPageDataTableHeader>
          <ListPageDataTableHeaderRow>
            {columns.map((column) => (
              <ListPageDataTableHeaderCell key={column}>
                {column}
              </ListPageDataTableHeaderCell>
            ))}
          </ListPageDataTableHeaderRow>
        </ListPageDataTableHeader>
        <ListPageDataTableBody>
          {rows.length > 0 ? (
            rows.map((row, rowIndex) => (
              <ListPageDataTableRow key={`${title}-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <ListPageDataTableCell key={`${title}-${rowIndex}-${cellIndex}`}>
                    {cell || "Not set"}
                  </ListPageDataTableCell>
                ))}
              </ListPageDataTableRow>
            ))
          ) : (
            <ListPageDataTableRow>
              <ListPageDataTableCell colSpan={columns.length}>
                <span className="text-sm text-brand-muted">No records found.</span>
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          )}
        </ListPageDataTableBody>
      </ListPageDataTable>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
