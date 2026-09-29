"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
} from "@/features/app-shell/components/page-layout";
import { useOhRecallsData } from "@/features/occupational-health/hooks/use-occupational-health";
import {
  createFoodHandlerClearance,
  createOhImmunisation,
  createPpeFitTest,
  createSickLeaveCertificate,
} from "@/features/occupational-health/services/oh.service";
import type { Customer } from "@/features/customers/types/customer.types";
import { useUser } from "@/providers/user-provider";
import { useToast } from "@/providers/toast-provider";

const RECALL_TABS = [
  { id: "immunisations", label: "Immunisations" },
  { id: "ppe", label: "PPE fit" },
  { id: "food", label: "Food handler" },
  { id: "sick", label: "Sick leave" },
] as const;

type RecallTabId = (typeof RECALL_TABS)[number]["id"];

type OhRecallsPanelProps = {
  customer: Customer;
  encounterId?: number | null;
};

export function OhRecallsPanel({ customer, encounterId }: OhRecallsPanelProps) {
  const { userData } = useUser();
  const { toast } = useToast();
  const recalls = useOhRecallsData(customer.id);
  const hasAccess = (userData?.groups ?? []).includes("OccupationalHealth");
  const [activeTab, setActiveTab] = useState<RecallTabId>("immunisations");

  const [vaccineCode, setVaccineCode] = useState("");
  const [ppeType, setPpeType] = useState("");
  const [sickDays, setSickDays] = useState("1");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!hasAccess) {
    return null;
  }

  async function handleImmunisation(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await createOhImmunisation({
        customer: customer.id,
        vaccine_code: vaccineCode,
        status: "current",
        notes,
      });
      setVaccineCode("");
      setNotes("");
      toast({ title: "Immunisation recorded" });
      recalls.refetchAll();
    } catch (error) {
      toast({
        title: "Could not save immunisation",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePpe(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await createPpeFitTest({
        customer: customer.id,
        ppe_type: ppeType,
        status: "due",
        notes,
      });
      setPpeType("");
      setNotes("");
      toast({ title: "PPE fit test recorded" });
      recalls.refetchAll();
    } catch (error) {
      toast({
        title: "Could not save PPE fit test",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFoodHandler(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await createFoodHandlerClearance({
        customer: customer.id,
        status: "pending",
        notes,
      });
      setNotes("");
      toast({ title: "Food handler clearance recorded" });
      recalls.refetchAll();
    } catch (error) {
      toast({
        title: "Could not save food handler clearance",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSickLeave(event: React.FormEvent) {
    event.preventDefault();
    if (!userData?.id) {
      return;
    }
    setIsSubmitting(true);
    try {
      await createSickLeaveCertificate({
        customer: customer.id,
        encounter: encounterId ?? null,
        days: Number(sickDays),
        issued_at: new Date().toISOString(),
        clinician: userData.id,
      });
      toast({ title: "Sick leave certificate recorded" });
      recalls.refetchAll();
    } catch (error) {
      toast({
        title: "Could not save sick leave certificate",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-4" data-testid="oh-recalls-panel">
      <div>
        <h3 className="text-sm font-semibold text-brand-navy">
          Recalls & sick leave
        </h3>
        <p className="text-xs text-brand-muted">
          Immunisation, PPE, food-handler recalls, and sick leave for this
          client.
        </p>
      </div>

      {recalls.isLoading ? (
        <p className="text-sm text-brand-muted">Loading recalls…</p>
      ) : (
        <div className="space-y-4">
          <DetailPageTabsNavSection aria-label="Recall sections">
            {RECALL_TABS.map((tab) => (
              <DetailPageTabNavItem
                key={tab.id}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </DetailPageTabNavItem>
            ))}
          </DetailPageTabsNavSection>

          {activeTab === "immunisations" ? (
            <div className="space-y-4">
              <form
                onSubmit={(event) => void handleImmunisation(event)}
                className="grid gap-3 rounded-xl border border-brand-border bg-white p-4 md:grid-cols-2"
              >
                <div className="space-y-2">
                  <Label htmlFor="oh-vaccine-code">Vaccine code</Label>
                  <Input
                    id="oh-vaccine-code"
                    value={vaccineCode}
                    onChange={(event) => setVaccineCode(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="oh-imm-notes">Notes</Label>
                  <Textarea
                    id="oh-imm-notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={isSubmitting}>
                    Add immunisation
                  </Button>
                </div>
              </form>
              <RecallTable
                headers={["Vaccine", "Status", "Expiry"]}
                rows={recalls.immunisations.map((row) => [
                  row.vaccine_code,
                  row.status,
                  row.expiry_date ?? "—",
                ])}
              />
            </div>
          ) : null}

          {activeTab === "ppe" ? (
            <div className="space-y-4">
              <form
                onSubmit={(event) => void handlePpe(event)}
                className="grid gap-3 rounded-xl border border-brand-border bg-white p-4 md:grid-cols-2"
              >
                <div className="space-y-2">
                  <Label htmlFor="oh-ppe-type">PPE type</Label>
                  <Input
                    id="oh-ppe-type"
                    value={ppeType}
                    onChange={(event) => setPpeType(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="oh-ppe-notes">Notes</Label>
                  <Textarea
                    id="oh-ppe-notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={isSubmitting}>
                    Add PPE fit test
                  </Button>
                </div>
              </form>
              <RecallTable
                headers={["PPE", "Status", "Expiry"]}
                rows={recalls.ppeFitTests.map((row) => [
                  row.ppe_type,
                  row.status,
                  row.expiry_date ?? "—",
                ])}
              />
            </div>
          ) : null}

          {activeTab === "food" ? (
            <div className="space-y-4">
              <form
                onSubmit={(event) => void handleFoodHandler(event)}
                className="grid gap-3 rounded-xl border border-brand-border bg-white p-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="oh-food-notes">Notes</Label>
                  <Textarea
                    id="oh-food-notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={2}
                  />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  Add food handler clearance
                </Button>
              </form>
              <RecallTable
                headers={["Status", "Cleared", "Expiry"]}
                rows={recalls.foodHandlerClearances.map((row) => [
                  row.status,
                  row.cleared_at ?? "—",
                  row.expiry_date ?? "—",
                ])}
              />
            </div>
          ) : null}

          {activeTab === "sick" ? (
            <div className="space-y-4">
              <form
                onSubmit={(event) => void handleSickLeave(event)}
                className="grid gap-3 rounded-xl border border-brand-border bg-white p-4 md:grid-cols-2"
              >
                <div className="space-y-2">
                  <Label htmlFor="oh-sick-days">Days</Label>
                  <Input
                    id="oh-sick-days"
                    type="number"
                    min={1}
                    value={sickDays}
                    onChange={(event) => setSickDays(event.target.value)}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={isSubmitting}>
                    Issue sick leave certificate
                  </Button>
                </div>
              </form>
              <RecallTable
                headers={["Days", "Issued", "Expected return"]}
                rows={recalls.sickLeaveCertificates.map((row) => [
                  String(row.days),
                  row.issued_at.slice(0, 10),
                  row.expected_return ?? "—",
                ])}
              />
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

function RecallTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-brand-border bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-brand-border bg-brand-surface text-brand-muted">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-2 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                className="px-4 py-3 text-brand-muted"
              >
                No records yet.
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-2 capitalize">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
