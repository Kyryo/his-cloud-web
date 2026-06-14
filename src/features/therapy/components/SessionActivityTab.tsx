"use client";

import { Dumbbell, Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { LoadingSpinner, SpinnerGlyph } from "@/components/loading-spinner";
import {
  AddActionButton,
  DestructiveButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SessionActivityForm } from "@/features/therapy/components/SessionActivityForm";
import {
  fetchTherapyVisitSessionActivities,
  removeTherapyVisitSessionActivity,
} from "@/features/therapy/services/therapy.service";
import type {
  TherapyDiscipline,
  TherapyPerformanceNoteOption,
  TherapySessionActivity,
  TherapySessionOption,
} from "@/features/therapy/types/therapy.types";
import { useToast } from "@/providers/toast-provider";

export function SessionActivityTab({
  discipline,
  visitUuid,
  hasSession,
  isReadOnly,
  onActivityCountChanged,
}: {
  discipline: TherapyDiscipline;
  visitUuid: string;
  hasSession: boolean;
  isReadOnly: boolean;
  onActivityCountChanged: (count: number) => void;
}) {
  const { toast } = useToast();
  const [activities, setActivities] = useState<TherapySessionActivity[]>([]);
  const [sessionOptions, setSessionOptions] = useState<TherapySessionOption[]>([]);
  const [performanceNoteOptions, setPerformanceNoteOptions] = useState<
    TherapyPerformanceNoteOption[]
  >([]);
  const [editing, setEditing] = useState<TherapySessionActivity | null>(null);
  const [removing, setRemoving] = useState<TherapySessionActivity | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(hasSession);
  const [isRemoving, setIsRemoving] = useState(false);

  const loadActivities = useCallback(async () => {
    if (!hasSession) return;
    const response = await fetchTherapyVisitSessionActivities(
      discipline,
      visitUuid,
    );
    setActivities(response.results);
    setSessionOptions(response.session_options);
    setPerformanceNoteOptions(response.performance_note_options);
    onActivityCountChanged(response.results.length);
    setIsLoading(false);
  }, [discipline, hasSession, onActivityCountChanged, visitUuid]);

  useEffect(() => {
    let cancelled = false;
    if (!hasSession) return;
    void fetchTherapyVisitSessionActivities(discipline, visitUuid)
      .then((response) => {
        if (!cancelled) {
          setActivities(response.results);
          setSessionOptions(response.session_options);
          setPerformanceNoteOptions(response.performance_note_options);
          onActivityCountChanged(response.results.length);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          toast({
            variant: "error",
            title: "Could not load activities",
            description:
              error instanceof Error ? error.message : "Something went wrong.",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [discipline, hasSession, onActivityCountChanged, toast, visitUuid]);

  async function removeActivity() {
    if (!removing) return;
    setIsRemoving(true);
    try {
      await removeTherapyVisitSessionActivity(
        discipline,
        visitUuid,
        removing.uuid,
      );
      await loadActivities();
      setRemoving(null);
      toast({
        variant: "success",
        title: "Activity removed",
        description: "The activity was removed from this session.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not remove activity",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsRemoving(false);
    }
  }

  if (formOpen) {
    return (
      <SessionActivityForm
        key={editing?.uuid ?? "new-activity"}
        discipline={discipline}
        visitUuid={visitUuid}
        activity={editing}
        sessionOptions={sessionOptions}
        performanceNoteOptions={performanceNoteOptions}
        onCancel={() => {
          setEditing(null);
          setFormOpen(false);
        }}
        onSaved={async () => {
          await loadActivities();
          setEditing(null);
          setFormOpen(false);
        }}
      />
    );
  }

  return (
    <div>
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-brand-border pb-5">
        <div>
          <h2 className="text-xl font-semibold text-brand-navy">
            Session activity
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            Record exercises, interventions, and observed performance.
          </p>
        </div>
        <AddActionButton
          label="Add activity"
          disabled={
            !hasSession || isReadOnly || isLoading || sessionOptions.length === 0
          }
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        />
      </header>

      {!hasSession ? (
        <div className="py-14 text-center">
          <Dumbbell className="mx-auto size-9 text-brand-muted" />
          <h3 className="mt-4 font-semibold text-brand-navy">
            Record a session first
          </h3>
          <p className="mt-2 text-sm text-brand-muted">
            Session activities can be added after the therapy session is saved.
          </p>
        </div>
      ) : isLoading ? (
        <LoadingSpinner
          message="Loading activities..."
          size="sm"
          className="py-16"
        />
      ) : activities.length === 0 ? (
        <div className="py-14 text-center">
          <Dumbbell className="mx-auto size-9 text-brand-muted" />
          <h3 className="mt-4 font-semibold text-brand-navy">
            No session activities
          </h3>
          <p className="mt-2 text-sm text-brand-muted">
            Add the first activity performed during this session.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-brand-border">
          {activities.map((activity) => (
            <article key={activity.uuid} className="py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-brand-navy">
                      {activity.name}
                    </h3>
                    <Badge variant="secondary">{activity.category}</Badge>
                    {activity.is_home_program ? (
                      <Badge variant="success">Home program</Badge>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-brand-slate">
                    {activity.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-brand-muted">
                    {activity.sets ? <span>{activity.sets} sets</span> : null}
                    {activity.reps ? <span>{activity.reps} reps</span> : null}
                    {activity.duration_seconds ? (
                      <span>{activity.duration_seconds} seconds</span>
                    ) : null}
                    {activity.resistance_or_level ? (
                      <span>{activity.resistance_or_level}</span>
                    ) : null}
                  </div>
                </div>
                {!isReadOnly ? (
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Edit ${activity.name}`}
                    onClick={() => {
                      setEditing(activity);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-brand-slate hover:bg-red-50 hover:text-red-700"
                    aria-label={`Remove ${activity.name}`}
                    onClick={() => setRemoving(activity)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={Boolean(removing)} onOpenChange={() => setRemoving(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove session activity?</DialogTitle>
            <DialogDescription>
              This removes the activity from the session. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <SecondaryButton onClick={() => setRemoving(null)}>
              Cancel
            </SecondaryButton>
            <DestructiveButton
              disabled={isRemoving}
              onClick={() => void removeActivity()}
            >
              {isRemoving ? <SpinnerGlyph size="xs" /> : null}
              Remove
            </DestructiveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
