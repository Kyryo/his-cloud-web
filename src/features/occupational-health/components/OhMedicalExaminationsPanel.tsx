"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, FileWarning } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  OhExamTypeDialog,
  type MedicalExamStartType,
} from "@/features/occupational-health/components/OhExamTypeDialog";
import { OhExamTemplateCaptureForm } from "@/features/occupational-health/components/OhExamTemplateCaptureForm";
import { OhProcedureChecklistPanel } from "@/features/occupational-health/components/OhProcedureChecklistPanel";
import type { useOhEncounterWorkspaceData } from "@/features/occupational-health/hooks/use-occupational-health";
import {
  emptyExamTemplateAnswers,
  parseExamTemplateSnapshot,
  type ExamTemplateAnswers,
  type ExamTemplateResponseEnvelope,
} from "@/features/occupational-health/lib/exam-template-snapshot";
import { EXAM_TEMPLATE_RESPONSE_KEY } from "@/features/occupational-health/lib/oh-encounter-modules";
import {
  createOhExamination,
  fetchOhExamTemplateVersions,
  fetchOhHazardProfiles,
  patchOhExaminationResponses,
} from "@/features/occupational-health/services/oh.service";
import type {
  EmploymentEpisode,
  OhExamination,
  OhHazardProfile,
  OhVisitEncounter,
} from "@/features/occupational-health/types";
import { resolveActiveRiskProfileEpisode } from "@/features/occupational-health/utils/customer-has-risk-profile";
import { newestFirst } from "@/features/occupational-health/utils/oh-format";
import {
  formatExamTypeLabel,
  MEDICAL_EXAM_START_TYPES,
} from "@/features/occupational-health/utils/oh-labels";
import { useToast } from "@/providers/toast-provider";

type OhMedicalExaminationsPanelProps = {
  encounter: OhVisitEncounter;
  episodes: EmploymentEpisode[];
  workspace: ReturnType<typeof useOhEncounterWorkspaceData>;
};

function readEnvelope(
  examination: OhExamination | null | undefined,
): ExamTemplateResponseEnvelope | null {
  const raw = examination?.responses_json?.[EXAM_TEMPLATE_RESPONSE_KEY];
  if (!raw || typeof raw !== "object") {
    return null;
  }
  return raw as ExamTemplateResponseEnvelope;
}

function isMedicalExamStartType(value: string): value is MedicalExamStartType {
  return MEDICAL_EXAM_START_TYPES.some((option) => option.value === value);
}

function findExamForType(
  examinations: OhExamination[],
  examType: string,
  examTemplateUuid: string | null,
): OhExamination | null {
  const matches = examinations.filter((exam) => exam.exam_type === examType);
  if (matches.length === 0) {
    return null;
  }
  if (examTemplateUuid) {
    const withTemplate = matches.find((exam) => {
      const envelope = readEnvelope(exam);
      return !envelope?.template_uuid || envelope.template_uuid === examTemplateUuid;
    });
    if (withTemplate) {
      return withTemplate;
    }
  }
  return (
    newestFirst(matches, (exam) => exam.examined_at ?? exam.created_at)[0] ?? null
  );
}

/** Prefer the newest exam that matches the current template, else newest start type. */
function inferExamTypeFromExaminations(
  examinations: OhExamination[],
  examTemplateUuid: string | null,
): MedicalExamStartType | null {
  const ordered = newestFirst(
    examinations,
    (exam) => exam.examined_at ?? exam.created_at,
  );
  if (examTemplateUuid) {
    const matchingTemplate = ordered.find((exam) => {
      if (!isMedicalExamStartType(exam.exam_type)) {
        return false;
      }
      const envelope = readEnvelope(exam);
      return !envelope?.template_uuid || envelope.template_uuid === examTemplateUuid;
    });
    if (matchingTemplate && isMedicalExamStartType(matchingTemplate.exam_type)) {
      return matchingTemplate.exam_type;
    }
  }
  const newest = ordered.find((exam) => isMedicalExamStartType(exam.exam_type));
  if (!newest || !isMedicalExamStartType(newest.exam_type)) {
    return null;
  }
  return newest.exam_type;
}

