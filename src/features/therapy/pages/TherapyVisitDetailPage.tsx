"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarClock, Link2, Pin, Settings } from "lucide-react";

import { ClientAvatar } from "@/components/client-avatar";
import { SpinnerGlyph } from "@/components/loading-spinner";
import {
  PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS,
  PageLoader,
} from "@/components/page-loader";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PrimaryButton,
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
import {
  DetailPageHeaderSection,
  DetailPageLayout,
} from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";
import { TherapyVisitErrorState } from "@/features/therapy/components/TherapyVisitErrorState";
import { TherapyVisitStatusBadge } from "@/features/therapy/components/TherapyVisitStatusBadge";
import { TherapyVisitTabs } from "@/features/therapy/components/TherapyVisitTabs";
import type { TherapyVisitTabId } from "@/features/therapy/components/TherapyVisitTabs";
import {
  createTherapyVisitAssessment,
  fetchTherapyVisitAssessment,
  fetchTherapyVisitDetails,
  fetchTherapyVisitSessionActivities,
  fetchTherapyVisitSessions,
  fetchTherapyVisitTreatmentGoals,
} from "@/features/therapy/services/therapy.service";
import type {
  TherapyAssessment,
  TherapyDiscipline,
  TherapyVisit,
  TherapyVisitTreatmentGoals,
} from "@/features/therapy/types/therapy.types";
import { THERAPY_DISCIPLINE_CONFIG } from "@/features/therapy/utils/therapy-access";
import { useToast } from "@/providers/toast-provider";

