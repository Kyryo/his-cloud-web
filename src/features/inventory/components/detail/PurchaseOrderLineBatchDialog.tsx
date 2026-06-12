"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import {
  purchaseOrderLineBatchSchema,
  toPurchaseOrderLineBatchFormValues,
  type PurchaseOrderLineBatchFormValues,
} from "@/features/inventory/schemas/purchase-order-line-batch.schema";
import {
  createInventoryBatch,
  fetchInventoryBatches,
  updateInventoryBatch,
} from "@/features/inventory/services/batches.service";
import type { PurchaseOrderLineDraft } from "@/features/inventory/types/purchase-order-line-draft";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

type PurchaseOrderLineBatchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  line: PurchaseOrderLineDraft | null;
  tenantId: number;
  vendorName: string;
  onSaved: (patch: Partial<PurchaseOrderLineDraft>) => Promise<void>;
};

type BatchDialogTab = "batch" | "details";

async function resolveBatchUuid(
  batchId: number,
  odooProductId: number,
): Promise<string | null> {
  const response = await fetchInventoryBatches({
    odoo_product_id: odooProductId,
    is_active: true,
  });
  const match = response.results.find((batch) => batch.id === batchId);
  return match?.uuid ?? null;
}

export function PurchaseOrderLineBatchDialog({
  open,
  onOpenChange,
  line,
  tenantId,
  vendorName,
  onSaved,
}: PurchaseOrderLineBatchDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<BatchDialogTab>("batch");
  const [batchUuid, setBatchUuid] = useState<string | null>(null);
  const [isResolvingBatch, setIsResolvingBatch] = useState(false);

  const form = useForm<PurchaseOrderLineBatchFormValues>({
    resolver: zodResolver(purchaseOrderLineBatchSchema),
    defaultValues: toPurchaseOrderLineBatchFormValues(),
  });

  useEffect(() => {
    if (!open || !line) {
      return;
    }

    setActiveTab("batch");
    form.reset(
      toPurchaseOrderLineBatchFormValues({
        batch_number: line.batchNumber ?? "",
        expiry_date: line.expiry_date ?? "",
        manufacture_date: line.manufactureDate ?? "",
        supplier: vendorName.trim(),
        notes: line.notes ?? "",
      }),
    );

    if (line.batchUuid) {
      setBatchUuid(line.batchUuid);
      return;
    }

    if (!line.batch || !line.odoo_product_id) {
      setBatchUuid(null);
      return;
    }

    let cancelled = false;
    setIsResolvingBatch(true);

    void (async () => {
      try {
        const uuid = await resolveBatchUuid(line.batch!, line.odoo_product_id!);
        if (!cancelled) {
          setBatchUuid(uuid);
        }
      } catch {
        if (!cancelled) {
          setBatchUuid(null);
        }
      } finally {
        if (!cancelled) {
          setIsResolvingBatch(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [form, line, open, vendorName]);

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!line?.odoo_product_id) {
      toast({
        variant: "error",
        title: "Product required",
        description: "Choose a product on the line before adding batch details.",
      });
      return;
    }

    try {
      const batchPayload = {
        tenant: tenantId,
        odoo_product_id: line.odoo_product_id,
        batch_number: values.batch_number.trim(),
        expiry_date: values.expiry_date.trim(),
        manufacture_date: values.manufacture_date?.trim() || null,
        supplier: vendorName.trim() || null,
        notes: values.notes?.trim() || null,
      };

      const batch = batchUuid
        ? await updateInventoryBatch(batchUuid, batchPayload)
        : await createInventoryBatch(batchPayload);

      await onSaved({
        batch: batch.id,
        batchUuid: batch.uuid,
        batchNumber: batch.batch_number,
        expiry_date: values.expiry_date.trim(),
        manufactureDate: batch.manufacture_date ?? (values.manufacture_date?.trim() || null),
        supplier: batch.supplier ?? (vendorName.trim() || null),
        notes: values.notes?.trim() || null,
      });

      toast({
        variant: "success",
        title: batchUuid ? "Batch updated" : "Batch added",
        description: `${batch.batch_number} was saved and linked to this line item.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not save batch",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  });

  const isSubmitting = form.formState.isSubmitting;
  const productLabel = line?.productName ?? (line?.odoo_product_id ? `Product #${line.odoo_product_id}` : "Line item");
  const tabs = [
    { id: "batch", label: "Batch" },
    { id: "details", label: "Details" },
  ];

  return (
    <TabbedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Line batch & expiry"
      description={`Record batch and expiry details for ${productLabel}.`}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tabId) => {
        if (tabId === "batch" || tabId === "details") {
          setActiveTab(tabId);
        }
      }}
      className={appFont.className}
      data-testid="purchase-order-line-batch-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            disabled={isSubmitting || isResolvingBatch}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={isSubmitting || isResolvingBatch}
            onClick={() => void handleSubmit()}
            data-testid="purchase-order-line-batch-submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save batch"
            )}
          </PrimaryButton>
        </>
      }
    >
      <Form {...form}>
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          {activeTab === "batch" ? (
            <>
              <FormField
                control={form.control}
                name="batch_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. LOT-2026-001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="manufacture_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacture date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : (
            <>
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <FormControl>
                      <Input {...field} disabled placeholder="Supplier from purchase order" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={4}
                        className="flex min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </form>
      </Form>
    </TabbedDialog>
  );
}
