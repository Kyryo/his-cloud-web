"use client";

import { CalendarClock, FilePlus2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { LoadingSpinner, SpinnerGlyph } from "@/components/loading-spinner";
import {
  AddActionButton,
  DestructiveButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TherapySessionForm } from "@/features/therapy/components/TherapySessionForm";
import { TherapySessionRecord } from "@/features/therapy/components/TherapySessionRecord";
import {
  fetchTherapyVisitSessions,
  removeTherapyVisitSession,
} from "@/features/therapy/services/therapy.service";
import type {
  TherapyDiscipline,
  TherapySession,
} from "@/features/therapy/types/therapy.types";
import { useToast } from "@/providers/toast-provider";

export function SessionsTab({
  discipline,
  visitUuid,
  hasTreatmentPlan,
  isReadOnly,
  onSessionCountChanged,
}: {
  discipline: TherapyDiscipline;
  visitUuid: string;
  hasTreatmentPlan: boolean;
  isReadOnly: boolean;
  onSessionCountChanged: (count: number) => void;
}) {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [editing, setEditing] = useState<TherapySession | null>(null);
  const [deleting, setDeleting] = useState<TherapySession | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      const records = await fetchTherapyVisitSessions(discipline, visitUuid);
      setSessions(records);
      onSessionCountChanged(records.length);
      setError(null);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Could not load therapy sessions.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [discipline, onSessionCountChanged, visitUuid]);

  useEffect(() => {
    let cancelled = false;
    void fetchTherapyVisitSessions(discipline, visitUuid)
      .then((records) => {
        if (!cancelled) {
          setSessions(records);
          onSessionCountChanged(records.length);
          setError(null);
        }
      })
      .catch((fetchError: unknown) => {
        if (!cancelled) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Could not load therapy sessions.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [discipline, onSessionCountChanged, visitUuid]);

  async function deleteSession() {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await removeTherapyVisitSession(discipline, visitUuid, deleting.uuid);
      await loadSessions();
      setDeleting(null);
      toast({
        variant: "success",
        title: "Session deleted",
        description: "The therapy session was removed.",
      });
    } catch (deleteError) {
      toast({
        variant: "error",
        title: "Could not delete session",
        description:
          deleteError instanceof Error
            ? deleteError.message
            : "Something went wrong.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  if (isFormOpen) {
    return (
      <TherapySessionForm
        key={editing?.uuid ?? "new-session"}
        discipline={discipline}
        visitUuid={visitUuid}
        session={editing}
        onCancel={() => {
          setEditing(null);
          setIsFormOpen(false);
        }}
        onSaved={async () => {
          await loadSessions();
          setEditing(null);
          setIsFormOpen(false);
        }}
      />
    );
  }

  return (
    <div>
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-brand-border pb-5">
        <div>
          <h2 className="text-xl font-semibold text-brand-navy">Sessions</h2>
          <p className="mt-1 text-sm text-brand-muted">
            Review and manage treatment sessions recorded for this visit.
          </p>
        </div>
        <AddActionButton
          label="Record session"
          disabled={!hasTreatmentPlan || isReadOnly}
          onClick={() => {
            setEditing(null);
            setIsFormOpen(true);
          }}
        />
      </header>

      {!hasTreatmentPlan ? (
        <div className="py-14 text-center">
          <FilePlus2 className="mx-auto size-9 text-brand-muted" />
          <h3 className="mt-4 text-base font-semibold text-brand-navy">
            Treatment plan required
          </h3>
          <p className="mt-2 text-sm text-brand-muted">
            Assign a treatment plan before recording therapy sessions.
          </p>
        </div>
      ) : isLoading ? (
        <LoadingSpinner
          message="Loading sessions..."
          size="sm"
          className="py-16"
        />
      ) : error ? (
        <div className="py-12 text-center">
          <p className="text-sm text-red-700">{error}</p>
          <SecondaryButton
            size="sm"
            className="mt-4"
            onClick={() => {
              setError(null);
              setIsLoading(true);
              void loadSessions();
            }}
          >
            Try again
          </SecondaryButton>
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-14 text-center">
          <CalendarClock className="mx-auto size-9 text-brand-muted" />
          <h3 className="mt-4 text-base font-semibold text-brand-navy">
            No sessions recorded
          </h3>
          <p className="mt-2 text-sm text-brand-muted">
            Record the first session for this visit.
          </p>
        </div>
      ) : (
        <div className="space-y-4 py-5">
          {sessions.map((session) => (
            <TherapySessionRecord
              key={session.uuid}
              session={session}
              isReadOnly={isReadOnly}
              onEdit={() => {
                setEditing(session);
                setIsFormOpen(true);
              }}
              onDelete={() => setDeleting(session)}
            />
          ))}
        </div>
      )}

      <Dialog open={Boolean(deleting)} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete therapy session?</DialogTitle>
            <DialogDescription>
              This permanently removes session {deleting?.session_number}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <SecondaryButton onClick={() => setDeleting(null)}>
              Cancel
            </SecondaryButton>
            <DestructiveButton
              disabled={isDeleting}
              onClick={() => void deleteSession()}
            >
              {isDeleting ? <SpinnerGlyph size="xs" /> : null}
              Delete session
            </DestructiveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