const VISIT_DATE_FORMATTER = new Intl.DateTimeFormat("en-MW", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function TherapyVisitDetailPage({
  discipline,
  visitUuid,
}: {
  discipline: TherapyDiscipline;
  visitUuid: string;
}) {
  const [visit, setVisit] = useState<TherapyVisit | null>(null);
  const [treatmentGoals, setTreatmentGoals] =
    useState<TherapyVisitTreatmentGoals | null>(null);
  const [assessment, setAssessment] = useState<TherapyAssessment | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [activityCount, setActivityCount] = useState(0);
  const [activeTab, setActiveTab] =
    useState<TherapyVisitTabId>("treatment-plan");
  const [isLoading, setIsLoading] = useState(true);
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false);
  const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const config = THERAPY_DISCIPLINE_CONFIG[discipline];

  useAppBreadcrumb(visit?.customer_name ?? null);

  const loadTreatmentGoals = useCallback(async () => {
    const data = await fetchTherapyVisitTreatmentGoals(discipline, visitUuid);
    setTreatmentGoals(data);
  }, [discipline, visitUuid]);

  async function createAssessment() {
    setIsCreatingAssessment(true);
    try {
      const createdAssessment = await createTherapyVisitAssessment(
        discipline,
        visitUuid,
      );
      setAssessment(createdAssessment);
      setAssessmentDialogOpen(false);
      setActiveTab("assessment");
      toast({
        variant: "success",
        title: "Assessment session created",
        description: "You can now add assessment notes.",
      });
    } catch (createError) {
      toast({
        variant: "error",
        title: "Could not create assessment session",
        description:
          createError instanceof Error
            ? createError.message
            : "Something went wrong.",
      });
    } finally {
      setIsCreatingAssessment(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      fetchTherapyVisitDetails(discipline, visitUuid),
      fetchTherapyVisitTreatmentGoals(discipline, visitUuid),
      fetchTherapyVisitSessions(discipline, visitUuid),
      fetchTherapyVisitAssessment(discipline, visitUuid),
    ])
      .then(async ([record, goals, sessions, assessmentRecord]) => {
        const activityResponse =
          sessions.length > 0
            ? await fetchTherapyVisitSessionActivities(discipline, visitUuid)
            : null;
        if (!cancelled) {
          setVisit(record);
          setTreatmentGoals(goals);
          setAssessment(assessmentRecord);
          setSessionCount(sessions.length);
          setActivityCount(activityResponse?.results.length ?? 0);
          setActiveTab(goals.treatment_plan ? "sessions" : "treatment-plan");
        }
      })
      .catch((fetchError: unknown) => {
        if (!cancelled) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Could not load visit details.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [discipline, visitUuid]);

  if (isLoading) {
    return (
      <PageLoader
        message="Loading visit details..."
        className={PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS}
      />
    );
  }

  if (error || !visit) {
    return (
      <TherapyVisitErrorState
        message={error ?? "This visit could not be loaded."}
      />
    );
  }

  const isReadOnly =
    visit.status === "completed" ||
    treatmentGoals?.treatment_plan?.status === "completed" ||
    treatmentGoals?.treatment_plan?.status === "discontinued";

  return (
    <DetailPageLayout data-testid="therapy-visit-detail-page">
      <DetailPageHeaderSection>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <ClientAvatar
              name={visit.customer_name}
              className="size-12 text-sm"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-semibold text-brand-navy">
                  {visit.customer_name}
                </h1>
                <Badge variant="secondary">
                  {visit.customer_gender || "Gender not recorded"}
                </Badge>
                <TherapyVisitStatusBadge status={visit.status} />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-brand-muted">
                <span>
                  {visit.customer_age === null
                    ? "Age not recorded"
                    : `${visit.customer_age} years`}
                </span>
                <span className="font-mono text-sm text-brand-slate">
                  {visit.customer_identifier}
                </span>
                <Badge variant="outline">
                  {visit.mode_of_payment === "insurance" ? "Insurance" : "Cash"}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-emerald-200 bg-emerald-50 text-emerald-700"
                >
                  + {sessionCount} {sessionCount === 1 ? "session" : "sessions"}
                </Badge>
                {treatmentGoals?.treatment_plan ? (
                  <Badge
                    variant="outline"
                    className="max-w-48 gap-1.5 border-brand-border bg-white text-brand-navy"
                    title={treatmentGoals.treatment_plan.title}
                  >
                    <Pin className="size-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">
                      {treatmentGoals.treatment_plan.title}
                    </span>
                  </Badge>
                ) : !isReadOnly ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-full border-brand-primary/30 bg-brand-tint text-xs text-brand-primary"
                    onClick={() => setActiveTab("treatment-plan")}
                  >
                    <Link2 className="size-3" aria-hidden="true" />
                    Link to treatment plan
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-3">
              <Badge variant="outline">{config.label}</Badge>
              <span className="text-sm font-medium text-emerald-700">
                + {activityCount}{" "}
                {activityCount === 1 ? "activity" : "activities"}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              {!assessment && !isReadOnly ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="px-2 text-brand-muted"
                  onClick={() => setAssessmentDialogOpen(true)}
                >
                  <Settings className="size-4" aria-hidden="true" />
                  Settings
                </Button>
              ) : null}
              <p className="flex items-center gap-2 text-sm text-brand-muted">
                <CalendarClock className="size-4" aria-hidden="true" />
                {VISIT_DATE_FORMATTER.format(new Date(visit.visit_date))}
              </p>
            </div>
          </div>
        </div>
      </DetailPageHeaderSection>
      {treatmentGoals ? (
        <TherapyVisitTabs
          discipline={discipline}
          visitUuid={visitUuid}
          assessment={assessment}
          visit={visit}
          treatmentGoals={treatmentGoals}
          onTreatmentGoalsChanged={loadTreatmentGoals}
          onSessionCountChanged={setSessionCount}
          onActivityCountChanged={setActivityCount}
          onAssessmentChanged={setAssessment}
          sessionCount={sessionCount}
          activeTab={activeTab}
          onActiveTabChange={setActiveTab}
        />
      ) : null}

      <Dialog
        open={assessmentDialogOpen}
        onOpenChange={setAssessmentDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create assessment session?</DialogTitle>
            <DialogDescription>
              This creates the single assessment record for this visit. After
              creation, use the Assessment Session tab to add and update notes.
            </DialogDescription>
          </DialogHeader>
          {!treatmentGoals?.treatment_plan ? (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Treatment plan required</AlertTitle>
              <AlertDescription>
                Link a treatment plan before creating the assessment session.
              </AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter>
            <SecondaryButton
              type="button"
              disabled={isCreatingAssessment}
              onClick={() => setAssessmentDialogOpen(false)}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="button"
              disabled={
                isCreatingAssessment || !treatmentGoals?.treatment_plan
              }
              onClick={() => void createAssessment()}
            >
              {isCreatingAssessment ? <SpinnerGlyph size="xs" /> : null}
              OK
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DetailPageLayout>
  );
}
