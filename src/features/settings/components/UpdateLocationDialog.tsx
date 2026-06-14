"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import {
  toUpdateOrganizationLocationFormValues,
  toUpdateOrganizationLocationPayload,
  updateOrganizationLocationSchema,
  type UpdateOrganizationLocationFormValues,
} from "@/features/settings/schemas/organization-location.schema";
import {
  fetchOrganizationClinics,
  fetchOrganizationDepartments,
  updateOrganizationLocation,
} from "@/features/settings/services/settings.service";
import type {
  OrganizationClinic,
  OrganizationDepartment,
  OrganizationLocation,
} from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type UpdateLocationDialogProps = {
  location: OrganizationLocation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (location: OrganizationLocation) => void;
};

export function UpdateLocationDialog({
  location,
  open,
  onOpenChange,
  onUpdated,
}: UpdateLocationDialogProps) {
  const { toast } = useToast();
  const [clinics, setClinics] = useState<OrganizationClinic[]>([]);
  const [departments, setDepartments] = useState<OrganizationDepartment[]>([]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);

  const form = useForm<UpdateOrganizationLocationFormValues>({
    resolver: zodResolver(updateOrganizationLocationSchema),
    defaultValues: toUpdateOrganizationLocationFormValues(location),
  });

  const selectedClinicId = form.watch("clinic");

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
    if (!open || !selectedClinicId) {
      setDepartments([]);
      return;
    }

    let active = true;

    async function loadDepartments() {
      setIsLoadingDepartments(true);
      try {
        const response = await fetchOrganizationDepartments();
        if (active) {
          setDepartments(
            response.results.filter(
              (department) => String(department.clinic) === selectedClinicId,
            ),
          );
        }
      } catch {
        if (active) {
          setDepartments([]);
        }
      } finally {
        if (active) {
          setIsLoadingDepartments(false);
        }
      }
    }

    void loadDepartments();

    return () => {
      active = false;
    };
  }, [open, selectedClinicId]);

  const previousClinicId = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      previousClinicId.current = null;
      return;
    }

    if (
      previousClinicId.current &&
      previousClinicId.current !== selectedClinicId
    ) {
      form.setValue("department", "");
    }

    previousClinicId.current = selectedClinicId;
  }, [form, open, selectedClinicId]);

  useEffect(() => {
    if (open) {
      form.reset(toUpdateOrganizationLocationFormValues(location));
    }
  }, [form, location, open]);

  async function handleSubmit(values: UpdateOrganizationLocationFormValues) {
    try {
      const updatedLocation = await updateOrganizationLocation(
        location.uuid,
        toUpdateOrganizationLocationPayload(values),
      );
      toast({
        variant: "success",
        title: "Location updated",
        description: `${updatedLocation.name} was saved successfully.`,
      });
      onUpdated(updatedLocation);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in toUpdateOrganizationLocationFormValues(location)) {
            form.setError(field as keyof UpdateOrganizationLocationFormValues, {
              message,
            });
          }
        }
        toast({
          variant: "error",
          title: "Could not update location",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not update location",
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
        data-testid="update-location-dialog"
      >
        <DialogHeader>
          <DialogTitle>Update location</DialogTitle>
          <DialogDescription>
            Edit details for this location within your organization.
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
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={
                      !selectedClinicId ||
                      isLoadingDepartments ||
                      departments.length === 0
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !selectedClinicId
                              ? "Select a clinic first"
                              : isLoadingDepartments
                                ? "Loading departments..."
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
              <PrimaryButton
                type="submit"
                disabled={
                  isSubmitting ||
                  isLoadingClinics ||
                  clinics.length === 0 ||
                  isLoadingDepartments ||
                  departments.length === 0
                }
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
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
