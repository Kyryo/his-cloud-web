"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useId, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { OverviewSegmentedControl } from "@/features/platform-admin/components/overview/OverviewSegmentedControl";
import type { FinanceEntryPayload } from "@/features/platform-admin/hooks/use-platform-admin-finance";
import {
  cashSnapshotEntrySchema,
  operatingCostEntrySchema,
  tenantPaymentEntrySchema,
  type CashSnapshotEntryValues,
  type OperatingCostEntryValues,
  type TenantPaymentEntryValues,
} from "@/features/platform-admin/schemas/finance-entry.schema";
import type { PlatformAdminTenant } from "@/features/platform-admin/types/platform-admin.types";
import type { FinanceRecordKind } from "@/features/platform-admin/utils/finance-series";

const today = () => new Date().toISOString().slice(0, 10);

const COST_CATEGORIES = [
  { value: "infrastructure", label: "Infrastructure" },
  { value: "payroll", label: "Payroll" },
  { value: "software", label: "Software" },
  { value: "support", label: "Support" },
  { value: "other", label: "Other" },
] as const;

const KIND_COPY: Record<
  FinanceRecordKind,
  { title: string; description: string }
> = {
  payment: {
    title: "Record tenant payment",
    description:
      "Money received from a tenant. Feeds revenue and net dollar retention.",
  },
  cost: {
    title: "Record operating cost",
    description:
      "Money spent running the platform. Feeds burn rate and runway.",
  },
  cash: {
    title: "Record cash balance",
    description:
      "Bank balance on a date. Used with burn rate to calculate runway.",
  },
};

function Field({
  label,
  error,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  error?: string;
  hint?: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-[13px] font-medium">
        {label}
      </Label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function SubmitBar({
  isSubmitting,
  label,
}: {
  isSubmitting: boolean;
  label: string;
}) {
  return (
    <div className="sticky bottom-0 -mx-6 mt-8 border-t border-foreground/[0.07] bg-background px-6 py-4">
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
        ) : null}
        {isSubmitting ? "Saving…" : label}
      </Button>
    </div>
  );
}

type FormProps = {
  isSubmitting: boolean;
  onSubmit: (entry: FinanceEntryPayload) => Promise<boolean>;
};

function PaymentForm({
  tenants,
  tenantsLoading,
  isSubmitting,
  onSubmit,
}: FormProps & { tenants: PlatformAdminTenant[]; tenantsLoading: boolean }) {
  const id = useId();
  const form = useForm<TenantPaymentEntryValues>({
    resolver: zodResolver(tenantPaymentEntrySchema),
    defaultValues: { tenant: "", amount: "", payment_date: today(), notes: "" },
  });
  const { errors } = form.formState;
  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={form.handleSubmit(async (v) => {
        const ok = await onSubmit({
          kind: "payment",
          payload: {
            tenant: Number(v.tenant),
            amount: v.amount.trim(),
            payment_date: v.payment_date,
            notes: v.notes ?? "",
          },
        });
        if (ok)
          form.reset({
            tenant: "",
            amount: "",
            payment_date: today(),
            notes: "",
          });
      })}
    >
      <Field
        label="Tenant"
        htmlFor={`${id}-tenant`}
        error={errors.tenant?.message}
      >
        <Controller
          control={form.control}
          name="tenant"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={tenantsLoading}
            >
              <SelectTrigger
                id={`${id}-tenant`}
                aria-invalid={Boolean(errors.tenant)}
              >
                <SelectValue
                  placeholder={
                    tenantsLoading ? "Loading tenants…" : "Select tenant"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Amount"
          htmlFor={`${id}-amount`}
          error={errors.amount?.message}
        >
          <Input
            id={`${id}-amount`}
            inputMode="decimal"
            placeholder="0.00"
            className="tabular-nums"
            aria-invalid={Boolean(errors.amount)}
            {...form.register("amount")}
          />
        </Field>
        <Field
          label="Payment date"
          htmlFor={`${id}-date`}
          error={errors.payment_date?.message}
        >
          <Input
            id={`${id}-date`}
            type="date"
            max={today()}
            {...form.register("payment_date")}
          />
        </Field>
      </div>
      <Field
        label="Notes"
        htmlFor={`${id}-notes`}
        error={errors.notes?.message}
        hint="Optional — invoice number, period, etc."
      >
        <Textarea id={`${id}-notes`} rows={3} {...form.register("notes")} />
      </Field>
      <SubmitBar isSubmitting={isSubmitting} label="Record payment" />
    </form>
  );
}

