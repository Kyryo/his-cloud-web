"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORGANIZATION_DEPARTMENT_TYPES } from "@/features/settings/constants/department-types";
import {
  createOrganizationDepartmentDefaultValues,
  createOrganizationDepartmentSchema,
  toCreateOrganizationDepartmentPayload,
  type CreateOrganizationDepartmentFormValues,
} from "@/features/settings/schemas/organization-department.schema";
import {
  createOrganizationDepartment,
  fetchOrganizationClinics,
} from "@/features/settings/services/settings.service";
import type {
  OrganizationClinic,
  OrganizationDepartment,
} from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AddDepartmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (department: OrganizationDepartment) => void;
};

export function AddDepartmentDialog({
  open,
  onOpenChange,
  onCreated,
}: AddDepartmentDialogProps) {
  const { toast } = useToast();
  const [clinics, setClinics] = useState<OrganizationClinic[]>([]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(false);

  const form = useForm<CreateOrganizationDepartmentFormValues>({
    resolver: zodResolver(createOrganizationDepartmentSchema),
    defaultValues: createOrganizationDepartmentDefaultValues,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    let active = true;

    async function loadClinics() {
      setIsLoadingClinics(true);
      try {
        const response = await fetchOrganizationClinics();
        if (active) {
          setClinics(response.results);
        }
      } catch {
        if (active) {
          setClinics([]);
        }
      } finally {
        if (active) {
          setIsLoadingClinics(false);
        }
      }
    }

    void loadClinics();

    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      form.reset(createOrganizationDepartmentDefaultValues);
    }
  }, [form, open]);

  async function handleSubmit(values: CreateOrganizationDepartmentFormValues) {
    try {
      const department = await createOrganizationDepartment(
        toCreateOrganizationDepartmentPayload(values),
      );
      toast({
        variant: "success",
        title: "Department added",
        description: `${department.name} was created successfully.`,
      });
      form.reset(createOrganizationDepartmentDefaultValues);
      onCreated(department);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in createOrganizationDepartmentDefaultValues) {
            form.setError(field as keyof CreateOrganizationDepartmentFormValues, {
              message,
            });
          }
        }
        toast({
          variant: "error",
          title: "Could not add department",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not add department",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("max-h-[90vh] overflow-y-auto sm:max-w-lg", appFont.className)}
        data-testid="add-department-dialog"
      >
        <DialogHeader>
          <DialogTitle>Add department</DialogTitle>
          <DialogDescription>
            Create a clinical or operational department under one of your clinics.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" className="uppercase" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="clinic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinic</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoadingClinics || clinics.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingClinics
                              ? "Loading clinics..."
                              : clinics.length === 0
                                ? "No clinics available"
                                : "Select a clinic"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clinics.map((clinic) => (
                        <SelectItem key={clinic.uuid} value={String(clinic.id)}>
                          {clinic.name} ({clinic.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ORGANIZATION_DEPARTMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="default_appointment_duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default appointment duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" min={5} max={480} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3 rounded-lg border border-brand-border px-4 py-3">
              <p className="text-sm font-medium text-brand-navy">Scheduling</p>
              <FormField
                control={form.control}
                name="requires_appointment"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="size-4 rounded border-brand-border"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Requires appointment</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="walk_in_allowed"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="size-4 rounded border-brand-border"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Walk-in allowed</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <SecondaryButton
                type="button"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                disabled={isSubmitting || isLoadingClinics || clinics.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  "Add department"
                )}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
