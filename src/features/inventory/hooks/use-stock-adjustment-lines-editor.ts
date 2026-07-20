"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { updateStockAdjustment } from "@/features/inventory/services/stock-adjustments.service";
import type {
  AdjustmentType,
  StockAdjustment,
} from "@/features/inventory/types/inventory.types";
import {
  createEmptyStockAdjustmentLineDraft,
  draftsToStockAdjustmentLines,
  preserveStockAdjustmentProductNames,
  serializeStockAdjustmentDraftLines,
  stockAdjustmentLineToDraft,
  type StockAdjustmentLineDraft,
} from "@/features/inventory/types/stock-adjustment-line-draft";

type UseStockAdjustmentLinesEditorOptions = {
  adjustment: StockAdjustment;
  canEdit: boolean;
  autoAddLine?: boolean;
  onUpdated: (adjustment: StockAdjustment) => void;
  onError: (message: string) => void;
};

function buildInitialDrafts(
  lines: StockAdjustment["lines"],
): StockAdjustmentLineDraft[] {
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
  const draftLinesRef = useRef(draftLines);

  useEffect(() => {
    draftLinesRef.current = draftLines;
  }, [draftLines]);

  const serverLinesSnapshot = serializeStockAdjustmentDraftLines(
    buildInitialDrafts(adjustment.lines),
  );

  useEffect(() => {
    let cancelled = false;

    async function synchronizeServerLines() {
      await Promise.resolve();
      if (cancelled) {
        return;
      }
      const nextDrafts = preserveStockAdjustmentProductNames(
        buildInitialDrafts(adjustment.lines),
        draftLinesRef.current,
      );
      setDraftLines(nextDrafts);
      setSavedSnapshot(serializeStockAdjustmentDraftLines(nextDrafts));
      setEditingRowKey(null);
      setActiveRowKey(null);
    }

    void synchronizeServerLines();
    return () => {
      cancelled = true;
    };
  }, [adjustment.lines, adjustment.uuid, serverLinesSnapshot]);

  useEffect(() => {
    if (!canEdit || !autoAddLine || hasAutoAdded || draftLines.length > 0) {
      return;
    }

    let cancelled = false;

    async function addInitialLine() {
      await Promise.resolve();
      if (cancelled) {
        return;
      }
      const newLine = createEmptyStockAdjustmentLineDraft();
      setDraftLines([newLine]);
      setEditingRowKey(newLine.key);
      setActiveRowKey(newLine.key);
      setHasAutoAdded(true);
    }

    void addInitialLine();
    return () => {
      cancelled = true;
    };
  }, [autoAddLine, canEdit, draftLines.length, hasAutoAdded]);

  const isDirty = useMemo(
    () => serializeStockAdjustmentDraftLines(draftLines) !== savedSnapshot,
    [draftLines, savedSnapshot],
  );

  const isEditingLines = useMemo(
    () => editingRowKey !== null || draftLines.some((line) => line.isNew),
    [draftLines, editingRowKey],
  );

  const hasPendingChanges = isDirty || isEditingLines;

  const updateLine = useCallback(
    (key: string, patch: Partial<StockAdjustmentLineDraft>) => {
      setDraftLines((current) =>
        current.map((line) =>
          line.key === key ? { ...line, ...patch } : line,
        ),
      );
    },
    [],
  );

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
        productName: line.productName ?? null,
        quantity_delta: line.quantity_delta,
        new_unit_cost: line.new_unit_cost,
      })),
    );
    setEditingRowKey(null);
    setActiveRowKey(null);
  }, [savedSnapshot]);

  const persistDraftLines = useCallback(
    async (lines: StockAdjustmentLineDraft[]) => {
      const payloadLines = draftsToStockAdjustmentLines(
        lines,
        adjustment.adjustment_type,
      );
      const updated = await updateStockAdjustment(adjustment.uuid, {
        lines: payloadLines,
      });
      const nextDrafts = preserveStockAdjustmentProductNames(
        buildInitialDrafts(updated.lines),
        lines,
      );
      setDraftLines(nextDrafts);
      setSavedSnapshot(serializeStockAdjustmentDraftLines(nextDrafts));
      setEditingRowKey(null);
      setActiveRowKey(null);
      onUpdated(updated);
    },
    [adjustment.adjustment_type, adjustment.uuid, onUpdated],
  );

  const saveChanges = useCallback(async () => {
    setIsSaving(true);
    try {
      await persistDraftLines(draftLines);
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Could not save line items.",
      );
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
    removeLine,
    discardChanges,
    saveChanges,
    adjustmentType: adjustment.adjustment_type as AdjustmentType,
  };
}