function CostForm({ isSubmitting, onSubmit }: FormProps) {
  const id = useId();
  const defaults: OperatingCostEntryValues = {
    category: "infrastructure",
    amount: "",
    cost_date: today(),
    description: "",
  };
  const form = useForm<OperatingCostEntryValues>({
    resolver: zodResolver(operatingCostEntrySchema),
    defaultValues: defaults,
  });
  const { errors } = form.formState;
  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={form.handleSubmit(async (v) => {
        const ok = await onSubmit({
          kind: "cost",
          payload: {
            category: v.category,
            amount: v.amount.trim(),
            cost_date: v.cost_date,
            description: v.description ?? "",
          },
        });
        if (ok) form.reset({ ...defaults, cost_date: today() });
      })}
    >
      <Field
        label="Category"
        htmlFor={`${id}-category`}
        error={errors.category?.message}
      >
        <Controller
          control={form.control}
          name="category"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={`${id}-category`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COST_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Amount"
          htmlFor={`${id}-amount`}
          error={errors.amount?.message}
        >
          <Input
            id={`${id}-amount`}
            inputMode="decimal"
            placeholder="0.00"
            className="tabular-nums"
            aria-invalid={Boolean(errors.amount)}
            {...form.register("amount")}
          />
        </Field>
        <Field
          label="Cost date"
          htmlFor={`${id}-date`}
          error={errors.cost_date?.message}
        >
          <Input
            id={`${id}-date`}
            type="date"
            max={today()}
            {...form.register("cost_date")}
          />
        </Field>
      </div>
      <Field
        label="Description"
        htmlFor={`${id}-desc`}
        error={errors.description?.message}
        hint="Optional — vendor, invoice, purpose."
      >
        <Textarea
          id={`${id}-desc`}
          rows={3}
          {...form.register("description")}
        />
      </Field>
      <SubmitBar isSubmitting={isSubmitting} label="Record cost" />
    </form>
  );
}

function CashForm({ isSubmitting, onSubmit }: FormProps) {
  const id = useId();
  const form = useForm<CashSnapshotEntryValues>({
    resolver: zodResolver(cashSnapshotEntrySchema),
    defaultValues: { amount: "", balance_date: today() },
  });
  const { errors } = form.formState;
  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={form.handleSubmit(async (v) => {
        const ok = await onSubmit({
          kind: "cash",
          payload: { amount: v.amount.trim(), balance_date: v.balance_date },
        });
        if (ok) form.reset({ amount: "", balance_date: today() });
      })}
    >
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Balance"
          htmlFor={`${id}-amount`}
          error={errors.amount?.message}
        >
          <Input
            id={`${id}-amount`}
            inputMode="decimal"
            placeholder="0.00"
            className="tabular-nums"
            aria-invalid={Boolean(errors.amount)}
            {...form.register("amount")}
          />
        </Field>
        <Field
          label="As of"
          htmlFor={`${id}-date`}
          error={errors.balance_date?.message}
        >
          <Input
            id={`${id}-date`}
            type="date"
            max={today()}
            {...form.register("balance_date")}
          />
        </Field>
      </div>
      <SubmitBar isSubmitting={isSubmitting} label="Record balance" />
    </form>
  );
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: FinanceRecordKind;
  onKindChange: (kind: FinanceRecordKind) => void;
  tenants: PlatformAdminTenant[];
  tenantsLoading: boolean;
  isSubmitting: boolean;
  onSubmit: (entry: FinanceEntryPayload) => Promise<boolean>;
};

export function FinanceEntrySheet({
  open,
  onOpenChange,
  kind,
  onKindChange,
  tenants,
  tenantsLoading,
  isSubmitting,
  onSubmit,
}: Props) {
  const copy = KIND_COPY[kind];
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md"
      >
        <SheetHeader className="space-y-4 pb-6 text-left">
          <OverviewSegmentedControl<FinanceRecordKind>
            label="Entry type"
            options={[
              { value: "payment", label: "Payment" },
              { value: "cost", label: "Cost" },
              { value: "cash", label: "Cash balance" },
            ]}
            value={kind}
            onChange={onKindChange}
          />
          <div className="space-y-1">
            <SheetTitle className="text-xl font-semibold tracking-tight">
              {copy.title}
            </SheetTitle>
            <SheetDescription>{copy.description}</SheetDescription>
          </div>
        </SheetHeader>
        <div className="flex-1 border-t border-foreground/[0.07] pt-6">
          {kind === "payment" ? (
            <PaymentForm
              tenants={tenants}
              tenantsLoading={tenantsLoading}
              isSubmitting={isSubmitting}
              onSubmit={onSubmit}
            />
          ) : kind === "cost" ? (
            <CostForm isSubmitting={isSubmitting} onSubmit={onSubmit} />
          ) : (
            <CashForm isSubmitting={isSubmitting} onSubmit={onSubmit} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
