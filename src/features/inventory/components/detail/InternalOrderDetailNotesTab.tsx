"use client";

import { Loader2, NotebookPen } from "lucide-react";
import { useEffect, useState } from "react";

import {
  DetailRecordList,
  DetailRecordListItem,
} from "@/components/detail/detail-record-list";
import { DetailTabEmptyState } from "@/components/detail/detail-tab-empty-state";
import { AddActionButton, PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { updateInternalOrder } from "@/features/inventory/services/internal-orders.service";
import type { InternalOrder } from "@/features/inventory/types/inventory.types";
import { useToast } from "@/providers/toast-provider";

type InternalOrderDetailNotesTabProps = {
  order: InternalOrder;
  canEdit: boolean;
  isActive: boolean;
  onUpdated: (order: InternalOrder) => void;
};

export function InternalOrderDetailNotesTab({
  order,
  canEdit,
  isActive,
  onUpdated,
}: InternalOrderDetailNotesTabProps) {
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
      const updated = await updateInternalOrder(order.uuid, {
        notes: notes.trim() || null,
      });
      onUpdated(updated);
      setIsEditing(false);
      toast({
        title: "Notes saved",
        description: "Internal order notes were updated.",
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
      data-testid="internal-order-add-note-button"
    />
  ) : null;

  if (!hasNotes && !isEditing) {
    return (
      <DetailTabEmptyState
        icon={NotebookPen}
        title="No notes yet"
        description="Internal notes for this internal order will appear here."
        action={addButton}
        data-testid="internal-order-notes-empty-state"
      />
    );
  }

  return (
    <DetailRecordList
      title="Notes"
      description="Internal notes recorded for this internal order."
      action={canEdit && !isEditing ? addButton : null}
      data-testid="internal-order-notes-tab"
      footer={
        isEditing ? (
          <div className="space-y-3">
            <textarea
              id="internal-order-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={6}
              placeholder="Add transfer context or internal comments..."
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
                data-testid="internal-order-save-notes-button"
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
          data-testid="internal-order-note-item"
        />
      ) : null}
    </DetailRecordList>
  );
}
