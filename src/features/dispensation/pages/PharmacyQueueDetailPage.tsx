"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROUTES } from "@/constants/routes";
import { DetailPageLayout } from "@/features/app-shell/components/page-layout";
import { DispenseSelectedDialog } from "@/features/dispensation/components/DispenseSelectedDialog";
import { EditQueueLineDialog } from "@/features/dispensation/components/EditQueueLineDialog";
import { PharmacyQueueDetailHeader } from "@/features/dispensation/components/PharmacyQueueDetailHeader";
import { PharmacyQueueDetailTabs } from "@/features/dispensation/components/PharmacyQueueDetailTabs";
import { fetchDispensationQueueDetail } from "@/features/dispensation/services/dispensation.service";
import type {
  DispensationQueueDetail,
  DispensationQueueLine,
} from "@/features/dispensation/types/dispensation.types";
import {
  fetchSalesOrder,
  removeSalesOrderLine,
} from "@/features/sales-orders/services/sales-orders.service";
import type {
  SalesOrder,
  SalesOrderLine,
} from "@/features/sales-orders/types/sales-order.types";
import { isLineFullyDispensed } from "@/features/dispensation/utils/dispensation-qty";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type PharmacyQueueDetailPageProps = {
  salesOrderUuid: string;
};

export function PharmacyQueueDetailPage({
  salesOrderUuid,
}: PharmacyQueueDetailPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [detail, setDetail] = useState<DispensationQueueDetail | null>(null);
  const [salesOrder, setSalesOrder] = useState<SalesOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLineUuids, setSelectedLineUuids] = useState<string[]>([]);
  const [dispenseSelectedOpen, setDispenseSelectedOpen] = useState(false);
  const [lineToEdit, setLineToEdit] = useState<DispensationQueueLine | null>(null);
  const [lineToDelete, setLineToDelete] = useState<DispensationQueueLine | null>(null);
  const [isDeletingLine, setIsDeletingLine] = useState(false);

  const loadDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const queueDetail = await fetchDispensationQueueDetail(salesOrderUuid);
      const linkedSalesOrder = await fetchSalesOrder(queueDetail.id);
      setDetail(queueDetail);
      setSalesOrder(linkedSalesOrder);
    } catch (error) {
      toast({
        title: "Could not load order",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "error",
      });
      setDetail(null);
      setSalesOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, [salesOrderUuid, toast]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      await Promise.resolve();
      if (cancelled) {
        return;
      }
      await loadDetail();
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [loadDetail]);

  useEffect(() => {
    if (!detail) {
      setSelectedLineUuids([]);
      return;
    }

    setSelectedLineUuids(
      detail.lines
        .filter((line) => !isLineFullyDispensed(line))
        .map((line) => line.uuid),
    );
  }, [detail]);

  const selectedLines = useMemo(() => {
    if (!detail) {
      return [];
    }
    return detail.lines.filter((line) => selectedLineUuids.includes(line.uuid));
  }, [detail, selectedLineUuids]);

  const editableLine = useMemo<SalesOrderLine | null>(() => {
    if (!salesOrder || !lineToEdit) {
      return null;
    }
    return salesOrder.lines?.find((line) => line.id === lineToEdit.id) ?? null;
  }, [lineToEdit, salesOrder]);

  const canManageLines = salesOrder?.state === "draft";

  const handleDeleteLine = useCallback(async () => {
    if (!salesOrder || !lineToDelete) {
      return;
    }

    setIsDeletingLine(true);
    try {
      await removeSalesOrderLine(salesOrder.id, lineToDelete.id);
      toast({
        title: "Line deleted",
        description: `${lineToDelete.product_name} was removed from the sales order.`,
        variant: "success",
      });
      setLineToDelete(null);
      await loadDetail();
    } catch (error) {
      toast({
        title: "Could not delete line",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "error",
      });
    } finally {
      setIsDeletingLine(false);
    }
  }, [lineToDelete, loadDetail, salesOrder, toast]);

  if (isLoading) {
    return (
      <DetailPageLayout>
        <div className="px-6 py-6">
          <p className="text-sm text-brand-muted">Loading order…</p>
        </div>
      </DetailPageLayout>
    );
  }

  if (!detail || !salesOrder) {
    return (
      <DetailPageLayout>
        <div className="px-6 py-6">
          <p className="text-sm text-brand-muted">Order not found in queue.</p>
          <SecondaryButton
            type="button"
            className="mt-4"
            onClick={() => router.push(ROUTES.pharmacyQueue)}
          >
            Back to queue
          </SecondaryButton>
        </div>
      </DetailPageLayout>
    );
  }

  return (
    <DetailPageLayout data-testid="pharmacy-queue-detail-page">
      <PharmacyQueueDetailHeader
        detail={detail}
        actions={
          <PrimaryButton
            type="button"
            disabled={selectedLines.length === 0}
            title={
              selectedLines.length > 0
                ? undefined
                : "Select at least one line item to dispense."
            }
            onClick={() => setDispenseSelectedOpen(true)}
          >
            Dispense
          </PrimaryButton>
        }
      />
      <PharmacyQueueDetailTabs
        detail={detail}
        salesOrder={salesOrder}
        selectedLineUuids={selectedLineUuids}
        onSelectedLineUuidsChange={setSelectedLineUuids}
        canManageLines={canManageLines === true}
        onEdit={setLineToEdit}
        onDelete={setLineToDelete}
      />

      <DispenseSelectedDialog
        open={dispenseSelectedOpen}
        onOpenChange={setDispenseSelectedOpen}
        clinicId={detail.clinic_id}
        lines={selectedLines}
        onDispensed={() => void loadDetail()}
      />

      <EditQueueLineDialog
        open={lineToEdit !== null}
        onOpenChange={(open) => {
          if (!open) {
            setLineToEdit(null);
          }
        }}
        salesOrderId={salesOrder.id}
        line={editableLine}
        onSaved={() => void loadDetail()}
      />

      <Dialog
        open={lineToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeletingLine) {
            setLineToDelete(null);
          }
        }}
      >
        <DialogContent className={cn("max-w-md", appFont.className)}>
          <DialogHeader>
            <DialogTitle>Delete line item?</DialogTitle>
            <DialogDescription>
              Remove {lineToDelete?.product_name || "this line item"} from the linked sales
              order.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <SecondaryButton
              type="button"
              disabled={isDeletingLine}
              onClick={() => setLineToDelete(null)}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="button"
              disabled={isDeletingLine}
              onClick={() => void handleDeleteLine()}
            >
              {isDeletingLine ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DetailPageLayout>
  );
}
