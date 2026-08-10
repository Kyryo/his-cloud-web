"use client";

import { StickyNote } from "lucide-react";
import { useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { AddActionButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { TherapyFormActionBar } from "@/features/therapy/components/TherapyFormActionBar";
import {
  createTherapyVisitClientNote,
  fetchTherapyVisitClientNotes,
  updateTherapyVisitClientNote,
} from "@/features/therapy/services/therapy.service";
import type {
  TherapyClientNote,
  TherapyDiscipline,
} from "@/features/therapy/types/therapy.types";
import { useToast } from "@/providers/toast-provider";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-MW", {
  dateStyle: "medium",
  timeStyle: "short",
});

type EditorMode =
  | { kind: "idle" }
  | { kind: "create" }
  | { kind: "edit"; note: TherapyClientNote };

export function ClientNotesTab({
  discipline,
  visitUuid,
}: {
  discipline: TherapyDiscipline;
  visitUuid: string;
}) {
  const { toast } = useToast();
  const [notes, setNotes] = useState<TherapyClientNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>({ kind: "idle" });
  const [draftNote, setDraftNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadNotes() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await fetchTherapyVisitClientNotes(discipline, visitUuid);
        if (!cancelled) {
          setNotes(data);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Could not load client notes.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadNotes();
    return () => {
      cancelled = true;
    };
  }, [discipline, visitUuid]);

  function startCreate() {
    setEditorMode({ kind: "create" });
    setDraftNote("");
  }

  function startEdit(note: TherapyClientNote) {
    setEditorMode({ kind: "edit", note });
    setDraftNote(note.note);
  }

  function cancelEditor() {
    setEditorMode({ kind: "idle" });
    setDraftNote("");
  }

  async function saveNote() {
    const trimmed = draftNote.trim();
    if (!trimmed) {
      toast({
        variant: "error",
        title: "Note required",
        description: "Enter note text before saving.",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editorMode.kind === "create") {
        const created = await createTherapyVisitClientNote(
          discipline,
          visitUuid,
          trimmed,
        );
        setNotes((current) => [created, ...current]);
        toast({
          variant: "success",
          title: "Note added",
          description: "The client note has been saved.",
        });
      } else if (editorMode.kind === "edit") {
        const updated = await updateTherapyVisitClientNote(
          discipline,
          visitUuid,
          editorMode.note.uuid,
          trimmed,
        );
        setNotes((current) =>
          current.map((item) =>
            item.uuid === updated.uuid ? updated : item,
          ),
        );
        toast({
          variant: "success",
          title: "Note updated",
          description: "Your changes have been saved.",
        });
      }
      cancelEditor();
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not save note",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <PageLoader message="Loading client notes..." />;
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-700">
        {loadError}
      </div>
    );
  }

  return (
    <div className="space-y-4 px-2 py-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-brand-navy">Notes</h2>
          <p className="mt-1 text-xs text-brand-muted">
            Client notes shared across all visits for this patient.
          </p>
        </div>
        <AddActionButton
          label="Add note"
          size="sm"
          disabled={editorMode.kind !== "idle"}
          onClick={startCreate}
        />
      </div>

      {editorMode.kind === "create" ? (
        <form
          className="rounded-xl border border-brand-border bg-white p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void saveNote();
          }}
        >
          <p className="mb-3 text-sm font-medium text-brand-navy">New note</p>
          <Textarea
            value={draftNote}
            onChange={(event) => setDraftNote(event.target.value)}
            placeholder="Write a client note..."
            rows={4}
            disabled={isSaving}
          />
          <TherapyFormActionBar
            isSubmitting={isSaving}
            message="Unsaved client note"
            saveLabel="Save note"
            onCancel={cancelEditor}
          />
        </form>
      ) : null}

      {notes.length === 0 && editorMode.kind === "idle" ? (
        <div className="rounded-xl border border-dashed border-brand-border px-4 py-12 text-center">
          <StickyNote className="mx-auto size-6 text-brand-muted" />
          <p className="mt-2 text-sm font-medium text-brand-navy">
            No client notes yet
          </p>
          <p className="mt-1 text-xs text-brand-muted">
            Add the first note for this client.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const isEditing =
              editorMode.kind === "edit" && editorMode.note.uuid === note.uuid;

            return (
              <article
                key={note.uuid}
                className="rounded-xl border border-brand-border bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-brand-navy">
                        {DATE_FORMATTER.format(new Date(note.created_at))}
                      </p>
                      {note.is_edited ? (
                        <Badge
                          variant="outline"
                          className="h-5 border-amber-200 bg-amber-50 px-1.5 text-[10px] text-amber-800"
                        >
                          Edited
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-brand-muted">
                      {note.created_by_name?.trim() || "Unknown author"}
                    </p>
                  </div>
                  {!isEditing && editorMode.kind === "idle" ? (
                    <SecondaryButton
                      type="button"
                      size="sm"
                      className="h-7 shrink-0 px-2 text-xs"
                      onClick={() => startEdit(note)}
                    >
                      Edit
                    </SecondaryButton>
                  ) : null}
                </div>

                {isEditing ? (
                  <form
                    className="mt-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void saveNote();
                    }}
                  >
                    <Textarea
                      value={draftNote}
                      onChange={(event) => setDraftNote(event.target.value)}
                      placeholder="Update the client note..."
                      rows={4}
                      disabled={isSaving}
                    />
                    <TherapyFormActionBar
                      isSubmitting={isSaving}
                      message="Unsaved client note changes"
                      saveLabel="Save changes"
                      onCancel={cancelEditor}
                    />
                  </form>
                ) : (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-brand-slate">
                    {note.note}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
