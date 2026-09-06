"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", appFont.className)}>
        <DialogHeader>
          <DialogTitle>Add department encounter</DialogTitle>
          <DialogDescription>
            Start care in another department on this visit. Choose how charges
            should be billed.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
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
                  disabled={isLoadingDepartments}
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
                    {departments.map((department) => (
                      <SelectItem key={department.uuid} value={department.uuid}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
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
              Required when this is not the first department encounter on the
              visit.
            </p>
            {form.formState.errors.billing_mode ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.billing_mode.message}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <SecondaryButton
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={isSaving || isLoadingDepartments}
              data-testid="add-encounter-submit"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                "Add encounter"
              )}
            </PrimaryButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
