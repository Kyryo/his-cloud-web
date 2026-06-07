"use client";

import { useCallback, useEffect, useState } from "react";
import { NotebookPen } from "lucide-react";

import { AddActionButton } from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddCustomerNoteDialog } from "@/features/customers/components/detail/AddCustomerNoteDialog";
import {
  CustomerDetailRecordList,
  CustomerDetailRecordListItem,
} from "@/features/customers/components/detail/CustomerDetailRecordList";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import { UpdateCustomerNoteDialog } from "@/features/customers/components/detail/UpdateCustomerNoteDialog";
import { fetchCustomerNotes } from "@/features/customers/services/customer-notes.service";
import {
  CUSTOMER_NOTE_TYPE_OPTIONS,
  type CustomerNote,
} from "@/features/customers/types/customer-note.types";
import type { Customer } from "@/features/customers/types/customer.types";

const NOTES_PAGE_SIZE = 10;

type CustomerDetailNotesTabProps = {
  customer: Customer;
  isActive: boolean;
};

function formatNoteType(value: CustomerNote["note_type"]): string {
  return (
    CUSTOMER_NOTE_TYPE_OPTIONS.find((option) => option.value === value)?.label ??
    value
  );
}

export function CustomerDetailNotesTab({
  customer,
  isActive,
}: CustomerDetailNotesTabProps) {
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<CustomerNote | null>(null);

  const loadNotes = useCallback(
    async (pageToLoad: number, append: boolean) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setLoadError(null);

      try {
        const response = await fetchCustomerNotes({
          customerId: customer.id,
          page: pageToLoad,
          pageSize: NOTES_PAGE_SIZE,
        });

        setNotes((current) =>
          append ? [...current, ...response.results] : response.results,
        );
        setPage(pageToLoad);
        setHasMore(Boolean(response.pagination?.next));
        setHasLoaded(true);
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "Failed to load notes.",
        );
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [customer.id],
  );

  const reloadNotes = useCallback(() => {
    void loadNotes(1, false);
  }, [loadNotes]);

  useEffect(() => {
    if (!isActive || hasLoaded) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetchCustomerNotes({
          customerId: customer.id,
          page: 1,
          pageSize: NOTES_PAGE_SIZE,
        });

        if (cancelled) {
          return;
        }

        setNotes(response.results);
        setPage(1);
        setHasMore(Boolean(response.pagination?.next));
        setHasLoaded(true);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setLoadError(
          error instanceof Error ? error.message : "Failed to load notes.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [customer.id, hasLoaded, isActive]);

  if (!isActive) {
    return null;
  }

  if (isLoading && !hasLoaded) {
    return <CustomerTabSkeleton rows={4} />;
  }

  if (loadError && !hasLoaded) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
        {loadError}
      </div>
    );
  }

  const addButton = (
    <AddActionButton
      label="Add note"
      onClick={() => setAddDialogOpen(true)}
      data-testid="add-customer-note-button"
    />
  );

  if (notes.length === 0) {
    return (
      <>
        <CustomerDetailTabEmptyState
          icon={NotebookPen}
          title="No notes yet"
          description="General, clinical, billing, and administrative notes for this client will appear here."
          action={addButton}
          data-testid="customer-notes-empty-state"
        />
        <AddCustomerNoteDialog
          customer={customer}
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onCreated={() => reloadNotes()}
        />
      </>
    );
  }

  return (
    <>
      <CustomerDetailRecordList
        title="Notes"
        description="Notes recorded for this client."
        action={addButton}
        data-testid="customer-detail-notes-tab"
        footer={
          hasMore ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoadingMore}
              onClick={() => void loadNotes(page + 1, true)}
              data-testid="customer-notes-load-more"
            >
              {isLoadingMore ? "Loading..." : "Load more notes"}
            </Button>
          ) : null
        }
      >
        {notes.map((note) => (
          <CustomerDetailRecordListItem
            key={note.uuid}
            title={note.title?.trim() || formatNoteType(note.note_type)}
            badges={
              <>
                <Badge variant="outline">{formatNoteType(note.note_type)}</Badge>
                {note.is_pinned ? (
                  <Badge variant="secondary">Pinned</Badge>
                ) : null}
                {!note.is_active ? (
                  <Badge variant="destructive">Archived</Badge>
                ) : null}
              </>
            }
            description={
              <p className="whitespace-pre-wrap">{note.body}</p>
            }
            dateTime={note.created_at}
            createdByName={note.created_by_name}
            onUpdate={() => setEditingNote(note)}
          />
        ))}
      </CustomerDetailRecordList>

      {loadError && hasLoaded ? (
        <p className="mt-2 text-xs text-red-600">{loadError}</p>
      ) : null}

      <AddCustomerNoteDialog
        customer={customer}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={() => reloadNotes()}
      />
      {editingNote ? (
        <UpdateCustomerNoteDialog
          note={editingNote}
          open={Boolean(editingNote)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingNote(null);
            }
          }}
          onUpdated={() => reloadNotes()}
        />
      ) : null}
    </>
  );
}
