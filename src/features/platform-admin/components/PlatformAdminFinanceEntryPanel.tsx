"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  createPlatformAdminCashSnapshot,
  createPlatformAdminOperatingCost,
  createPlatformAdminTenantPayment,
} from "@/features/platform-admin/services/platform-admin.service";
import type {
  PlatformAdminOperatingCostCategory,
  PlatformAdminTenant,
} from "@/features/platform-admin/types/platform-admin.types";

type PlatformAdminFinanceEntryPanelProps = {
  tenants: PlatformAdminTenant[];
  onRecorded: () => void;
};

const COST_CATEGORIES: Array<{
  value: PlatformAdminOperatingCostCategory;
  label: string;
}> = [
  { value: "infrastructure", label: "Infrastructure" },
  { value: "payroll", label: "Payroll" },
  { value: "software", label: "Software" },
  { value: "support", label: "Support" },
  { value: "other", label: "Other" },
];

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function PlatformAdminFinanceEntryPanel({
  tenants,
  onRecorded,
}: PlatformAdminFinanceEntryPanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [paymentTenantId, setPaymentTenantId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(todayInputValue());
  const [paymentNotes, setPaymentNotes] = useState("");
  const [costCategory, setCostCategory] =
    useState<PlatformAdminOperatingCostCategory>("other");
  const [costAmount, setCostAmount] = useState("");
  const [costDate, setCostDate] = useState(todayInputValue());
  const [costDescription, setCostDescription] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [cashDate, setCashDate] = useState(todayInputValue());

  async function handlePaymentSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!paymentTenantId || !paymentAmount) {
      toast.error("Select a tenant and enter an amount.");
      return;
    }

    setIsSaving(true);
    try {
      await createPlatformAdminTenantPayment({
        tenant: Number(paymentTenantId),
        amount: paymentAmount,
        payment_date: paymentDate,
        notes: paymentNotes,
      });
      toast.success("Tenant payment recorded.");
      setPaymentAmount("");
      setPaymentNotes("");
      onRecorded();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to record payment.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCostSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!costAmount) {
      toast.error("Enter a cost amount.");
      return;
    }

    setIsSaving(true);
    try {
      await createPlatformAdminOperatingCost({
        category: costCategory,
        amount: costAmount,
        cost_date: costDate,
        description: costDescription,
      });
      toast.success("Operating cost recorded.");
      setCostAmount("");
      setCostDescription("");
      onRecorded();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to record cost.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCashSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!cashAmount) {
      toast.error("Enter a cash balance.");
      return;
    }

    setIsSaving(true);
    try {
      await createPlatformAdminCashSnapshot({
        balance_date: cashDate,
        amount: cashAmount,
      });
      toast.success("Cash balance recorded.");
      setCashAmount("");
      onRecorded();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to record cash balance.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tenant payment</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handlePaymentSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="payment-tenant">Tenant</Label>
              <Select value={paymentTenantId} onValueChange={setPaymentTenantId}>
                <SelectTrigger id="payment-tenant">
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={String(tenant.id)}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payment-amount">Amount</Label>
              <Input
                id="payment-amount"
                type="number"
                min="0"
                step="0.01"
                value={paymentAmount}
                onChange={(event) => setPaymentAmount(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payment-date">Payment date</Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(event) => setPaymentDate(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payment-notes">Notes</Label>
              <Textarea
                id="payment-notes"
                rows={2}
                value={paymentNotes}
                onChange={(event) => setPaymentNotes(event.target.value)}
              />
            </div>
            <Button type="submit" disabled={isSaving} className="w-full">
              Record payment
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Operating cost</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleCostSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="cost-category">Category</Label>
              <Select
                value={costCategory}
                onValueChange={(value) =>
                  setCostCategory(value as PlatformAdminOperatingCostCategory)
                }
              >
                <SelectTrigger id="cost-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COST_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cost-amount">Amount</Label>
              <Input
                id="cost-amount"
                type="number"
                min="0"
                step="0.01"
                value={costAmount}
                onChange={(event) => setCostAmount(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cost-date">Cost date</Label>
              <Input
                id="cost-date"
                type="date"
                value={costDate}
                onChange={(event) => setCostDate(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cost-description">Description</Label>
              <Textarea
                id="cost-description"
                rows={2}
                value={costDescription}
                onChange={(event) => setCostDescription(event.target.value)}
              />
            </div>
            <Button type="submit" disabled={isSaving} className="w-full">
              Record cost
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cash balance</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleCashSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="cash-amount">Balance</Label>
              <Input
                id="cash-amount"
                type="number"
                min="0"
                step="0.01"
                value={cashAmount}
                onChange={(event) => setCashAmount(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cash-date">As of date</Label>
              <Input
                id="cash-date"
                type="date"
                value={cashDate}
                onChange={(event) => setCashDate(event.target.value)}
              />
            </div>
            <p className="text-xs text-brand-muted">
              Used with burn rate to calculate runway.
            </p>
            <Button type="submit" disabled={isSaving} className="w-full">
              Record balance
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
