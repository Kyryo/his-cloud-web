"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { searchInventoryProducts } from "@/features/inventory/services/inventory.service";
import { formatProductLabel } from "@/features/inventory/utils/format-inventory";
import {
  addSalesOrderLine,
  removeSalesOrderLine,
  updateSalesOrderLine,
  updateSalesOrderLinePrice,
} from "@/features/sales-orders/services/sales-orders.service";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import {
  createEmptySalesOrderLineDraft,
  linesMissingProductName,
  salesOrderLineToDraft,
  serializeSalesOrderDraftLines,
  validateSalesOrderLinesForSave,
  type SalesOrderLineDraft,
} from "@/features/sales-orders/types/sales-order-line-draft";
import {
  buildSalesOrderLineCreatePayload,
  collectSalesOrderLineIdsToReplace,
  collectSalesOrderLinesToAdd,
  parseSalesOrderLineSnapshot,
  type SavedSalesOrderLineSnapshot,
} from "@/features/sales-orders/utils/sales-order-lines-save";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";

type UseSalesOrderLinesEditorOptions = {
  order: SalesOrder;
  canEdit: boolean;
  onOrderUpdated: (order: SalesOrder) => void;
  onError: (message: string) => void;
};

function buildDraftsFromOrder(order: SalesOrder): SalesOrderLineDraft[] {
  return (order.lines ?? []).map(salesOrderLineToDraft);
}

function parseSnapshot(snapshot: string): SavedSalesOrderLineSnapshot[] {
  return parseSalesOrderLineSnapshot(snapshot);
}

