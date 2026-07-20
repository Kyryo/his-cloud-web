"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { updateInternalOrder } from "@/features/inventory/services/internal-orders.service";
import type { InternalOrder } from "@/features/inventory/types/inventory.types";
import {
  createEmptyInternalOrderLineDraft,
  draftHasProduct,
  draftsToInternalOrderLines,
  internalOrderLineToDraft,
  preserveProductNamesInDrafts,
  serializeInternalDraftLines,
  validateInternalOrderLinesForSave,
  type InternalOrderLineDraft,
} from "@/features/inventory/types/internal-order-line-draft";

type UseInternalOrderLinesEditorOptions = {
  order: InternalOrder;
  canEdit: boolean;
  autoAddLine?: boolean;
  onUpdated: (order: InternalOrder) => void;
  onError: (message: string) => void;
};

function buildInitialDrafts(lines: InternalOrder["lines"]): InternalOrderLineDraft[] {
  return lines.map(internalOrderLineToDraft);
}

export function useInternalOrderLinesEditor({
  order,
  canEdit,
  autoAddLine = false,
  onUpdated,
  onError,
}: UseInternalOrderLinesEditorOptions) {
  const [draftLines, setDraftLines] = useState<InternalOrderLineDraft[]>(() =>
    buildInitialDrafts(order.lines),
  );
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    serializeInternalDraftLines(buildInitialDrafts(order.lines)),
  );
  const [editingRowKey, setEditingRowKey] = useState<string | null>(null);
  const [activeRowKey, setActiveRowKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasAutoAdded, setHasAutoAdded] = useState(false);
  const draftLinesRef = useRef(draftLines);

  useEffect(() => {
    draftLinesRef.current = draftLines;
  }, [draftLines]);

  const serverLinesSnapshot = serializeInternalDraftLines(buildInitialDrafts(order.lines));

  useEffect(() => {
    const merged = preserveProductNamesInDrafts(
      buildInitialDrafts(order.lines),
      draftLinesRef.current,
    );
    setDraftLines(merged);
    setSavedSnapshot(serializeInternalDraftLines(merged));
    setEditingRowKey(null);
    setActiveRowKey(null);
    // Content fingerprint only — `order.lines` referential changes must not
    // wipe in-progress draft product names.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- serverLinesSnapshot
  }, [order.uuid, serverLinesSnapshot]);

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

      const newLine = createEmptyInternalOrderLineDraft();
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
    () => serializeInternalDraftLines(draftLines) !== savedSnapshot,
    [draftLines, savedSnapshot],
  );

  const isEditingLines = useMemo(
    () => editingRowKey !== null || draftLines.some((line) => line.isNew),
    [draftLines, editingRowKey],
  );

  const hasPendingChanges = isDirty || isEditingLines;

  const updateLine = useCallback((key: string, patch: Partial<InternalOrderLineDraft>) => {
    setDraftLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  }, []);

  const addLine = useCallback(() => {
    const newLine = createEmptyInternalOrderLineDraft();
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
      if (!line || !draftHasProduct(line)) {
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
      quantity: string;
      quantityAvailable?: string | number | null;
      batch?: number | null;
      batchNumber?: string | null;
      notes?: string | null;
    }>;

    setDraftLines(
      restored.map((line) => ({
        key: crypto.randomUUID(),
        id: line.id ?? undefined,
        product_id: line.product_id,
        product_uuid: line.product_uuid ?? null,
        productName: line.productName ?? null,
        quantity: line.quantity,
        quantityAvailable: line.quantityAvailable ?? null,
        batch: line.batch ?? null,
        batchNumber: line.batchNumber ?? null,
        notes: line.notes ?? null,
      })),
    );
    setEditingRowKey(null);
    setActiveRowKey(null);
  }, [savedSnapshot]);

  const persistDraftLines = useCallback(
    async (lines: InternalOrderLineDraft[]) => {
      const validationError = validateInternalOrderLinesForSave(lines);
      if (validationError) {
        onError(validationError);
        return;
      }

      const payloadLines = draftsToInternalOrderLines(lines);
      const updated = await updateInternalOrder(order.uuid, { lines: payloadLines });
      const nextDrafts = preserveProductNamesInDrafts(
        buildInitialDrafts(updated.lines),
        lines,
      );
      setDraftLines(nextDrafts);
      setSavedSnapshot(serializeInternalDraftLines(nextDrafts));
      setEditingRowKey(null);
      setActiveRowKey(null);
      onUpdated(updated);
    },
    [onError, onUpdated, order.uuid],
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

  const saveLineBatch = useCallback(
    async (
      key: string,
      patch: Pick<InternalOrderLineDraft, "batch" | "batchNumber">,
    ) => {
      const nextDrafts = draftLines.map((line) =>
        line.key === key ? { ...line, ...patch } : line,
      );

      setIsSaving(true);
      try {
        await persistDraftLines(nextDrafts);
      } catch (error) {
        onError(
          error instanceof Error
            ? error.message
            : "Could not link the selected batch to this line item.",
        );
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [draftLines, onError, persistDraftLines],
  );

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
    discardNewLine,
    confirmRow,
    discardChanges,
    saveChanges,
    saveLineBatch,
  };
}
