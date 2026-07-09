"use client";

import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { FilterSelectField } from "@/components/filter-select-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CareProviderCombobox } from "@/features/appointments/components/CareProviderCombobox";
import { useUserAssociatedClinics } from "@/features/appointments/hooks/use-user-associated-clinics";
import {
  fetchClinicalDepartments,
} from "@/features/clinical/services/clinical-catalog.service";
import type {
  ClinicalDepartment,
} from "@/features/clinical/types/clinical-catalog.types";
import {
  APPOINTMENT_STATUS_OPTIONS,
  countActiveAppointmentFilters,
  DEFAULT_APPOINTMENT_FILTERS,
  type AppointmentListFilterState,
} from "@/features/appointments/utils/appointment-list-filters";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type AppointmentsFiltersSheetProps = {
  filters: AppointmentListFilterState;
  isLoading?: boolean;
  onApply: (filters: AppointmentListFilterState) => void;
};

export function AppointmentsFiltersSheet({
  filters,
  isLoading = false,
  onApply,
}: AppointmentsFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const { clinics } = useUserAssociatedClinics();
  const [departments, setDepartments] = useState<ClinicalDepartment[]>([]);
  const activeCount = useMemo(
    () => countActiveAppointmentFilters(filters),
    [filters],
  );

  useEffect(() => {
    if (!open || !draft.clinicUuid) {
      setDepartments([]);
      return;
    }

    const clinicId = clinics.find((clinic) => clinic.uuid === draft.clinicUuid)?.id;
    if (!clinicId) {
      return;
    }

    void fetchClinicalDepartments(clinicId)
      .then(setDepartments)
      .catch(() => setDepartments([]));
  }, [clinics, draft.clinicUuid, open]);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(filters);
    }
    setOpen(nextOpen);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={isLoading}
        onClick={() => handleOpenChange(true)}
        data-testid="appointments-filters-button"
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Filters
        {activeCount > 0 ? (
          <Badge variant="secondary" className="ml-1 px-1.5 py-0">
            {activeCount}
          </Badge>
        ) : null}
      </Button>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className={cn("w-full sm:max-w-md", appFont.className)}>
          <SheetHeader>
            <SheetTitle>Filter appointments</SheetTitle>
            <SheetDescription>
              Narrow the list by status, clinic, department, care provider, or scheduled
              date.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <FilterSelectField
              id="appointment-filter-status"
              label="Status"
              value={draft.status}
              options={APPOINTMENT_STATUS_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  status: value as AppointmentListFilterState["status"],
                }))
              }
            />

            <FilterSelectField
              id="appointment-filter-clinic"
              label="Clinic"
              value={draft.clinicUuid || "all"}
              options={[
                { value: "all", label: "All clinics" },
                ...clinics.map((clinic) => ({
                  value: clinic.uuid,
                  label: clinic.name,
                })),
              ]}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  clinicUuid: value === "all" ? "" : value,
                  departmentUuid: "",
                  clinicianId: null,
                }))
              }
            />

            <CareProviderCombobox
              id="appointment-filter-provider"
              label="Care provider"
              value={draft.clinicianId}
              clinicUuid={draft.clinicUuid || undefined}
              disabled={!draft.clinicUuid}
              onSelect={(provider) =>
                setDraft((current) => ({
                  ...current,
                  clinicianId: provider?.id ?? null,
                }))
              }
            />

            <FilterSelectField
              id="appointment-filter-department"
              label="Department"
              value={draft.departmentUuid || "all"}
              options={[
                { value: "all", label: "All departments" },
                ...departments.map((department) => ({
                  value: department.uuid,
                  label: department.name,
                })),
              ]}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  departmentUuid: value === "all" ? "" : value,
                }))
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="appointment-filter-from"
                  className="text-sm font-medium text-brand-navy"
                >
                  Scheduled from
                </label>
                <Input
                  id="appointment-filter-from"
                  type="date"
                  value={draft.scheduledFrom}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      scheduledFrom: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="appointment-filter-to"
                  className="text-sm font-medium text-brand-navy"
                >
                  Scheduled to
                </label>
                <Input
                  id="appointment-filter-to"
                  type="date"
                  value={draft.scheduledTo}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      scheduledTo: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <SheetFooter className="mt-8 gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDraft(DEFAULT_APPOINTMENT_FILTERS);
              }}
            >
              Reset
            </Button>
            <Button
              type="button"
              onClick={() => {
                onApply(draft);
                setOpen(false);
              }}
            >
              Apply filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
