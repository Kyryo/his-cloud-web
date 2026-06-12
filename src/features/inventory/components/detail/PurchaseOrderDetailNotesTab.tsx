"use client";

import { Loader2, NotebookPen } from "lucide-react";
import { useEffect, useState } from "react";

import {
  DetailRecordList,
  DetailRecordListItem,
} from "@/components/detail/detail-record-list";
import { DetailTabEmptyState } from "@/components/detail/detail-tab-empty-state";
import { AddActionButton, PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { updatePurchaseOrder } from "@/features/inventory/services/purchase-orders.service";
import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";
import { useToast } from "@/providers/toast-provider";

type PurchaseOrderDetailNotesTabProps = {
  order: PurchaseOrder;
  canEdit: boolean;
  isActive: boolean;
  onUpdated: (order: PurchaseOrder) => void;
};

export function PurchaseOrderDetailNotesTab({
  order,
  canEdit,
  isActive,
  onUpdated,
}: PurchaseOrderDetailNotesTabProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState(order.notes ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNotes(order.notes ?? "");
    setIsEditing(false);
  }, [order.notes, order.updated_at]);

  if (!isActive) {
    return null;
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const updated = await updatePurchaseOrder(order.uuid, {
        notes: notes.trim() || null,
      });
      onUpdated(updated);
      setIsEditing(false);
      toast({
        title: "Notes saved",
        description: "Purchase order notes were updated.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Could not save notes",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const hasNotes = Boolean(order.notes?.trim());
  const addButton = canEdit ? (
    <AddActionButton
      label={hasNotes ? "Edit note" : "Add note"}
      onClick={() => setIsEditing(true)}
      data-testid="purchase-order-add-note-button"
    />
  ) : null;

  if (!hasNotes && !isEditing) {
    return (
      <DetailTabEmptyState
        icon={NotebookPen}
        title="No notes yet"
        description="Internal notes for this purchase order will appear here."
        action={addButton}
        data-testid="purchase-order-notes-empty-state"
      />
    );
  }

  return (
    <DetailRecordList
      title="Notes"
      description="Internal notes recorded for this purchase order."
      action={canEdit && !isEditing ? addButton : null}
      data-testid="purchase-order-notes-tab"
      footer={
        isEditing ? (
          <div className="space-y-3">
            <textarea
              id="purchase-order-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={6}
              placeholder="Add delivery instructions, vendor context, or internal comments..."
              className="flex min-h-[8rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="flex flex-wrap justify-end gap-2">
              <SecondaryButton
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setNotes(order.notes ?? "");
                  setIsEditing(false);
                }}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="button"
                disabled={isSaving}
                onClick={() => void handleSave()}
                data-testid="purchase-order-save-notes-button"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  "Save notes"
                )}
              </PrimaryButton>
            </div>
          </div>
        ) : null
      }
    >
      {hasNotes && !isEditing ? (
        <DetailRecordListItem
          title="Internal note"
          description={<p className="whitespace-pre-wrap">{order.notes}</p>}
          dateTime={order.updated_at}
          onUpdate={canEdit ? () => setIsEditing(true) : undefined}
          data-testid="purchase-order-note-item"
        />
      ) : null}
    </DetailRecordList>
  );
}
