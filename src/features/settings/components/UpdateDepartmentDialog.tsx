"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
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
  toUpdateOrganizationDepartmentFormValues,
  toUpdateOrganizationDepartmentPayload,
  updateOrganizationDepartmentSchema,
  type UpdateOrganizationDepartmentFormValues,
} from "@/features/settings/schemas/organization-department.schema";
import {
  fetchOrganizationClinics,
  updateOrganizationDepartment,
} from "@/features/settings/services/settings.service";
import type {
  OrganizationClinic,
  OrganizationDepartment,
} from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

const FORM_ID = "update-department-form";

type UpdateDepartmentTab = "details" | "active";

type UpdateDepartmentDialogProps = {
  department: OrganizationDepartment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (department: OrganizationDepartment) => void;
};

export function UpdateDepartmentDialog({
  department,
  open,
  onOpenChange,
  onUpdated,
}: UpdateDepartmentDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<UpdateDepartmentTab>("details");
  const [clinics, setClinics] = useState<OrganizationClinic[]>([]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(false);

  const form = useForm<UpdateOrganizationDepartmentFormValues>({
    resolver: zodResolver(updateOrganizationDepartmentSchema),
    defaultValues: toUpdateOrganizationDepartmentFormValues(department),
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
    if (open) {
      setActiveTab("details");
      form.reset(toUpdateOrganizationDepartmentFormValues(department));
    }
  }, [department, form, open]);

  async function handleSubmit(values: UpdateOrganizationDepartmentFormValues) {
    try {
      const updatedDepartment = await updateOrganizationDepartment(
        department.uuid,
        toUpdateOrganizationDepartmentPayload(values),
      );
      toast({
        variant: "success",
        title: "Department updated",
        description: `${updatedDepartment.name} was saved successfully.`,
      });
      onUpdated(updatedDepartment);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in toUpdateOrganizationDepartmentFormValues(department)) {
            form.setError(field as keyof UpdateOrganizationDepartmentFormValues, {
              message,
            });
          }
        }
        toast({
          variant: "error",
          title: "Could not update department",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not update department",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  const isActive = form.watch("is_active");

  return (
    <TabbedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Update department"
      description="Edit details for this department within your organization."
      tabs={[
        { id: "details", label: "Details" },
        { id: "active", label: "Active" },
      ]}
      activeTab={activeTab}
      onTabChange={(tabId) => {
        if (tabId === "details" || tabId === "active") {
          setActiveTab(tabId);
        }
      }}
      className={appFont.className}
      data-testid="update-department-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            form={FORM_ID}
            disabled={isSubmitting || isLoadingClinics || clinics.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </PrimaryButton>
        </>
      }
    >
      <Form {...form}>
        <form
          id={FORM_ID}
          className="space-y-4"
          onSubmit={form.handleSubmit(handleSubmit, () => setActiveTab("details"))}
        >
            {activeTab === "details" ? (
            <div className="space-y-4">
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
            </div>
            ) : (
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4 space-y-0 rounded-xl border border-brand-border px-4 py-3">
                    <div className="min-w-0">
                      <FormLabel className="text-sm text-brand-navy">
                        Department is {isActive ? "active" : "inactive"}
                      </FormLabel>
                      <p className="mt-1 text-xs text-brand-muted">
                        {isActive
                          ? "Active departments can be used for visits and scheduling."
                          : "Inactive departments stay on file and are hidden from new visits."}
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                        data-testid="department-active-switch"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
        </form>
      </Form>
    </TabbedDialog>
  );
}
