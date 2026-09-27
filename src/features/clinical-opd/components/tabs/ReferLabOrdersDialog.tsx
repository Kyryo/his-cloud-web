"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateClinicalReferral,
  useReferralReceivingClinics,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import type { EncounterClinicalOrder } from "@/features/clinical-opd/types/clinical-opd.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import { appFont } from "@/lib/fonts";

const FORM_ID = "opd-refer-lab-orders-form";

type ReferLabOrdersDialogProps = {
  visitUuid: string;
  encounterUuid: string;
  orders: EncounterClinicalOrder[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ReferLabOrdersDialog({
  visitUuid,
  encounterUuid,
  orders,
  open,
  onOpenChange,
}: ReferLabOrdersDialogProps) {
  const { toast } = useToast();
  const { data: clinics = [], isLoading: isLoadingClinics } =
    useReferralReceivingClinics(visitUuid, encounterUuid, { enabled: open });
  const createReferral = useCreateClinicalReferral(visitUuid, encounterUuid);
  const [clinicUuid, setClinicUuid] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedUuids, setSelectedUuids] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eligibleOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.item_type === "LABORATORY" &&
          order.status !== "CANCELLED" &&
          order.status !== "REFERRED" &&
          order.is_active !== false,
      ),
    [orders],
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    setSelectedUuids(eligibleOrders.map((order) => order.uuid));
    setClinicUuid("");
    setNotes("");
  }, [open, eligibleOrders]);

  const toggleOrder = (uuid: string) => {
    setSelectedUuids((current) =>
      current.includes(uuid)
        ? current.filter((item) => item !== uuid)
        : [...current, uuid],
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!clinicUuid || selectedUuids.length === 0) {
      return;
    }
    try {
      setIsSubmitting(true);
      await createReferral.mutateAsync({
        receiving_clinic_uuid: clinicUuid,
        source_visit_order_uuids: selectedUuids,
        notes: notes.trim(),
      });
      toast({
        title: "Lab referral sent",
        description: "Selected laboratory orders were referred to the receiving clinic.",
        variant: "success",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Could not send referral",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : "Unable to refer the selected laboratory orders.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Refer lab orders"
      description="Send selected laboratory tests to another clinic in this organization. Charges and fulfillment move to the receiving clinic."
      className={cn("sm:max-w-lg", appFont.className)}
      data-testid="opd-refer-lab-orders-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            form={FORM_ID}
            disabled={
              isSubmitting ||
              !clinicUuid ||
              selectedUuids.length === 0 ||
              clinics.length === 0
            }
            data-testid="opd-refer-lab-orders-submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Sending…
              </>
            ) : (
              "Send referral"
            )}
          </PrimaryButton>
        </>
      }
    >
      <form id={FORM_ID} className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
        <div className="space-y-2">
          <Label htmlFor="opd-refer-receiving-clinic">Receiving clinic</Label>
          <Select
            value={clinicUuid}
            onValueChange={setClinicUuid}
            disabled={isLoadingClinics || clinics.length === 0}
          >
            <SelectTrigger
              id="opd-refer-receiving-clinic"
              data-testid="opd-refer-receiving-clinic"
            >
              <SelectValue
                placeholder={
                  isLoadingClinics
                    ? "Loading clinics…"
                    : clinics.length === 0
                      ? "No laboratory clinics available"
                      : "Select clinic"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {clinics.map((clinic) => (
                <SelectItem key={clinic.uuid} value={clinic.uuid}>
                  {clinic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tests to refer</Label>
          {eligibleOrders.length === 0 ? (
            <p className="text-sm text-brand-muted">
              No active laboratory orders are available to refer.
            </p>
          ) : (
            <ul
              className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-dash-border/80 p-2"
              data-testid="opd-refer-lab-orders-list"
            >
              {eligibleOrders.map((order) => {
                const checked = selectedUuids.includes(order.uuid);
                return (
                  <li key={order.uuid}>
                    <label className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 hover:bg-dash-muted/40">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={checked}
                        onChange={() => toggleOrder(order.uuid)}
                        data-testid={`opd-refer-order-${order.uuid}`}
                      />
                      <span className="text-sm text-brand-navy">
                        {order.description || order.item_type_display}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="opd-refer-notes">Notes (optional)</Label>
          <Textarea
            id="opd-refer-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
            placeholder="Clinical context for the receiving laboratory"
            data-testid="opd-refer-notes"
          />
        </div>
      </form>
    </SectionedDialog>
  );
}
