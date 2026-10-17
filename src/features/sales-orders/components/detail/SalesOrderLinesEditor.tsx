"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useMemo,
  useRef,
  useState,
  useEffect,
  type MutableRefObject,
  type ReactNode,
} from "react";

import { LineItemsEmptyState } from "@/components/detail/line-items-empty-state";
import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBanner } from "@/components/ui/status-banner";
import {
  SalesOrderEditableLineList,
  SalesOrderReadOnlyLineList,
} from "@/features/sales-orders/components/detail/SalesOrderLineList";
import { AdjustLineSplitDialog } from "@/features/sales-orders/components/detail/AdjustLineSplitDialog";
import { AssignSalesOrderLineTeethDialog } from "@/features/sales-orders/components/detail/AssignSalesOrderLineTeethDialog";
import {
  fetchInventoryProductPricelists,
  fetchProductTariffCodes,
} from "@/features/inventory/services/inventory.service";
import type {
  InventoryProductPricelistItem,
  ProductTariffCode,
} from "@/features/inventory/types/inventory.types";
import {
  LinePricingBreakdownDialog,
  shouldShowLineOdontogramTab,
} from "@/features/sales-orders/components/detail/LinePricingBreakdownDialog";
import { NonPayableLineDialog } from "@/features/sales-orders/components/detail/NonPayableLineDialog";
import type { SalesOrderLineProductSelection } from "@/features/sales-orders/components/detail/SalesOrderLineProductPicker";
import { SalesOrderPendingChangesBar } from "@/features/sales-orders/components/detail/SalesOrderPendingChangesBar";
import { SalesOrderProviderSelector } from "@/features/sales-orders/components/detail/SalesOrderProviderSelector";
import { useSalesOrderLinesEditor } from "@/features/sales-orders/hooks/use-sales-order-lines-editor";
import {
  mergeSalesOrderLines,
  setSalesOrderLineDentalTeeth,
  setSalesOrderLinePayability,
  splitSalesOrderLines,
} from "@/features/sales-orders/services/sales-orders.service";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import type { SalesOrderLineDraft } from "@/features/sales-orders/types/sales-order-line-draft";
import {
  orderHasPricelist,
  resolveInitialLineIsPayable,
} from "@/features/sales-orders/utils/sales-order-line-payability";
import { canEditSalesOrderLines } from "@/features/sales-orders/utils/sales-order-status";
import {
  mergePreviewForSelection,
  savedSelectableLines,
} from "@/features/sales-orders/utils/sales-order-line-selection";
import { ROUTES } from "@/constants/routes";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { getLineSplitMismatch } from "@/features/sales-orders/utils/sales-order-line-split-mismatch";
import { useEnterEscapeShortcuts } from "@/hooks/use-enter-escape-shortcuts";
import { useToast } from "@/providers/toast-provider";

type SalesOrderLinesEditorProps = {
  order: SalesOrder;
  isActive: boolean;
  onOrderUpdated: (order: SalesOrder) => void;
  onSplitMismatchChange?: (hasMismatch: boolean) => void;
};

function findOrderPricelistMembership(
  order: SalesOrder,
  memberships: InventoryProductPricelistItem[],
): InventoryProductPricelistItem | undefined {
  if (order.pricelist_uuid) {
    const byUuid = memberships.find(
      (item) => item.pricelist_uuid === order.pricelist_uuid,
    );
    if (byUuid) {
      return byUuid;
    }
  }

  const pricelistName = order.pricelist_name?.trim();
  if (pricelistName) {
    return memberships.find(
      (item) => item.pricelist_name?.trim() === pricelistName,
    );
  }

  return undefined;
}

