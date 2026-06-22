"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  platformAdminTenantSchema,
  type PlatformAdminTenantFormValues,
} from "@/features/platform-admin/schemas/platform-admin-tenant.schema";
import type {
  PlatformAdminTenant,
  PlatformAdminTenantPayload,
} from "@/features/platform-admin/types/platform-admin.types";

type PlatformAdminTenantDialogProps = {
  open: boolean;
  tenant?: PlatformAdminTenant | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: PlatformAdminTenantPayload) => Promise<void>;
};

const DEFAULT_VALUES: PlatformAdminTenantFormValues = {
  name: "",
  code: "",
  description: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state_province: "",
  country: "",
  postal_code: "",
  status: "PENDING",
  is_active: true,
  currency_code: "MWK",
};

export function PlatformAdminTenantDialog({
  open,
  tenant,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: PlatformAdminTenantDialogProps) {
  const form = useForm<PlatformAdminTenantFormValues>({
    resolver: zodResolver(platformAdminTenantSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      tenant
        ? {
            name: tenant.name,
            code: tenant.code,
            description: tenant.description ?? "",
            email: tenant.email ?? "",
            phone: tenant.phone ?? "",
            address: tenant.address ?? "",
            city: tenant.city ?? "",
            state_province: tenant.state_province ?? "",
            country: tenant.country ?? "",
            postal_code: tenant.postal_code ?? "",
            status: tenant.status,
            is_active: tenant.is_active,
            currency_code: tenant.currency_code || "MWK",
          }
        : DEFAULT_VALUES,
    );
  }, [form, open, tenant]);

  async function submit(values: PlatformAdminTenantFormValues) {
    await onSubmit({
      ...values,
      code: values.code.trim().toUpperCase(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{tenant ? "Edit tenant" : "Create tenant"}</DialogTitle>
          <DialogDescription>
            Platform tenant profile and lifecycle defaults.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-5" onSubmit={form.handleSubmit(submit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name" error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} />
            </Field>
            <Field label="Code" error={form.formState.errors.code?.message}>
              <Input
                {...form.register("code")}
                onChange={(event) =>
                  form.setValue("code", event.target.value.toUpperCase(), {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
            </Field>
            <Field label="Email" error={form.formState.errors.email?.message}>
              <Input type="email" {...form.register("email")} />
            </Field>
            <Field label="Phone" error={form.formState.errors.phone?.message}>
              <Input {...form.register("phone")} />
            </Field>
            <Field label="Country" error={form.formState.errors.country?.message}>
              <Input {...form.register("country")} />
            </Field>
            <Field
              label="Currency"
              error={form.formState.errors.currency_code?.message}
            >
              <Input {...form.register("currency_code")} />
            </Field>
            <Field label="Status" error={form.formState.errors.status?.message}>
              <Select
                value={form.watch("status")}
                onValueChange={(value) =>
                  form.setValue(
                    "status",
                    value as PlatformAdminTenantFormValues["status"],
                    { shouldDirty: true },
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="City" error={form.formState.errors.city?.message}>
              <Input {...form.register("city")} />
            </Field>
          </div>
          <Field label="Address" error={form.formState.errors.address?.message}>
            <Textarea rows={2} {...form.register("address")} />
          </Field>
          <Field
            label="Description"
            error={form.formState.errors.description?.message}
          >
            <Textarea rows={3} {...form.register("description")} />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save tenant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
