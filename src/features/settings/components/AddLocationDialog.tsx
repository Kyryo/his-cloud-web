"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { FetchErrorNotice } from "@/components/fetch-error-notice";
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
import {
  createOrganizationLocationDefaultValues,
  createOrganizationLocationSchema,
  toCreateOrganizationLocationPayload,
  type CreateOrganizationLocationFormValues,
} from "@/features/settings/schemas/organization-location.schema";
import {
  createOrganizationLocation,
  fetchOrganizationClinics,
  fetchOrganizationDepartments,
} from "@/features/settings/services/settings.service";
import type {
  OrganizationClinic,
  OrganizationDepartment,
  OrganizationLocation,
} from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { getErrorMessage, logFetchError } from "@/lib/fetch-error";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AddLocationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (location: OrganizationLocation) => void;
};

export function AddLocationDialog({
  open,
  onOpenChange,
  onCreated,
}: AddLocationDialogProps) {
  const { toast } = useToast();
  const [clinics, setClinics] = useState<OrganizationClinic[]>([]);
  const [departments, setDepartments] = useState<OrganizationDepartment[]>([]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [clinicsError, setClinicsError] = useState<string | null>(null);
  const [departmentsError, setDepartmentsError] = useState<string | null>(null);

  const form = useForm<CreateOrganizationLocationFormValues>({
    resolver: zodResolver(createOrganizationLocationSchema),
    defaultValues: createOrganizationLocationDefaultValues,
  });

  const selectedClinicId = form.watch("clinic");
  const selectedDepartmentId = form.watch("department");
  const hasDepartmentValue = Boolean(selectedDepartmentId);
  const isSubmitting = form.formState.isSubmitting;

  const loadClinics = useCallback(async () => {
    setIsLoadingClinics(true);
    setClinicsError(null);

    try {
      const response = await fetchOrganizationClinics();
      setClinics(response.results);
    } catch (error) {
      logFetchError("AddLocationDialog.loadClinics", error);
      setClinics([]);
      setClinicsError(getErrorMessage(error, "Could not load clinics."));
    } finally {
      setIsLoadingClinics(false);
    }
  }, []);

  const loadDepartments = useCallback(async (clinicId: string) => {
    setIsLoadingDepartments(true);
    setDepartmentsError(null);

    try {
      const response = await fetchOrganizationDepartments();
      setDepartments(
        response.results.filter(
          (department) => String(department.clinic) === clinicId,
        ),
      );
    } catch (error) {
      logFetchError("AddLocationDialog.loadDepartments", error);
      setDepartments([]);
      setDepartmentsError(getErrorMessage(error, "Could not load departments."));
    } finally {
      setIsLoadingDepartments(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setClinicsError(null);
      setDepartmentsError(null);
      return;
    }

    void loadClinics();
  }, [loadClinics, open]);

  useEffect(() => {
    if (!open || !selectedClinicId) {
      setDepartments([]);
      setDepartmentsError(null);
      return;
    }

    void loadDepartments(selectedClinicId);
  }, [loadDepartments, open, selectedClinicId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    form.setValue("department", "");
  }, [form, open, selectedClinicId]);

  useEffect(() => {
    if (!open) {
      form.reset(createOrganizationLocationDefaultValues);
    }
  }, [form, open]);

  const isDepartmentSelectDisabled =
    !selectedClinicId ||
    isLoadingDepartments ||
    Boolean(departmentsError) ||
    (departments.length === 0 && !departmentsError && !isLoadingDepartments);

  const isSubmitDisabled =
    isSubmitting ||
    isLoadingClinics ||
    Boolean(clinicsError) ||
    clinics.length === 0 ||
    !selectedClinicId ||
    isLoadingDepartments ||
    Boolean(departmentsError) ||
    (!hasDepartmentValue && departments.length === 0);

  async function handleSubmit(values: CreateOrganizationLocationFormValues) {
    try {
      const location = await createOrganizationLocation(
        toCreateOrganizationLocationPayload(values),
      );
      toast({
        variant: "success",
        title: "Location added",
        description: `${location.name} was created successfully.`,
      });
      form.reset(createOrganizationLocationDefaultValues);
      onCreated(location);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in createOrganizationLocationDefaultValues) {
            form.setError(field as keyof CreateOrganizationLocationFormValues, {
              message,
            });
          }
        }
        toast({
          variant: "error",
          title: "Could not add location",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not add location",
        description: getErrorMessage(error),
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("max-h-[90vh] overflow-y-auto sm:max-w-lg", appFont.className)}
        data-testid="add-location-dialog"
      >
        <DialogHeader>
          <DialogTitle>Add location</DialogTitle>
          <DialogDescription>
            Create a new location under one of your organization&apos;s clinics.
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
                      <Input {...field} autoComplete="off" />
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
                    disabled={isLoadingClinics || (clinics.length === 0 && !clinicsError)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingClinics
                              ? "Loading clinics..."
                              : clinicsError
                                ? "Clinics unavailable"
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
                  {clinicsError ? (
                    <FetchErrorNotice
                      message={clinicsError}
                      onRetry={() => void loadClinics()}
                    />
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isDepartmentSelectDisabled}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !selectedClinicId
                              ? "Select a clinic first"
                              : isLoadingDepartments
                                ? "Loading departments..."
                                : departmentsError
                                  ? "Departments unavailable"
                                  : departments.length === 0
                                    ? "No departments for this clinic"
                                    : "Select a department"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.uuid} value={String(department.id)}>
                          {department.name} ({department.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {departmentsError ? (
                    <FetchErrorNotice
                      message={departmentsError}
                      onRetry={() => {
                        if (selectedClinicId) {
                          void loadDepartments(selectedClinicId);
                        }
                      }}
                    />
                  ) : null}
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

            <DialogFooter>
              <SecondaryButton
                type="button"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={isSubmitDisabled}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  "Add location"
                )}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
