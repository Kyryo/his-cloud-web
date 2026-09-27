"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchClinicalDepartments } from "@/features/clinical/services/clinical-catalog.service";
import type { ClinicalDepartment } from "@/features/clinical/types/clinical-catalog.types";
import { ENCOUNTER_BILLING_MODES } from "@/features/clinical-opd/schemas/clinical-opd.schema";
import { createVisitEncounter } from "@/features/visits/services/visits.service";
import type { VisitDetail, VisitEncounter } from "@/features/visits/types/visit.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const FORM_ID = "add-visit-encounter-form";

const OPEN_ENCOUNTER_STATUSES = new Set(["waiting", "in_progress"]);

const addVisitEncounterSchema = z.object({
  department: z.string().min(1, "Select a department."),
  billing_mode: z.enum(ENCOUNTER_BILLING_MODES, {
    message: "Select a billing mode.",
  }),
});

type AddVisitEncounterFormValues = z.infer<typeof addVisitEncounterSchema>;

type AddVisitEncounterDialogProps = {
  visit: VisitDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (encounter: VisitEncounter) => void;
};

function openDepartmentTypes(visit: VisitDetail): Set<string> {
  const types = new Set<string>();
  for (const encounter of visit.encounters ?? []) {
    if (
      encounter.is_active &&
      OPEN_ENCOUNTER_STATUSES.has(encounter.status) &&
      encounter.department_type
    ) {
      types.add(encounter.department_type);
    }
  }
  return types;
}

export function AddVisitEncounterDialog({
  visit,
  open,
  onOpenChange,
  onCreated,
}: AddVisitEncounterDialogProps) {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<ClinicalDepartment[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const blockedTypes = useMemo(() => openDepartmentTypes(visit), [visit]);

  const availableDepartments = useMemo(
    () =>
      departments.filter(
        (department) => !blockedTypes.has(department.department_type),
      ),
    [blockedTypes, departments],
  );
  const allDepartmentsUnavailable =
    departments.length > 0 && availableDepartments.length === 0;

  const form = useForm<AddVisitEncounterFormValues>({
    resolver: zodResolver(addVisitEncounterSchema),
    defaultValues: {
      department: "",
      billing_mode: "shared_visit",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) {
        return;
      }
      form.reset({
        department: "",
        billing_mode: "shared_visit",
      });

      try {
        setIsLoadingDepartments(true);
        const list = await fetchClinicalDepartments();
        if (!cancelled) {
          const filtered = visit.clinic_name
            ? list.filter(
                (department) => department.clinic_name === visit.clinic_name,
              )
            : list;
          setDepartments(filtered.length > 0 ? filtered : list);
        }
      } catch (error) {
        if (!cancelled) {
          toast({
            title: "Could not load departments",
            description:
              error instanceof BffError
                ? formatBffErrorMessage(error.message, error.errors)
                : "Unable to load departments.",
            variant: "error",
          });
          setDepartments([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingDepartments(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [form, open, toast, visit.clinic_name]);

  const onSubmit = form.handleSubmit(async (values) => {
    const selected = departments.find(
      (department) => department.uuid === values.department,
    );
    if (selected && blockedTypes.has(selected.department_type)) {
      form.setError("department", {
        message:
          "An open encounter already exists for this department type. Complete or cancel it first.",
      });
      return;
    }

    try {
      setIsSaving(true);
      const encounter = await createVisitEncounter(visit.uuid, {
        department: values.department,
        billing_mode: values.billing_mode,
      });
      toast({
        title: "Encounter added",
        description: `${encounter.department_name} was added to this visit.`,
        variant: "success",
      });
      onCreated(encounter);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Could not add encounter",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : "Unable to create the department encounter.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  });

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add department encounter"
      description="Start care in another department on this visit. Choose how charges should be billed."
      className={cn("sm:max-w-md", appFont.className)}
      data-testid="add-visit-encounter-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            form={FORM_ID}
            disabled={
              isSaving || isLoadingDepartments || allDepartmentsUnavailable
            }
            data-testid="add-encounter-submit"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </PrimaryButton>
        </>
      }
    >
      <form id={FORM_ID} className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="add-encounter-department">
            Department <RequiredFieldMarker />
          </Label>
          <Controller
            control={form.control}
            name="department"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
                disabled={isLoadingDepartments || departments.length === 0}
              >
                <SelectTrigger
                  id="add-encounter-department"
                  data-testid="add-encounter-department"
                >
                  <SelectValue
                    placeholder={
                      isLoadingDepartments
                        ? "Loading departments…"
                        : "Select a department"
                    }
                  />
                </SelectTrigger>
                <SelectContent className={appFont.className}>
                  {departments.map((department) => {
                    const isBlocked = blockedTypes.has(department.department_type);
                    return (
                      <SelectItem
                        key={department.uuid}
                        value={department.uuid}
                        disabled={isBlocked}
                      >
                        {department.name}
                        {isBlocked ? " · already open" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          />
          {allDepartmentsUnavailable ? (
            <p className="text-xs text-brand-muted">
              Every department already has an open encounter on this visit.
              Complete or cancel one before adding another.
            </p>
          ) : blockedTypes.size > 0 ? (
            <p className="text-xs text-brand-muted">
              Departments marked “already open” can’t be selected while that
              encounter is still waiting or in progress.
            </p>
          ) : null}
          {form.formState.errors.department ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.department.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="add-encounter-billing-mode">
            Billing mode <RequiredFieldMarker />
          </Label>
          <Controller
            control={form.control}
            name="billing_mode"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="add-encounter-billing-mode"
                  data-testid="add-encounter-billing-mode"
                >
                  <SelectValue placeholder="Select billing mode" />
                </SelectTrigger>
                <SelectContent className={appFont.className}>
                  <SelectItem value="shared_visit">
                    One bill for this visit
                  </SelectItem>
                  <SelectItem value="separate_department">
                    Separate bill for this department
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-brand-muted">
            Required when this is not the first department encounter on the visit.
          </p>
          {form.formState.errors.billing_mode ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.billing_mode.message}
            </p>
          ) : null}
        </div>
      </form>
    </SectionedDialog>
  );
}