function handleSalesOrderLineProductSelect(
  lineKey: string,
  selection: SalesOrderLineProductSelection,
  options: {
    order: SalesOrder;
    selectionTokenByLineKeyRef: MutableRefObject<Map<string, number>>;
    updateLine: (
      key: string,
      patch: Partial<SalesOrderLineDraft>,
    ) => void;
  },
) {
  const { order, selectionTokenByLineKeyRef, updateLine } = options;
  const nextToken = (selectionTokenByLineKeyRef.current.get(lineKey) ?? 0) + 1;
  selectionTokenByLineKeyRef.current.set(lineKey, nextToken);

  const pricePatch = (() => {
    const fixedPrice = selection.fixed_price?.trim();
    if (fixedPrice) {
      return { price_unit: fixedPrice, priceUnitOverridden: false };
    }

    const listPrice = selection.list_price;
    if (listPrice != null && listPrice !== "") {
      return {
        price_unit: String(listPrice),
        priceUnitOverridden: false,
      };
    }

    return { price_unit: "", priceUnitOverridden: false };
  })();

  const initialIsPayable = resolveInitialLineIsPayable(
    order,
    Boolean(selection.fixed_price?.trim()),
  );

  updateLine(lineKey, {
    product_uuid: selection.product_uuid,
    product_id: selection.product_id,
    productName: selection.productName,
    tariff_code: null,
    ...(initialIsPayable !== undefined ? { is_payable: initialIsPayable } : {}),
    ...pricePatch,
  });

  void (async () => {
    const isStillCurrentSelection = () =>
      selectionTokenByLineKeyRef.current.get(lineKey) === nextToken;

    const needsPricelistPrice =
      orderHasPricelist(order) && !selection.fixed_price?.trim();

    try {
      if (needsPricelistPrice) {
        const memberships = await fetchInventoryProductPricelists(
          selection.product_uuid,
        );
        if (!isStillCurrentSelection()) {
          return;
        }

        const membership = findOrderPricelistMembership(order, memberships);
        const fixedPrice =
          membership?.fixed_price != null
            ? String(membership.fixed_price).trim()
            : "";
        updateLine(lineKey, {
          ...(fixedPrice
            ? {
                price_unit: fixedPrice,
                priceUnitOverridden: false,
                is_payable: true,
              }
            : { is_payable: false }),
        });
      }

      if (!order.insurance_scheme_uuid) {
        return;
      }

      const codes = await fetchProductTariffCodes(selection.product_uuid);
      if (!isStillCurrentSelection()) {
        return;
      }

      const match = codes.find(
        (code: ProductTariffCode) => code.scheme_uuid === order.insurance_scheme_uuid,
      );
      if (match?.tariff_code) {
        updateLine(lineKey, { tariff_code: match.tariff_code });
      }
    } catch {
      // Best-effort prefill only.
    }
  })();
}

function SalesOrderLinesToolbar({
  order,
  canEdit,
  onOrderUpdated,
  children,
}: {
  order: SalesOrder;
  canEdit: boolean;
  onOrderUpdated: (order: SalesOrder) => void;
  children?: ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-start gap-2">
      <SalesOrderProviderSelector
        order={order}
        canEdit={canEdit}
        onOrderUpdated={onOrderUpdated}
        className="shrink-0"
      />
      {children}
    </div>
  );
}

function AddLineItemButton({
  disabled,
  disabledReason,
  onClick,
}: {
  disabled: boolean;
  disabledReason?: string;
  onClick: () => void;
}) {
  return (
    <SecondaryButton
      type="button"
      disabled={disabled}
      title={disabledReason}
      onClick={onClick}
      data-testid="add-sales-order-line-item-button"
    >
      <Plus className="size-4" aria-hidden="true" />
      Add line item
    </SecondaryButton>
  );
}

