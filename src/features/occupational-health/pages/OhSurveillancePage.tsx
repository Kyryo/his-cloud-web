"use client";

import Link from "next/link";
import { CalendarPlus, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { CreateAppointmentDialog } from "@/features/appointments/components/CreateAppointmentDialog";
import { OpdEncounterStatusBadge } from "@/features/clinical-opd/components/OpdEncounterStatusBadge";
import type { Customer } from "@/features/customers/types/customer.types";
import { OhAccessDenied } from "@/features/occupational-health/components/OhAccessDenied";
import {
  useOhCampaignQueue,
  useOhFitnessValidityAlerts,
  useOhSurveillanceRequirements,
} from "@/features/occupational-health/hooks/use-occupational-health";
import { ROUTES } from "@/constants/routes";
import { useUser } from "@/providers/user-provider";

function customerStubFromRow(row: {
  customer_uuid: string;
  customer_name: string;
  customer_identifier: string;
}): Customer {
  const parts = row.customer_name.trim().split(/\s+/);
  const firstName = parts[0] ?? row.customer_name;
  const lastName = parts.slice(1).join(" ") || firstName;
  return {
    id: 0,
    uuid: row.customer_uuid,
    tenant: 0,
    first_name: firstName,
    middle_name: null,
    last_name: lastName,
    full_name: row.customer_name,
    customer_identifier: row.customer_identifier,
    internal_reference: "",
    phone_number: null,
    email: null,
    patient_uuid: "",
    gender: "Other",
    dob: "",
    dob_is_estimated: false,
    age: 0,
    has_synced_to_openmrs: false,
    is_active: true,
    visit_status: "not_started",
    created_at: "",
    updated_at: "",
    created_by: null,
  } as Customer;
}

export function OhSurveillancePage() {
  const { userData, isLoading: isUserLoading } = useUser();
  const [site, setSite] = useState("");
  const [department, setDepartment] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    site: "",
    department: "",
  });
  const [scheduleCustomer, setScheduleCustomer] = useState<Customer | null>(null);

  const requirementsQuery = useOhSurveillanceRequirements({
    status: "due_or_overdue",
    site: appliedFilters.site || undefined,
    department: appliedFilters.department || undefined,
  });
  const campaignQuery = useOhCampaignQueue();
  const fitnessAlertsQuery = useOhFitnessValidityAlerts();
  const hasAccess = (userData?.groups ?? []).includes("OccupationalHealth");

  const filteredCampaign = useMemo(() => {
    const rows = campaignQuery.data ?? [];
    return rows.filter((row) => {
      if (
        appliedFilters.site &&
        !row.site.toLowerCase().includes(appliedFilters.site.toLowerCase())
      ) {
        return false;
      }
      if (
        appliedFilters.department &&
        !(row.department_name ?? "")
          .toLowerCase()
          .includes(appliedFilters.department.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [campaignQuery.data, appliedFilters]);

  if (isUserLoading) {
    return (
      <ListPageLayout data-testid="oh-surveillance-page">
        <div className="p-8 text-sm text-brand-muted">Loading surveillance…</div>
      </ListPageLayout>
    );
  }

  if (!hasAccess) {
    return <OhAccessDenied data-testid="oh-surveillance-page" />;
  }

  const isRefreshing =
    requirementsQuery.isFetching ||
    campaignQuery.isFetching ||
    fitnessAlertsQuery.isFetching;

  return (
    <ListPageLayout data-testid="oh-surveillance-page">
      <ListPageHeaderSection className="border-b border-brand-border bg-white px-4 py-5 md:px-6">
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title="OH surveillance"
            description="Due and overdue surveillance requirements plus campaign queue."
          />
          <ListPageHeaderActions>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg border-dash-border text-xs text-brand-slate"
              disabled={isRefreshing}
              onClick={() => {
                void requirementsQuery.refetch();
                void campaignQuery.refetch();
                void fitnessAlertsQuery.refetch();
              }}
            >
              <RefreshCw className="size-3.5" />
              Refresh
            </Button>
          </ListPageHeaderActions>
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>

      <ListPageTableSection className="space-y-8">
        {(fitnessAlertsQuery.data ?? []).length > 0 ? (
          <section
            className="rounded-xl border border-amber-200 bg-amber-50 p-4"
            data-testid="oh-fitness-validity-alerts"
          >
            <h2 className="mb-2 text-sm font-semibold text-amber-950">
              Fitness certificate alerts (
              {fitnessAlertsQuery.data?.length ?? 0})
            </h2>
            <ul className="space-y-2 text-sm text-amber-950">
              {fitnessAlertsQuery.data?.slice(0, 8).map((alert) => (
                <li key={alert.employment_episode_uuid}>
                  <Link
                    className="font-medium underline-offset-2 hover:underline"
                    href={ROUTES.occupationalHealthEmployment(alert.customer_uuid)}
                  >
                    {alert.customer_name}
                  </Link>
                  <span className="text-amber-800">
                    {" "}
                    — {alert.alert_codes.map((code) => code.replace(/_/g, " ")).join(", ")}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="grid gap-3 rounded-xl border border-brand-border bg-white p-4 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="oh-surv-site">Site</Label>
            <Input
              id="oh-surv-site"
              value={site}
              onChange={(event) => setSite(event.target.value)}
              placeholder="Filter by site"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="oh-surv-dept">Department</Label>
            <Input
              id="oh-surv-dept"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              placeholder="Filter by department"
            />
          </div>
          <div className="flex items-end gap-2 md:col-span-2">
            <Button
              type="button"
              onClick={() =>
                setAppliedFilters({
                  site: site.trim(),
                  department: department.trim(),
                })
              }
            >
              Apply filters
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSite("");
                setDepartment("");
                setAppliedFilters({ site: "", department: "" });
              }}
            >
              Clear
            </Button>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-brand-navy">
            Due & overdue requirements
          </h2>
          {requirementsQuery.isLoading ? (
            <p className="text-sm text-brand-muted">Loading requirements…</p>
          ) : requirementsQuery.error ? (
            <p className="text-sm text-red-700">Could not load requirements.</p>
          ) : (
            <ListPageDataTable>
              <ListPageDataTableHeader>
                <ListPageDataTableHeaderRow>
                  <ListPageDataTableHeaderCell>Due date</ListPageDataTableHeaderCell>
                  <ListPageDataTableHeaderCell>Status</ListPageDataTableHeaderCell>
                  <ListPageDataTableHeaderCell>Worker</ListPageDataTableHeaderCell>
                  <ListPageDataTableHeaderCell>Site / dept</ListPageDataTableHeaderCell>
                  <ListPageDataTableHeaderCell>
                    Battery
                  </ListPageDataTableHeaderCell>
                  <ListPageDataTableHeaderCell>Schedule</ListPageDataTableHeaderCell>
                </ListPageDataTableHeaderRow>
              </ListPageDataTableHeader>
              <ListPageDataTableBody>
                {(requirementsQuery.data ?? []).length === 0 ? (
                  <ListPageDataTableRow className="hover:bg-transparent">
                    <ListPageDataTableCell
                      colSpan={6}
                      className="py-8 text-center text-brand-muted"
                    >
                      No due or overdue requirements.
                    </ListPageDataTableCell>
                  </ListPageDataTableRow>
                ) : (
                  requirementsQuery.data?.map((row) => (
                    <ListPageDataTableRow key={row.uuid}>
                      <ListPageDataTableCell className="tabular-nums">
                        {row.due_date}
                      </ListPageDataTableCell>
                      <ListPageDataTableCell>
                        <OpdEncounterStatusBadge status={row.status} />
                      </ListPageDataTableCell>
                      <ListPageDataTableCell>
                        {row.customer_uuid ? (
                          <Link
                            className="font-medium text-brand-navy hover:text-brand-primary"
                            href={ROUTES.occupationalHealthEmployment(
                              row.customer_uuid,
                            )}
                          >
                            {row.customer_name ?? row.employment_episode}
                          </Link>
                        ) : (
                          row.employment_episode
                        )}
                      </ListPageDataTableCell>
                      <ListPageDataTableCell>
                        {[row.site, row.department_name].filter(Boolean).join(" · ") ||
                          "—"}
                      </ListPageDataTableCell>
                      <ListPageDataTableCell>
                        {row.component_code
                          ? `${row.component_code} (${(row.exam_type ?? "").replace(/_/g, " ")})`
                          : row.exam_battery_rule}
                      </ListPageDataTableCell>
                      <ListPageDataTableCell>
                        {row.customer_uuid ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() =>
                              setScheduleCustomer(
                                customerStubFromRow({
                                  customer_uuid: row.customer_uuid!,
                                  customer_name: row.customer_name ?? "Worker",
                                  customer_identifier:
                                    row.customer_identifier ?? "",
                                }),
                              )
                            }
                          >
                            <CalendarPlus className="size-3.5" />
                            Schedule
                          </Button>
                        ) : (
                          "—"
                        )}
                      </ListPageDataTableCell>
                    </ListPageDataTableRow>
                  ))
                )}
              </ListPageDataTableBody>
            </ListPageDataTable>
          )}
        </section>

        <section data-testid="oh-campaign-queue-section">
          <h2 className="mb-3 text-sm font-semibold text-brand-navy">
            Campaign queue
          </h2>
          {campaignQuery.isLoading ? (
            <p className="text-sm text-brand-muted">Loading campaign queue…</p>
          ) : campaignQuery.error ? (
            <p className="text-sm text-red-700">Could not load campaign queue.</p>
          ) : (
            <ListPageDataTable>
              <ListPageDataTableHeader>
                <ListPageDataTableHeaderRow>
                  <ListPageDataTableHeaderCell>Worker</ListPageDataTableHeaderCell>
                  <ListPageDataTableHeaderCell>Employer</ListPageDataTableHeaderCell>
                  <ListPageDataTableHeaderCell>Site</ListPageDataTableHeaderCell>
                  <ListPageDataTableHeaderCell>
                    Component
                  </ListPageDataTableHeaderCell>
                  <ListPageDataTableHeaderCell>Due</ListPageDataTableHeaderCell>
                  <ListPageDataTableHeaderCell>Status</ListPageDataTableHeaderCell>
                  <ListPageDataTableHeaderCell>Schedule</ListPageDataTableHeaderCell>
                </ListPageDataTableHeaderRow>
              </ListPageDataTableHeader>
              <ListPageDataTableBody>
                {filteredCampaign.length === 0 ? (
                  <ListPageDataTableRow className="hover:bg-transparent">
                    <ListPageDataTableCell
                      colSpan={7}
                      className="py-8 text-center text-brand-muted"
                    >
                      Campaign queue is empty.
                    </ListPageDataTableCell>
                  </ListPageDataTableRow>
                ) : (
                  filteredCampaign.map((row, index) => (
                    <ListPageDataTableRow
                      key={`${row.customer_uuid}-${row.component_code}-${index}`}
                    >
                      <ListPageDataTableCell>
                        <Link
                          className="font-medium text-brand-navy hover:text-brand-primary"
                          href={ROUTES.occupationalHealthEmployment(
                            row.customer_uuid,
                          )}
                        >
                          {row.customer_name}
                        </Link>
                      </ListPageDataTableCell>
                      <ListPageDataTableCell>{row.employer}</ListPageDataTableCell>
                      <ListPageDataTableCell>{row.site}</ListPageDataTableCell>
                      <ListPageDataTableCell>
                        {row.component_code} (
                        {row.exam_type.replace(/_/g, " ")})
                      </ListPageDataTableCell>
                      <ListPageDataTableCell className="tabular-nums">
                        {row.due_date}
                      </ListPageDataTableCell>
                      <ListPageDataTableCell>
                        <OpdEncounterStatusBadge status={row.status} />
                      </ListPageDataTableCell>
                      <ListPageDataTableCell>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() =>
                            setScheduleCustomer(customerStubFromRow(row))
                          }
                        >
                          <CalendarPlus className="size-3.5" />
                          Schedule
                        </Button>
                      </ListPageDataTableCell>
                    </ListPageDataTableRow>
                  ))
                )}
              </ListPageDataTableBody>
            </ListPageDataTable>
          )}
        </section>
      </ListPageTableSection>

      {scheduleCustomer ? (
        <CreateAppointmentDialog
          customer={scheduleCustomer}
          open
          onOpenChange={(open) => {
            if (!open) {
              setScheduleCustomer(null);
            }
          }}
          onCreated={() => setScheduleCustomer(null)}
        />
      ) : null}
    </ListPageLayout>
  );
}
