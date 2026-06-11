"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { searchInventoryProducts } from "@/features/inventory/services/inventory.service";
import { updatePurchaseOrder } from "@/features/inventory/services/purchase-orders.service";
import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";
import {
  createEmptyPurchaseOrderLineDraft,
  draftsToPurchaseOrderLines,
  purchaseOrderLineToDraft,
  serializeDraftLines,
  type PurchaseOrderLineDraft,
} from "@/features/inventory/types/purchase-order-line-draft";
import { formatProductLabel } from "@/features/inventory/utils/format-inventory";

type UsePurchaseOrderLinesEditorOptions = {
  order: PurchaseOrder;
  canEdit: boolean;
  autoAddLine?: boolean;
  onUpdated: (order: PurchaseOrder) => void;
  onError: (message: string) => void;
};

function buildInitialDrafts(lines: PurchaseOrder["lines"]): PurchaseOrderLineDraft[] {
  return lines.map(purchaseOrderLineToDraft);
}

export function usePurchaseOrderLinesEditor({
  order,
  canEdit,
  autoAddLine = false,
  onUpdated,
  onError,
}: UsePurchaseOrderLinesEditorOptions) {
  const [draftLines, setDraftLines] = useState<PurchaseOrderLineDraft[]>(() =>
    buildInitialDrafts(order.lines),
  );
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    serializeDraftLines(buildInitialDrafts(order.lines)),
  );
  const [editingRowKey, setEditingRowKey] = useState<string | null>(null);
  const [activeRowKey, setActiveRowKey] = useState<string | null>(null);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasAutoAdded, setHasAutoAdded] = useState(false);

  const serverLinesSnapshot = serializeDraftLines(buildInitialDrafts(order.lines));

  useEffect(() => {
    const nextDrafts = buildInitialDrafts(order.lines);
    setDraftLines(nextDrafts);
    setSavedSnapshot(serializeDraftLines(nextDrafts));
    setEditingRowKey(null);
    setActiveRowKey(null);
  }, [order.uuid, serverLinesSnapshot, order.lines]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateProductNames() {
      const productIds = [
        ...new Set(
          draftLines
            .map((line) => line.odoo_product_id)
            .filter((id): id is number => id !== null),
        ),
      ];

      if (productIds.length === 0) {
        return;
      }

      try {
        const products = await searchInventoryProducts({ active: true });
        if (cancelled) {
          return;
        }

        const labels = new Map(
          products.map((product) => [product.id, formatProductLabel(product)]),
        );

        setDraftLines((current) =>
          current.map((line) => {
            if (!line.odoo_product_id || line.productName) {
              return line;
            }

            return {
              ...line,
              productName:
                labels.get(line.odoo_product_id) ?? `Product #${line.odoo_product_id}`,
            };
          }),
        );
      } catch {
        if (!cancelled) {
          setDraftLines((current) =>
            current.map((line) =>
              line.odoo_product_id && !line.productName
                ? { ...line, productName: `Product #${line.odoo_product_id}` }
                : line,
            ),
          );
        }
      }
    }

    void hydrateProductNames();

    return () => {
      cancelled = true;
    };
  }, [order.uuid]);

  useEffect(() => {
    if (!canEdit || !autoAddLine || hasAutoAdded || draftLines.length > 0) {
      return;
    }

    const newLine = createEmptyPurchaseOrderLineDraft();
    setDraftLines([newLine]);
    setEditingRowKey(newLine.key);
    setActiveRowKey(newLine.key);
    setHasAutoAdded(true);
  }, [autoAddLine, canEdit, draftLines.length, hasAutoAdded]);

  const isDirty = useMemo(
    () => serializeDraftLines(draftLines) !== savedSnapshot,
    [draftLines, savedSnapshot],
  );

  const updateLine = useCallback(
    (key: string, patch: Partial<PurchaseOrderLineDraft>) => {
      setDraftLines((current) =>
        current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
      );
    },
    [],
  );

  const addLine = useCallback(() => {
    const newLine = createEmptyPurchaseOrderLineDraft();
    setDraftLines((current) => [...current, newLine]);
    setEditingRowKey(newLine.key);
    setActiveRowKey(newLine.key);
  }, []);

  const removeLine = useCallback((key: string) => {
    setDraftLines((current) => current.filter((line) => line.key !== key));
    setEditingRowKey((current) => (current === key ? null : current));
    setActiveRowKey((current) => (current === key ? null : current));
  }, []);

  const discardNewLine = useCallback((key: string) => {
    removeLine(key);
  }, [removeLine]);

  const confirmRow = useCallback(
    (key: string, options?: { addAnother?: boolean }) => {
      const line = draftLines.find((item) => item.key === key);
      if (!line?.odoo_product_id) {
        onError("Choose a product before confirming this line.");
        return;
      }

      updateLine(key, { isNew: false });
      setEditingRowKey(null);

      if (options?.addAnother) {
        addLine();
      }
    },
    [addLine, draftLines, onError, updateLine],
  );

  const reorderLines = useCallback((fromKey: string, toKey: string) => {
    if (fromKey === toKey) {
      return;
    }

    setDraftLines((current) => {
      const fromIndex = current.findIndex((line) => line.key === fromKey);
      const toIndex = current.findIndex((line) => line.key === toKey);
      if (fromIndex < 0 || toIndex < 0) {
        return current;
      }

      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved!);
      return next;
    });
  }, []);

  const discardChanges = useCallback(() => {
    const restored = JSON.parse(savedSnapshot) as Array<{
      id: number | null;
      odoo_product_id: number | null;
      quantity: string;
      unit_cost: string;
    }>;

    setDraftLines(
      restored.map((line) => ({
        key: crypto.randomUUID(),
        id: line.id ?? undefined,
        odoo_product_id: line.odoo_product_id,
        productName: line.odoo_product_id
          ? `Product #${line.odoo_product_id}`
          : null,
        quantity: line.quantity,
        unit_cost: line.unit_cost,
      })),
    );
    setEditingRowKey(null);
    setActiveRowKey(null);
  }, [savedSnapshot]);

  const saveChanges = useCallback(async () => {
    const payloadLines = draftsToPurchaseOrderLines(draftLines);
    if (payloadLines.length === 0) {
      onError("Add at least one line item before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updatePurchaseOrder(order.uuid, { lines: payloadLines });
      const nextDrafts = buildInitialDrafts(updated.lines);
      setDraftLines(nextDrafts);
      setSavedSnapshot(serializeDraftLines(nextDrafts));
      setEditingRowKey(null);
      setActiveRowKey(null);
      onUpdated(updated);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Could not save line items.");
    } finally {
      setIsSaving(false);
    }
  }, [draftLines, onError, onUpdated, order.uuid]);

  return {
    draftLines,
    editingRowKey,
    activeRowKey,
    draggingKey,
    isDirty,
    isSaving,
    canEdit,
    setEditingRowKey,
    setActiveRowKey,
    setDraggingKey,
    updateLine,
    addLine,
    removeLine,
    discardNewLine,
    confirmRow,
    reorderLines,
    discardChanges,
    saveChanges,
  };
}