export function SalesOrderLinesEditor({
  order,
  isActive,
  onOrderUpdated,
  onSplitMismatchChange,
}: SalesOrderLinesEditorProps) {
  const { toast } = useToast();
  const router = useRouter();
  const canEdit = canEditSalesOrderLines(order.state);
  const selectionTokenByLineKeyRef = useRef<Map<string, number>>(new Map());
  const [breakdownLineId, setBreakdownLineId] = useState<number | null>(null);
  const [splitDialogLineKey, setSplitDialogLineKey] = useState<string | null>(null);
  const [isSavingTeeth, setIsSavingTeeth] = useState(false);
  const [nonPayableLineId, setNonPayableLineId] = useState<number | null>(null);
  const [selectedLineIds, setSelectedLineIds] = useState<number[]>([]);
  const [confirmAction, setConfirmAction] = useState<"split" | "merge" | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSavingPayability, setIsSavingPayability] = useState(false);

  const editor = useSalesOrderLinesEditor({
    order,
    canEdit,
    onOrderUpdated,
    onError: (message) => {
      toast({ variant: "error", title: "Could not update line items", description: message });
    },
  });

  useEffect(() => {
    onSplitMismatchChange?.(editor.splitMismatchKeys.size > 0);
  }, [editor.splitMismatchKeys, onSplitMismatchChange]);

  const splitDialogLine =
    editor.draftLines.find((line) => line.key === splitDialogLineKey) ?? null;
  const firstMismatchKey = editor.draftLines.find((line) =>
    editor.splitMismatchKeys.has(line.key),
  )?.key;

  useEnterEscapeShortcuts({
    enabled: isActive && canEdit && editor.hasPendingChanges,
    isBusy: editor.isSaving,
    ignoreWhenDialogOpen: true,
    onEnter: editor.saveChanges,
    onEscape: editor.discardChanges,
  });

  const selectedLines = useMemo(
    () =>
      savedSelectableLines(editor.draftLines).filter(
        (line) => line.id != null && selectedLineIds.includes(line.id),
      ),
    [editor.draftLines, selectedLineIds],
  );
  const selectedSavedIds = selectedLines.map((line) => line.id as number);
  const mergePreview = mergePreviewForSelection(editor.draftLines, selectedSavedIds);
  const canChangeLines = canEdit && order.invoice_status !== "invoiced";

  const breakdownLine =
    order.lines?.find((line) => line.id === breakdownLineId) ?? null;
  const nonPayableLine =
    order.lines?.find((line) => line.id === nonPayableLineId) ?? null;

  if (!isActive) {
    return null;
  }

  if (!canEdit) {
    const lines = order.lines ?? [];

    if (lines.length === 0) {
      return (
        <LineItemsEmptyState
          title="No line items"
          description="This sales order does not have any line items."
          data-testid="sales-order-lines-empty-state"
        />
      );
    }

    return (
      <>
        <SalesOrderLinesToolbar
          order={order}
          canEdit={false}
          onOrderUpdated={onOrderUpdated}
        />
        <SalesOrderReadOnlyLineList
          order={order}
          onNonPayableClick={setNonPayableLineId}
        />
        <NonPayableLineDialog
          open={nonPayableLineId != null}
          onOpenChange={(open) => {
            if (!open) {
              setNonPayableLineId(null);
            }
          }}
          order={order}
          line={nonPayableLine}
          canEdit={false}
          onOrderUpdated={onOrderUpdated}
        />
      </>
    );
  }

  async function confirmLineAction() {
    if (!confirmAction) {
      return;
    }

    setIsConfirming(true);
    try {
      if (confirmAction === "split") {
        const created = await splitSalesOrderLines(order.id, selectedSavedIds);
        setConfirmAction(null);
        setSelectedLineIds([]);
        router.push(ROUTES.salesOrderDetail(created.uuid || created.id));
        return;
      }

      const updated = await mergeSalesOrderLines(
        order.id,
        mergePreview?.lineIds ?? selectedSavedIds,
      );
      onOrderUpdated(updated);
      setSelectedLineIds([]);
      setConfirmAction(null);
      toast({
        variant: "success",
        title: "Lines merged",
        description: "Quantity and pricing were updated for the combined line.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: confirmAction === "split" ? "Could not create order" : "Could not merge lines",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setIsConfirming(false);
    }
  }

  const hasRows = editor.draftLines.length > 0;
  const addDisabled =
    editor.isSaving || editor.splitMismatchKeys.size > 0;
  const addDisabledReason =
    editor.splitMismatchKeys.size > 0
      ? "Resolve client/insurance split mismatch first"
      : undefined;
  const addLineButton = (
    <AddLineItemButton
      disabled={addDisabled}
      disabledReason={addDisabledReason}
      onClick={editor.addLine}
    />
  );

  return (
    <>
      <SalesOrderLinesToolbar
        order={order}
        canEdit={canEdit}
        onOrderUpdated={onOrderUpdated}
      >
        <SecondaryButton
          type="button"
          size="sm"
          disabled={!canChangeLines || selectedSavedIds.length === 0 || isConfirming}
          onClick={() => setConfirmAction("split")}
          data-testid="sales-order-new-order"
        >
          New order
        </SecondaryButton>
        <SecondaryButton
          type="button"
          size="sm"
          disabled={!canChangeLines || mergePreview == null || isConfirming}
          onClick={() => setConfirmAction("merge")}
          data-testid="sales-order-merge-lines"
        >
          Merge
        </SecondaryButton>
      </SalesOrderLinesToolbar>

      {!hasRows ? (
        <LineItemsEmptyState
          data-testid="sales-order-lines-empty-state"
          action={addLineButton}
        />
      ) : (
        <>
          {editor.splitMismatchKeys.size > 0 ? (
            <StatusBanner
              variant="warning"
              message="Client/insurance split doesn't match the new line total."
              className="mb-4"
            >
              <SecondaryButton
                type="button"
                size="sm"
                className="mt-2"
                onClick={() => {
                  if (firstMismatchKey) {
                    setSplitDialogLineKey(firstMismatchKey);
                  }
                }}
              >
                Adjust split
              </SecondaryButton>
            </StatusBanner>
          ) : null}

          <SalesOrderEditableLineList
            order={order}
            lines={editor.draftLines}
            editingRowKey={editor.editingRowKey}
            activeRowKey={editor.activeRowKey}
            isSaving={editor.isSaving}
            footerAction={addLineButton}
            onEdit={(key) => {
              editor.setEditingRowKey(key);
              editor.setActiveRowKey(key);
            }}
            onActivate={editor.setActiveRowKey}
            onUpdate={editor.updateLine}
            onSelectProduct={(key, selection) => {
              handleSalesOrderLineProductSelect(key, selection, {
                order,
                selectionTokenByLineKeyRef,
                updateLine: editor.updateLine,
              });
            }}
            onRemove={editor.removeLine}
            onViewDetails={setBreakdownLineId}
            onNonPayableClick={setNonPayableLineId}
            onPriceBlur={(key) => {
              const line = editor.draftLines.find((item) => item.key === key);
              if (line && getLineSplitMismatch(line)) {
                setSplitDialogLineKey(key);
              }
            }}
            selectedLineIds={selectedSavedIds}
            onSelectedLineIdsChange={setSelectedLineIds}
          />
        </>
      )}

      {editor.hasPendingChanges ? (
        <SalesOrderPendingChangesBar
          isSaving={editor.isSaving}
          saveDisabled={editor.splitMismatchKeys.size > 0}
          saveDisabledReason="Resolve client/insurance split mismatch first"
          onSave={() => void editor.saveChanges()}
          onDiscard={editor.discardChanges}
        />
      ) : null}

      <AdjustLineSplitDialog
        line={splitDialogLine}
        open={splitDialogLineKey != null}
        isSaving={editor.isSaving}
        onOpenChange={(open) => {
          if (!open) {
            setSplitDialogLineKey(null);
          }
        }}
        onSave={(lineKey, values) =>
          editor.saveLineSplitAdjustment(lineKey, values)
        }
      />

      <LinePricingBreakdownDialog
        line={breakdownLine}
        capturedAt={order.date_order}
        open={breakdownLineId != null}
        onOpenChange={(open) => {
          if (!open) {
            setBreakdownLineId(null);
          }
        }}
        showOdontogramTab={shouldShowLineOdontogramTab({
          hasDentalEncounter: order.has_dental_encounter,
          line: breakdownLine,
        })}
        canEditTeeth={canEdit}
        isSavingTeeth={isSavingTeeth}
        canChangePayability={canChangeLines}
        isSavingPayability={isSavingPayability}
        onSetPayability={
          breakdownLineId == null
            ? undefined
            : async (isPayable) => {
                setIsSavingPayability(true);
                try {
                  const updated = await setSalesOrderLinePayability(
                    order.id,
                    breakdownLineId,
                    isPayable,
                  );
                  onOrderUpdated(updated);
                  toast({
                    variant: "success",
                    title: isPayable ? "Line marked payable" : "Line marked non-payable",
                    description: "The payment split was updated for this line.",
                  });
                } catch (error) {
                  toast({
                    variant: "error",
                    title: "Could not update payability",
                    description:
                      error instanceof BffError
                        ? formatBffErrorMessage(error.message, error.errors)
                        : error instanceof Error
                          ? error.message
                          : "Something went wrong.",
                  });
                } finally {
                  setIsSavingPayability(false);
                }
              }
        }
        onSaveTeeth={
          breakdownLineId == null
            ? undefined
            : async (toothNumbers) => {
                setIsSavingTeeth(true);
                try {
                  const updated = await setSalesOrderLineDentalTeeth(
                    order.id,
                    breakdownLineId,
                    toothNumbers,
                  );
                  onOrderUpdated(updated);
                  toast({
                    variant: "success",
                    title: "Teeth saved",
                    description: "Tooth assignment updated for this line.",
                  });
                } catch (error) {
                  toast({
                    variant: "error",
                    title: "Could not save teeth",
                    description:
                      error instanceof Error
                        ? error.message
                        : "Something went wrong while saving teeth.",
                  });
                } finally {
                  setIsSavingTeeth(false);
                }
              }
        }
      />

      <NonPayableLineDialog
        open={nonPayableLineId != null}
        onOpenChange={(open) => {
          if (!open) {
            setNonPayableLineId(null);
          }
        }}
        order={order}
        line={nonPayableLine}
        canEdit={canEdit}
        onOrderUpdated={(updatedOrder) => {
          onOrderUpdated(updatedOrder);
          toast({
            variant: "success",
            title: "Line updated",
            description:
              "Matching lines were refreshed from the pricelist.",
          });
        }}
      />

      <AssignSalesOrderLineTeethDialog
        open={editor.teethAssignmentQueue.length > 0}
        line={editor.teethAssignmentQueue[0] ?? null}
        queuePosition={
          editor.teethAssignmentTotal > 1
            ? {
                index:
                  editor.teethAssignmentTotal -
                  editor.teethAssignmentQueue.length +
                  1,
                total: editor.teethAssignmentTotal,
              }
            : null
        }
        isSaving={editor.isSavingTeeth}
        error={editor.teethAssignmentError}
        onOpenChange={(open) => {
          if (!open) {
            editor.skipTeethAssignment();
          }
        }}
        onSkip={editor.skipTeethAssignment}
        onConfirm={editor.confirmTeethAssignment}
      />

      <Dialog
        open={confirmAction != null}
        onOpenChange={(open) => {
          if (!open && !isConfirming) {
            setConfirmAction(null);
          }
        }}
      >
        <DialogContent data-testid="sales-order-line-action-dialog">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "merge" ? "Merge line items" : "Create a new sales order"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "merge"
                ? `Merge ${mergePreview?.quantity ?? ""} ${mergePreview?.productName ?? "items"} into one line. Pricing will be recalculated.`
                : "The selected lines will move to a new sales order. The client, visit, pricelist, insurance, and providers stay the same."}
            </DialogDescription>
          </DialogHeader>
          {confirmAction === "split" ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-brand-navy">
              {selectedLines.map((line) => (
                <li key={line.id}>{line.productName || "Line item"}</li>
              ))}
            </ul>
          ) : null}
          <DialogFooter>
            <SecondaryButton
              type="button"
              disabled={isConfirming}
              onClick={() => setConfirmAction(null)}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="button"
              disabled={isConfirming}
              onClick={() => void confirmLineAction()}
              data-testid="sales-order-line-action-confirm"
            >
              {confirmAction === "merge" ? "Merge lines" : "Create order"}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