export function useSalesOrderLinesEditor({
  order,
  canEdit,
  onOrderUpdated,
  onError,
}: UseSalesOrderLinesEditorOptions) {
  const [draftLines, setDraftLines] = useState<SalesOrderLineDraft[]>(() =>
    buildDraftsFromOrder(order),
  );
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    serializeSalesOrderDraftLines(buildDraftsFromOrder(order)),
  );
  const [editingRowKey, setEditingRowKey] = useState<string | null>(null);
  const [activeRowKey, setActiveRowKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const orderSnapshot = serializeSalesOrderDraftLines(buildDraftsFromOrder(order));

  useEffect(() => {
    const nextDrafts = buildDraftsFromOrder(order);
    setDraftLines(nextDrafts);
    setSavedSnapshot(serializeSalesOrderDraftLines(nextDrafts));
    setEditingRowKey(null);
    setActiveRowKey(null);
  }, [order.id, orderSnapshot]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateProductNames() {
      if (!linesMissingProductName(buildDraftsFromOrder(order))) {
        return;
      }

      try {
        const products = await searchInventoryProducts({ active: true });
        if (cancelled) {
          return;
        }

        const labels = new Map(
          products.map((product) => [product.uuid, formatProductLabel(product)]),
        );

        setDraftLines((current) =>
          current.map((line) => {
            if (!line.product_id || line.productName) {
              return line;
            }

            return {
              ...line,
              productName:
                labels.get(line.product_uuid ?? "") ??
                (line.product_id ? `Product #${line.product_id}` : null),
            };
          }),
        );
      } catch {
        if (!cancelled) {
          setDraftLines((current) =>
            current.map((line) =>
              line.product_id && !line.productName
                ? { ...line, productName: `Product #${line.product_id}` }
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
  }, [order.id, orderSnapshot, order]);

  const isDirty = useMemo(
    () => serializeSalesOrderDraftLines(draftLines) !== savedSnapshot,
    [draftLines, savedSnapshot],
  );

  const isEditingLines = useMemo(
    () => editingRowKey !== null || draftLines.some((line) => line.isNew),
    [draftLines, editingRowKey],
  );

  const hasPendingChanges = isDirty || isEditingLines;

  const updateLine = useCallback(
    (key: string, patch: Partial<SalesOrderLineDraft>) => {
      setDraftLines((current) =>
        current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
      );
    },
    [],
  );

  const addLine = useCallback(() => {
    if (!canEdit) {
      return;
    }

    const newLine = createEmptySalesOrderLineDraft();
    setDraftLines((current) => [...current, newLine]);
    setEditingRowKey(newLine.key);
    setActiveRowKey(newLine.key);
  }, [canEdit]);

  const removeLine = useCallback((key: string) => {
    setDraftLines((current) => current.filter((line) => line.key !== key));
    setEditingRowKey((current) => (current === key ? null : current));
    setActiveRowKey((current) => (current === key ? null : current));
  }, []);

  const discardNewLine = useCallback(
    (key: string) => {
      removeLine(key);
    },
    [removeLine],
  );

  const confirmRow = useCallback(
    (key: string, options?: { addAnother?: boolean }) => {
      const line = draftLines.find((item) => item.key === key);
      if (!line) {
        return;
      }

      if (line.isNew) {
        if (!line.product_id && !line.product_uuid) {
          onError("Choose a product before confirming this line.");
          return;
        }

        const parsedQuantity = Number(line.quantity);
        if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
          onError("Quantity must be greater than zero.");
          return;
        }

        if (line.price_unit.trim()) {
          const parsedPrice = Number(line.price_unit);
          if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            onError("Enter a unit price of zero or greater.");
            return;
          }
        }

        updateLine(key, { isNew: false });
        setEditingRowKey(null);
        setActiveRowKey(null);

        if (options?.addAnother) {
          addLine();
        }
        return;
      }

      if (!line.product_id && !line.product_uuid) {
        onError("Choose a product before confirming this line.");
        return;
      }

      const parsedQuantity = Number(line.quantity);
      if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
        onError("Quantity must be greater than zero.");
        return;
      }

      if (line.price_unit.trim()) {
        const parsedPrice = Number(line.price_unit);
        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
          onError("Enter a unit price of zero or greater.");
          return;
        }
      }

      setEditingRowKey(null);
      setActiveRowKey(null);
    },
    [addLine, draftLines, onError, updateLine],
  );

  const discardChanges = useCallback(() => {
    const restored = parseSnapshot(savedSnapshot);

    setDraftLines(
      restored.map((line) => ({
        key: crypto.randomUUID(),
        id: line.id ?? undefined,
        product_id: line.product_id,
        productName: line.productName,
        tariff_code: line.tariff_code ?? null,
        quantity: line.quantity,
        price_unit: line.price_unit,
        price_total: line.price_total,
      })),
    );
    setEditingRowKey(null);
    setActiveRowKey(null);
  }, [savedSnapshot]);

  const saveChanges = useCallback(async () => {
    const validationError = validateSalesOrderLinesForSave(draftLines);
    if (validationError) {
      onError(validationError);
      return;
    }

    const snapshot = parseSnapshot(savedSnapshot);
    const snapshotById = new Map(
      snapshot.filter((line) => line.id != null).map((line) => [line.id!, line]),
    );
    const currentIds = new Set(
      draftLines.filter((line) => line.id != null).map((line) => line.id!),
    );
    const lineIdsToReplace = collectSalesOrderLineIdsToReplace(draftLines, snapshot);
    const linesToAdd = collectSalesOrderLinesToAdd(draftLines, lineIdsToReplace);

    setIsSaving(true);
    try {
      let currentOrder = order;

      for (const snapLine of snapshot) {
        if (
          snapLine.id != null &&
          (!currentIds.has(snapLine.id) || lineIdsToReplace.has(snapLine.id))
        ) {
          currentOrder = await removeSalesOrderLine(order.id, snapLine.id);
        }
      }

      for (const line of draftLines) {
        if (line.id == null || lineIdsToReplace.has(line.id)) {
          continue;
        }

        const original = snapshotById.get(line.id);
        if (!original || original.price_unit === line.price_unit) {
          continue;
        }

        const parsedPrice = Number(line.price_unit);
        currentOrder = await updateSalesOrderLinePrice(order.id, line.id, {
          price_unit: parsedPrice.toFixed(4),
        });
      }

      for (const line of draftLines) {
        if (line.id == null || lineIdsToReplace.has(line.id)) {
          continue;
        }

        const original = snapshotById.get(line.id);
        const originalCode = (original?.tariff_code ?? "").trim();
        const nextCode = (line.tariff_code ?? "").trim();
        if (original && originalCode !== nextCode) {
          currentOrder = await updateSalesOrderLine(order.id, line.id, {
            tariff_code: nextCode || null,
          });
        }
      }

      for (const line of linesToAdd) {
        const payload = buildSalesOrderLineCreatePayload(line);
        if (!payload) {
          continue;
        }

        currentOrder = await addSalesOrderLine(order.id, payload);
      }

      const nextDrafts = buildDraftsFromOrder(currentOrder);
      setDraftLines(nextDrafts);
      setSavedSnapshot(serializeSalesOrderDraftLines(nextDrafts));
      setEditingRowKey(null);
      setActiveRowKey(null);
      onOrderUpdated(currentOrder);
    } catch (error) {
      onError(
        error instanceof BffError
          ? formatBffErrorMessage(error.message, error.errors)
          : error instanceof Error
            ? error.message
            : "Could not save line items.",
      );
    } finally {
      setIsSaving(false);
    }
  }, [draftLines, onError, onOrderUpdated, order, savedSnapshot]);

  return {
    draftLines,
    editingRowKey,
    activeRowKey,
    isSaving,
    hasPendingChanges,
    canEdit,
    setEditingRowKey,
    setActiveRowKey,
    updateLine,
    addLine,
    removeLine,
    discardNewLine,
    confirmRow,
    discardChanges,
    saveChanges,
  };
}
