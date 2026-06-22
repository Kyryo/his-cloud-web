"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { updateInternalOrder } from "@/features/inventory/services/internal-orders.service";
import { searchInventoryProducts } from "@/features/inventory/services/inventory.service";
import type { InternalOrder } from "@/features/inventory/types/inventory.types";
import {
  createEmptyInternalOrderLineDraft,
  draftsToInternalOrderLines,
  internalOrderLineToDraft,
  serializeInternalDraftLines,
  type InternalOrderLineDraft,
} from "@/features/inventory/types/internal-order-line-draft";
import { formatProductLabel } from "@/features/inventory/utils/format-inventory";

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

  const serverLinesSnapshot = serializeInternalDraftLines(buildInitialDrafts(order.lines));

  useEffect(() => {
    const nextDrafts = buildInitialDrafts(order.lines);
    setDraftLines(nextDrafts);
    setSavedSnapshot(serializeInternalDraftLines(nextDrafts));
    setEditingRowKey(null);
    setActiveRowKey(null);
  }, [order.uuid, serverLinesSnapshot, order.lines]);

  useEffect(() => {
    if (!canEdit || !autoAddLine || hasAutoAdded || draftLines.length > 0) {
      return;
    }

    const newLine = createEmptyInternalOrderLineDraft();
    setDraftLines([newLine]);
    setEditingRowKey(newLine.key);
    setActiveRowKey(newLine.key);
    setHasAutoAdded(true);
  }, [autoAddLine, canEdit, draftLines.length, hasAutoAdded]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateProductNames() {
      const initialDrafts = buildInitialDrafts(order.lines);
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
  }, [order.uuid, serverLinesSnapshot, order.lines]);

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
      if (!line?.product_id) {
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
      productName?: string | null;
      quantity: string;
      batch?: number | null;
      batchNumber?: string | null;
      notes?: string | null;
    }>;

    setDraftLines(
      restored.map((line) => ({
        key: crypto.randomUUID(),
        id: line.id ?? undefined,
        product_id: line.product_id,
        productName:
          line.productName ??
          (line.product_id ? `Product #${line.product_id}` : null),
        quantity: line.quantity,
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
      const payloadLines = draftsToInternalOrderLines(lines);
      if (payloadLines.length === 0) {
        onError("Add at least one line item before saving.");
        return;
      }

      const updated = await updateInternalOrder(order.uuid, { lines: payloadLines });
      const nextDrafts = buildInitialDrafts(updated.lines);
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
    discardNewLine,
    confirmRow,
    discardChanges,
    saveChanges,
    saveLineBatch,
  };
}
