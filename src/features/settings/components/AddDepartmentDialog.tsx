"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { SetupSaveActions } from "@/components/ui/setup-save-actions";
import { useOnboardingReturn } from "@/features/overview/hooks/use-onboarding-return";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDepartmentTypeOptions } from "@/features/settings/hooks/use-department-type-options";
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

const FORM_ID = "add-department-form";

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
  const { finishSetup } = useOnboardingReturn();
  const addAnotherRef = useRef(false);
  const [clinics, setClinics] = useState<OrganizationClinic[]>([]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(false);
  const departmentTypeOptions = useDepartmentTypeOptions();

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

  useEffect(() => {
    if (!open || clinics.length !== 1) {
      return;
    }
    if (form.getValues("clinic")) {
      return;
    }
    form.setValue("clinic", String(clinics[0].id), { shouldValidate: true });
  }, [clinics, form, open]);

  async function handleSubmit(values: CreateOrganizationDepartmentFormValues) {
    const addAnother = addAnotherRef.current;
    addAnotherRef.current = false;
    try {
      const department = await createOrganizationDepartment(
        toCreateOrganizationDepartmentPayload(values),
      );
      toast({
        variant: "success",
        title: "Department added",
        description: `${department.name} was created successfully.`,
      });
      onCreated(department);
      if (addAnother) {
        form.reset({
          ...createOrganizationDepartmentDefaultValues,
          clinic: clinics.length === 1 ? String(clinics[0].id) : "",
        });
        return;
      }
      form.reset(createOrganizationDepartmentDefaultValues);
      onOpenChange(false);
      finishSetup();
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
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add department"
      description="Create a clinical or operational department under one of your clinics."
      className={cn("sm:max-w-lg", appFont.className)}
      data-testid="add-department-dialog"
      footer={
        <SetupSaveActions
          formId={FORM_ID}
          open={open}
          isSubmitting={isSubmitting}
          disabled={isLoadingClinics || clinics.length === 0}
          onCancel={() => onOpenChange(false)}
          onIntent={(addAnother) => {
            addAnotherRef.current = addAnother;
          }}
        />
      }
    >
      <Form {...form}>
        <form
          id={FORM_ID}
          className="space-y-4"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Name <RequiredFieldMarker />
                    </FormLabel>
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
                    <FormLabel>
                      Code <RequiredFieldMarker />
                    </FormLabel>
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
                  <FormLabel>
                    Clinic <RequiredFieldMarker />
                  </FormLabel>
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
                  <FormLabel>
                    Department type <RequiredFieldMarker />
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departmentTypeOptions.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.isClinical
                            ? `${type.label} · clinical workspace`
                            : type.label}
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
                  <FormLabel>
                    Default appointment duration (minutes) <RequiredFieldMarker />
                  </FormLabel>
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
        </form>
      </Form>
    </SectionedDialog>
  );
}
