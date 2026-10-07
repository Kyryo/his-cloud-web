"use client";

import { useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import {
  fetchClinicalDepartments,
} from "@/features/clinical/services/clinical-catalog.service";
import type { ClinicalDepartment } from "@/features/clinical/types/clinical-catalog.types";
import { resolveDefaultDepartmentUuid } from "@/features/clinical/utils/apply-sole-department";
import { fetchDepartmentConsultationServices } from "@/features/visits/services/consultation-services.service";
import type { ConsultationServiceCatalogItem } from "@/features/visits/types/visit.types";

type MemberVisitAutomationDialogProps = {
  open: boolean;
  clinicId: number | null;
  department: string;
  consultationService: string;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (setup: { department: string; consultationService: string }) => void;
};

export function MemberVisitAutomationDialog({
  open,
  clinicId,
  department,
  consultationService,
  title = "Automatic visit creation",
  description = "Clients you search for will be automatically matched or registered, and a visit will be started for each client using the details below.",
  confirmLabel = "Start automation",
  onOpenChange,
  onConfirm,
}: MemberVisitAutomationDialogProps) {
  const [departments, setDepartments] = useState<ClinicalDepartment[]>([]);
  const [services, setServices] = useState<ConsultationServiceCatalogItem[]>([]);
  const [departmentUuid, setDepartmentUuid] = useState(department);
  const [serviceUuid, setServiceUuid] = useState(consultationService);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setDepartmentUuid(department);
    setServiceUuid(consultationService);
  }, [consultationService, department, open]);

  useEffect(() => {
    if (!open || !clinicId) {
      return;
    }
    let active = true;
    setIsLoadingDepartments(true);
    void fetchClinicalDepartments(clinicId)
      .then((rows) => {
        if (!active) {
          return;
        }
        const activeRows = rows.filter(
          (row) => row.is_active && row.status === "ACTIVE",
        );
        setDepartments(activeRows);
        const only = resolveDefaultDepartmentUuid(activeRows);
        if (only) {
          setDepartmentUuid(only);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoadingDepartments(false);
        }
      });
    return () => {
      active = false;
    };
  }, [clinicId, open]);

  useEffect(() => {
    if (!open || !departmentUuid) {
      setServices([]);
      return;
    }
    let active = true;
    setIsLoadingServices(true);
    void fetchDepartmentConsultationServices(departmentUuid)
      .then((rows) => {
        if (!active) {
          return;
        }
        setServices(rows);
        if (rows.length === 1) {
          setServiceUuid(rows[0]?.uuid ?? "");
        }
      })
      .finally(() => {
        if (active) {
          setIsLoadingServices(false);
        }
      });
    return () => {
      active = false;
    };
  }, [departmentUuid, open]);

  const showDepartmentPicker = departments.length !== 1;
  const showServicePicker = services.length !== 1;

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      data-testid="member-visit-automation-dialog"
      footer={
        <div className="flex justify-end gap-2">
          <SecondaryButton type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={!departmentUuid || isLoadingDepartments}
            onClick={() =>
              onConfirm({
                department: departmentUuid,
                consultationService: serviceUuid,
              })
            }
          >
            {confirmLabel}
          </PrimaryButton>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-brand-navy">Department</p>
          {isLoadingDepartments ? (
            <p className="text-sm text-dash-muted">Loading departments…</p>
          ) : departments.length === 0 ? (
            <p className="text-sm text-dash-muted">
              This clinic has no active department.
            </p>
          ) : showDepartmentPicker ? (
            <Select
              value={departmentUuid}
              onValueChange={(value) => {
                setDepartmentUuid(value);
                setServiceUuid("");
              }}
            >
              <SelectTrigger aria-label="Department">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((row) => (
                  <SelectItem key={row.uuid} value={row.uuid}>
                    {row.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-brand-navy">{departments[0]?.name}</p>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-brand-navy">
            Service <span className="font-normal text-dash-muted">Optional</span>
          </p>
          {!departmentUuid || isLoadingServices ? (
            <p className="text-sm text-dash-muted">
              {departmentUuid ? "Loading services…" : "Select a department first."}
            </p>
          ) : services.length === 0 ? (
            <p className="text-sm text-dash-muted">
              This department has no consultation service. Visits will start without one.
            </p>
          ) : showServicePicker ? (
            <Select
              value={serviceUuid || "none"}
              onValueChange={(value) => setServiceUuid(value === "none" ? "" : value)}
            >
              <SelectTrigger aria-label="Service">
                <SelectValue placeholder="No service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No service</SelectItem>
                {services.map((row) => (
                  <SelectItem key={row.uuid} value={row.uuid}>
                    {row.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-brand-navy">{services[0]?.name}</p>
          )}
        </div>
      </div>
    </SectionedDialog>
  );
}
