"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { updateStockAdjustment } from "@/features/inventory/services/stock-adjustments.service";
import { searchInventoryProducts } from "@/features/inventory/services/inventory.service";
import type { AdjustmentType, StockAdjustment } from "@/features/inventory/types/inventory.types";
import {
  createEmptyStockAdjustmentLineDraft,
  draftsToStockAdjustmentLines,
  serializeStockAdjustmentDraftLines,
  stockAdjustmentLineToDraft,
  type StockAdjustmentLineDraft,
} from "@/features/inventory/types/stock-adjustment-line-draft";
import { formatProductLabel } from "@/features/inventory/utils/format-inventory";

type UseStockAdjustmentLinesEditorOptions = {
  adjustment: StockAdjustment;
  canEdit: boolean;
  autoAddLine?: boolean;
  onUpdated: (adjustment: StockAdjustment) => void;
  onError: (message: string) => void;
};

function buildInitialDrafts(lines: StockAdjustment["lines"]): StockAdjustmentLineDraft[] {
  return lines.map(stockAdjustmentLineToDraft);
}

export function useStockAdjustmentLinesEditor({
  adjustment,
  canEdit,
  autoAddLine = false,
  onUpdated,
  onError,
}: UseStockAdjustmentLinesEditorOptions) {
  const [draftLines, setDraftLines] = useState<StockAdjustmentLineDraft[]>(() =>
    buildInitialDrafts(adjustment.lines),
  );
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    serializeStockAdjustmentDraftLines(buildInitialDrafts(adjustment.lines)),
  );
  const [editingRowKey, setEditingRowKey] = useState<string | null>(null);
  const [activeRowKey, setActiveRowKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasAutoAdded, setHasAutoAdded] = useState(false);

  const serverLinesSnapshot = serializeStockAdjustmentDraftLines(
    buildInitialDrafts(adjustment.lines),
  );

  useEffect(() => {
    const nextDrafts = buildInitialDrafts(adjustment.lines);
    setDraftLines(nextDrafts);
    setSavedSnapshot(serializeStockAdjustmentDraftLines(nextDrafts));
    setEditingRowKey(null);
    setActiveRowKey(null);
  }, [adjustment.uuid, serverLinesSnapshot, adjustment.lines]);

  useEffect(() => {
    if (!canEdit || !autoAddLine || hasAutoAdded || draftLines.length > 0) {
      return;
    }

    const newLine = createEmptyStockAdjustmentLineDraft();
    setDraftLines([newLine]);
    setEditingRowKey(newLine.key);
    setActiveRowKey(newLine.key);
    setHasAutoAdded(true);
  }, [autoAddLine, canEdit, draftLines.length, hasAutoAdded]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateProductNames() {
      const initialDrafts = buildInitialDrafts(adjustment.lines);
      const needsNames = initialDrafts.some(
        (line) => line.product_id && !line.productName,
      );
      if (!needsNames) {
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
  }, [adjustment.uuid, serverLinesSnapshot, adjustment.lines]);

  const isDirty = useMemo(
    () => serializeStockAdjustmentDraftLines(draftLines) !== savedSnapshot,
    [draftLines, savedSnapshot],
  );

  const isEditingLines = useMemo(
    () => editingRowKey !== null || draftLines.some((line) => line.isNew),
    [draftLines, editingRowKey],
  );

  const hasPendingChanges = isDirty || isEditingLines;

  const updateLine = useCallback((key: string, patch: Partial<StockAdjustmentLineDraft>) => {
    setDraftLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  }, []);

  const addLine = useCallback(() => {
    const newLine = createEmptyStockAdjustmentLineDraft();
    setDraftLines((current) => [...current, newLine]);
    setEditingRowKey(newLine.key);
    setActiveRowKey(newLine.key);
  }, []);

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
      if (!line?.product_uuid && !line?.product_id) {
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

  const discardChanges = useCallback(() => {
    const restored = JSON.parse(savedSnapshot) as Array<{
      id: number | null;
      product_id: number | null;
      product_uuid?: string | null;
      productName?: string | null;
      quantity_delta: string;
      new_unit_cost: string;
    }>;

    setDraftLines(
      restored.map((line) => ({
        key: crypto.randomUUID(),
        id: line.id ?? undefined,
        product_id: line.product_id,
        product_uuid: line.product_uuid ?? null,
        productName:
          line.productName ??
          (line.product_id ? `Product #${line.product_id}` : null),
        quantity_delta: line.quantity_delta,
        new_unit_cost: line.new_unit_cost,
      })),
    );
    setEditingRowKey(null);
    setActiveRowKey(null);
  }, [savedSnapshot]);

  const persistDraftLines = useCallback(
    async (lines: StockAdjustmentLineDraft[]) => {
      const payloadLines = draftsToStockAdjustmentLines(lines, adjustment.adjustment_type);
      if (payloadLines.length === 0) {
        onError("Add at least one line item before saving.");
        return;
      }

      const updated = await updateStockAdjustment(adjustment.uuid, { lines: payloadLines });
      const nextDrafts = buildInitialDrafts(updated.lines);
      setDraftLines(nextDrafts);
      setSavedSnapshot(serializeStockAdjustmentDraftLines(nextDrafts));
      setEditingRowKey(null);
      setActiveRowKey(null);
      onUpdated(updated);
    },
    [adjustment.adjustment_type, adjustment.uuid, onError, onUpdated],
  );

  const saveChanges = useCallback(async () => {
    setIsSaving(true);
    try {
      await persistDraftLines(draftLines);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Could not save line items.");
    } finally {
      setIsSaving(false);
    }
  }, [draftLines, onError, persistDraftLines]);

  return {
    draftLines,
    editingRowKey,
    activeRowKey,
    isDirty,
    hasPendingChanges,
    isEditingLines,
    isSaving,
    setEditingRowKey,
    setActiveRowKey,
    updateLine,
    addLine,
    discardNewLine,
    confirmRow,
    discardChanges,
    saveChanges,
    adjustmentType: adjustment.adjustment_type as AdjustmentType,
  };
}