export function OhMedicalExaminationsPanel({
  encounter,
  episodes,
  workspace,
}: OhMedicalExaminationsPanelProps) {
  const { toast } = useToast();
  const episode = resolveActiveRiskProfileEpisode(episodes);
  const hazardProfileId = episode?.hazard_profile ?? null;

  const profilesQuery = useQuery({
    queryKey: ["oh-hazard-profiles", episode?.employer ?? "none"],
    queryFn: () => fetchOhHazardProfiles(episode?.employer),
    enabled: Boolean(episode?.employer),
  });

  const riskProfile: OhHazardProfile | null = useMemo(() => {
    if (!hazardProfileId || !profilesQuery.data) {
      return null;
    }
    return profilesQuery.data.find((row) => row.id === hazardProfileId) ?? null;
  }, [hazardProfileId, profilesQuery.data]);

  const examTemplateUuid = riskProfile?.exam_template ?? null;

  const versionsQuery = useQuery({
    queryKey: ["oh-exam-template-versions", examTemplateUuid ?? ""],
    queryFn: () => fetchOhExamTemplateVersions(examTemplateUuid!),
    enabled: Boolean(examTemplateUuid),
  });

  const publishedVersion = useMemo(() => {
    const rows = versionsQuery.data ?? [];
    return (
      rows.find((row) => row.status === "published") ??
      [...rows].sort((a, b) => b.number - a.number)[0] ??
      null
    );
  }, [versionsQuery.data]);

  const snapshot = useMemo(
    () => parseExamTemplateSnapshot(publishedVersion?.snapshot_json),
    [publishedVersion?.snapshot_json],
  );

  const templateReady = Boolean(
    episode &&
      hazardProfileId != null &&
      riskProfile &&
      examTemplateUuid &&
      publishedVersion &&
      snapshot &&
      snapshot.sections.length > 0,
  );

  const inferredExamType = useMemo(
    () =>
      inferExamTypeFromExaminations(workspace.examinations, examTemplateUuid),
    [examTemplateUuid, workspace.examinations],
  );
  const [examTypeOverride, setExamTypeOverride] = useState<MedicalExamStartType | null>(
    null,
  );
  const selectedExamType = examTypeOverride ?? inferredExamType;
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [examination, setExamination] = useState<OhExamination | null>(null);
  const [answers, setAnswers] = useState<ExamTemplateAnswers>(emptyExamTemplateAnswers());
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isResolvingExam, setIsResolvingExam] = useState(false);
  const createStarted = useRef(false);
  const examinationRef = useRef<OhExamination | null>(null);
  const answersHydratedKeyRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  examinationRef.current = examination;

  const needsExamType =
    templateReady && !workspace.isLoading && !selectedExamType;

  useEffect(() => {
    if (!selectedExamType) {
      setExamination(null);
      examinationRef.current = null;
      setAnswers(emptyExamTemplateAnswers());
      answersHydratedKeyRef.current = null;
      return;
    }
    const matched = findExamForType(
      workspace.examinations,
      selectedExamType,
      examTemplateUuid,
    );
    setExamination((current) => {
      if (
        current &&
        matched &&
        current.uuid === matched.uuid &&
        (current.row_version ?? 0) >= (matched.row_version ?? 0)
      ) {
        return current;
      }
      return matched;
    });

    const hydrateKey = `${matched?.uuid ?? `pending:${selectedExamType}`}:${examTemplateUuid ?? ""}`;
    if (answersHydratedKeyRef.current === hydrateKey) {
      return;
    }
    answersHydratedKeyRef.current = hydrateKey;
    const envelope = readEnvelope(matched);
    if (
      envelope?.template_uuid &&
      examTemplateUuid &&
      envelope.template_uuid === examTemplateUuid
    ) {
      setAnswers(envelope.answers ?? emptyExamTemplateAnswers());
    } else {
      setAnswers(emptyExamTemplateAnswers());
    }
  }, [selectedExamType, examTemplateUuid, workspace.examinations]);

  async function resolveExamination(
    examType: MedicalExamStartType,
  ): Promise<OhExamination | null> {
    const existing = findExamForType(
      workspace.examinations,
      examType,
      examTemplateUuid,
    );
    if (existing) {
      setExamination(existing);
      examinationRef.current = existing;
      return existing;
    }
    if (createStarted.current) {
      return null;
    }
    createStarted.current = true;
    setIsResolvingExam(true);
    try {
      const created = await createOhExamination({
        encounter: encounter.id,
        employment_episode: episode?.id ?? null,
        exam_type: examType,
        occupational_attendance: true,
        template_code: riskProfile?.exam_template_code || riskProfile?.code || "exam",
        examined_at: new Date().toISOString(),
        notes: "",
      });
      setExamination(created);
      examinationRef.current = created;
      answersHydratedKeyRef.current = `${created.uuid}:${examTemplateUuid ?? ""}`;
      workspace.refetchAll();
      return created;
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not start examination",
        description: error instanceof Error ? error.message : undefined,
      });
      return null;
    } finally {
      createStarted.current = false;
      setIsResolvingExam(false);
    }
  }

  async function handleExamTypeConfirm(examType: MedicalExamStartType) {
    setExamTypeOverride(examType);
    setTypeDialogOpen(false);
    await resolveExamination(examType);
  }

  function openChangeTypeDialog() {
    setTypeDialogOpen(true);
  }

  async function persistAnswers(next: ExamTemplateAnswers) {
    if (!examTemplateUuid || !snapshot || !selectedExamType) {
      return;
    }
    let exam = examinationRef.current;
    if (!exam) {
      exam = await resolveExamination(selectedExamType);
    }
    if (!exam) {
      return;
    }
    const envelope: ExamTemplateResponseEnvelope = {
      template_uuid: examTemplateUuid,
      template_name: riskProfile?.exam_template_name ?? undefined,
      version_number: publishedVersion?.number ?? null,
      hazard_profile_id: hazardProfileId,
      answers: next,
    };
    const responses_json = {
      ...(exam.responses_json ?? {}),
      [EXAM_TEMPLATE_RESPONSE_KEY]: envelope,
    };
    setSaveState("saving");
    try {
      const updated = await patchOhExaminationResponses(exam.uuid, {
        responses_json,
        row_version: exam.row_version ?? 1,
      });
      setExamination(updated);
      examinationRef.current = updated;
      setSaveState("saved");
    } catch (error) {
      setSaveState("error");
      toast({
        variant: "error",
        title: "Could not save examination",
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  function handleAnswersChange(next: ExamTemplateAnswers) {
    setAnswers(next);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      void persistAnswers(next);
    }, 600);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  if (!episode || hazardProfileId == null) {
    return (
      <PanelEmpty
        icon={ClipboardList}
        title="No risk profile on this visit"
        description="Assign a risk profile on the Employment panel so the correct examination template can load."
      />
    );
  }

  if (profilesQuery.isLoading || (examTemplateUuid && versionsQuery.isLoading)) {
    return (
      <div className="space-y-3 p-5" aria-hidden>
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!riskProfile) {
    return (
      <PanelEmpty
        icon={FileWarning}
        title="Risk profile could not be loaded"
        description="The employment episode references a risk profile that is missing or inactive."
      />
    );
  }

  if (!examTemplateUuid) {
    return (
      <PanelEmpty
        icon={ClipboardList}
        title="No examination template on this risk profile"
        description={`Attach and publish an exam template on “${riskProfile.name}” in Occupational Health settings.`}
      />
    );
  }

  if (!publishedVersion || !snapshot || snapshot.sections.length === 0) {
    return (
      <PanelEmpty
        icon={ClipboardList}
        title="Examination template is not published"
        description="Publish the exam template linked to this risk profile before completing medical examinations."
      />
    );
  }

  const showCapture = Boolean(selectedExamType);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <OhExamTypeDialog
        open={typeDialogOpen || needsExamType}
        onOpenChange={setTypeDialogOpen}
        onConfirm={(examType) => {
          void handleExamTypeConfirm(examType);
        }}
        required={needsExamType}
        initialExamType={selectedExamType ?? ""}
      />
      {showCapture ? (
        <>
          <div className="flex h-11 items-center justify-between gap-3 border-b border-dash-border px-4 sm:px-5">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-[13px] font-medium text-brand-navy">
                {formatExamTypeLabel(selectedExamType!)}
              </p>
              {riskProfile.name ? (
                <Badge variant="secondary" className="max-w-[12rem] truncate">
                  {riskProfile.name}
                </Badge>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-[12px] text-dash-muted" aria-live="polite">
                {isResolvingExam
                  ? "Starting"
                  : saveState === "saving"
                    ? "Saving"
                    : saveState === "saved"
                      ? "Saved"
                      : saveState === "error"
                        ? "Save failed"
                        : null}
              </span>
              <button
                type="button"
                onClick={openChangeTypeDialog}
                data-testid="oh-exam-change-type"
                className="text-[13px] font-medium text-brand-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
              >
                Change type
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            <div className="mx-auto max-w-3xl space-y-8">
              <OhExamTemplateCaptureForm
                snapshot={snapshot}
                templateName={riskProfile.exam_template_name}
                value={answers}
                onChange={handleAnswersChange}
              />
              <OhProcedureChecklistPanel
                examination={examination}
                onChanged={workspace.refetchAll}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="flex min-h-full flex-1 items-center justify-center bg-white px-6 py-16">
          <EmptyState
            icon={ClipboardList}
            title="Select an examination type"
            description="Choose Admission, Periodic, Change of function, Return to work, or Demissional to begin."
          />
        </div>
      )}
    </div>
  );
}

function PanelEmpty({
  icon,
  title,
  description,
}: {
  icon: typeof ClipboardList;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-white px-6 py-16">
      <EmptyState icon={icon} title={title} description={description} />
    </div>
  );
}
