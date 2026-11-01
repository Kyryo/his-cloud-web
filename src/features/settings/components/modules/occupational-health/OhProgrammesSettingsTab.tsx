"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  OhAddProgrammeDialog,
  type OhAddProgrammeDraft,
} from "@/features/settings/components/modules/occupational-health/OhAddProgrammeDialog";
import { OhCatalogItemPicker } from "@/features/settings/components/modules/occupational-health/OhCatalogItemPicker";
import { OhCatalogListPanel } from "@/features/settings/components/modules/occupational-health/OhCatalogListPanel";
import {
  createOhProgramme,
  createOhProgrammeVersion,
  enableOhConfigurableProgrammes,
  fetchOhFeatureFlags,
  fetchOhJobProfiles,
  fetchOhProgrammeVersion,
  fetchOhProgrammes,
  publishOhProgrammeVersion,
} from "@/features/occupational-health/services/oh.service";
import type {
  OhEmployer,
  OhJobProfile,
  OhProgramme,
  OhRequirementsConfig,
  OhRequirementsMatrixRow,
} from "@/features/occupational-health/types";
import { BffError } from "@/lib/bff-client";
import { useToast } from "@/providers/toast-provider";

type OhProgrammesSettingsTabProps = {
  isActive: boolean;
  employer: OhEmployer;
  embedded?: boolean;
};

const FLAG_KEY = "ohs.configurable.programmes";

function emptyRequirements(): OhRequirementsConfig {
  return { schema_version: 1, matrix: [], critical_activities: [] };
}

function requirementsFromConfig(
  config: Record<string, unknown> | undefined,
): OhRequirementsConfig {
  const raw = config?.requirements;
  if (!raw || typeof raw !== "object") {
    return emptyRequirements();
  }
  const typed = raw as OhRequirementsConfig;
  return {
    schema_version: 1,
    matrix: Array.isArray(typed.matrix) ? typed.matrix : [],
    critical_activities: Array.isArray(typed.critical_activities)
      ? typed.critical_activities
      : [],
  };
}

function codesToProcedures(codes: string[]) {
  return codes.map((code) => ({
    code,
    requirement: "mandatory" as const,
  }));
}

export function OhProgrammesSettingsTab({
  isActive,
  employer,
  embedded = false,
}: OhProgrammesSettingsTabProps) {
  const { toast } = useToast();
  const [flagEnabled, setFlagEnabled] = useState(false);
  const [flagLoading, setFlagLoading] = useState(false);
  const [rows, setRows] = useState<OhProgramme[]>([]);
  const [jobProfiles, setJobProfiles] = useState<OhJobProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requirementsOpen, setRequirementsOpen] = useState(false);
  const [editingProgramme, setEditingProgramme] = useState<OhProgramme | null>(
    null,
  );
  const [matrixRows, setMatrixRows] = useState<OhRequirementsMatrixRow[]>([]);
  const [selectedCriticalCodes, setSelectedCriticalCodes] = useState<string[]>(
    [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isActive) {
      return;
    }
    let active = true;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const flags = await fetchOhFeatureFlags();
        const enabled = flags.some(
          (flag) => flag.key === FLAG_KEY && flag.enabled,
        );
        if (!active) {
          return;
        }
        setFlagEnabled(enabled);
        if (!enabled) {
          setRows([]);
          return;
        }
        const [results, profiles] = await Promise.all([
          fetchOhProgrammes(employer.id),
          fetchOhJobProfiles(employer.id),
        ]);
        if (active) {
          setRows(results);
          setJobProfiles(profiles);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load programmes.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [employer.id, isActive]);

  if (!isActive) {
    return null;
  }

  async function handleEnableFlag() {
    setFlagLoading(true);
    try {
      await enableOhConfigurableProgrammes();
      setFlagEnabled(true);
      const results = await fetchOhProgrammes(employer.id);
      setRows(results);
      toast({ variant: "success", title: "Configurable programmes enabled" });
    } catch (enableError) {
      toast({
        variant: "error",
        title: "Could not enable programmes",
        description:
          enableError instanceof BffError
            ? enableError.message
            : enableError instanceof Error
              ? enableError.message
              : undefined,
      });
    } finally {
      setFlagLoading(false);
    }
  }

  async function handleCreateProgramme(draft: OhAddProgrammeDraft) {
    setIsSubmitting(true);
    try {
      const created = await createOhProgramme({
        name: draft.name,
        code: draft.code.toUpperCase(),
        employer: employer.id,
      });
      const examType = draft.examType || "periodic";
      const matrix: OhRequirementsMatrixRow[] =
        draft.procedureCodes.length > 0
          ? [
              {
                exam_type: examType,
                job_profile_code: null,
                procedures: codesToProcedures(draft.procedureCodes),
              },
            ]
          : draft.examType
            ? [
                {
                  exam_type: examType,
                  job_profile_code: null,
                  procedures: [],
                },
              ]
            : [];
      const requirements: OhRequirementsConfig = {
        schema_version: 1,
        matrix,
        critical_activities: codesToProcedures(draft.criticalCodes),
      };
      const hasItems =
        requirements.matrix.length > 0 ||
        (requirements.critical_activities?.length ?? 0) > 0;
      const version = await createOhProgrammeVersion(
        created.uuid,
        hasItems ? { config_json: { requirements } } : {},
      );
      await publishOhProgrammeVersion(version.uuid);
      const refreshed = await fetchOhProgrammes(employer.id);
      setRows(refreshed);
      setDialogOpen(false);
      toast({ variant: "success", title: "Programme published" });
    } catch (submitError) {
      toast({
        variant: "error",
        title: "Could not create programme",
        description:
          submitError instanceof BffError
            ? submitError.message
            : submitError instanceof Error
              ? submitError.message
              : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function openRequirements(programme: OhProgramme) {
    setEditingProgramme(programme);
    setIsSubmitting(true);
    try {
      if (programme.published_version_uuid) {
        const version = await fetchOhProgrammeVersion(
          programme.published_version_uuid,
        );
        const requirements = requirementsFromConfig(version.config_json);
        setMatrixRows(requirements.matrix);
        setSelectedCriticalCodes(
          (requirements.critical_activities ?? []).map((item) => item.code),
        );
      } else {
        setMatrixRows([]);
        setSelectedCriticalCodes([]);
      }
      setRequirementsOpen(true);
    } catch (loadError) {
      toast({
        variant: "error",
        title: "Could not load requirements",
        description:
          loadError instanceof Error ? loadError.message : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateMatrixRow(
    index: number,
    patch: Partial<OhRequirementsMatrixRow>,
  ) {
    setMatrixRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
  }

  function addMatrixRow(general: boolean) {
    setMatrixRows((current) => [
      ...current,
      {
        exam_type: "periodic",
        job_profile_code: general
          ? null
          : (jobProfiles[0]?.code ?? "PROFILE"),
        procedures: [],
      },
    ]);
  }

  async function saveRequirements() {
    if (!editingProgramme) {
      return;
    }
    setIsSubmitting(true);
    try {
      let baseConfig: Record<string, unknown> = {
        schema_version: 1,
        kind: "programme",
      };
      if (editingProgramme.published_version_uuid) {
        const published = await fetchOhProgrammeVersion(
          editingProgramme.published_version_uuid,
        );
        if (published.config_json && typeof published.config_json === "object") {
          baseConfig = { ...published.config_json };
        }
      }
      const requirements: OhRequirementsConfig = {
        schema_version: 1,
        matrix: matrixRows,
        critical_activities: codesToProcedures(selectedCriticalCodes),
      };
      const version = await createOhProgrammeVersion(editingProgramme.uuid, {
        config_json: { ...baseConfig, requirements },
      });
      await publishOhProgrammeVersion(version.uuid);
      const refreshed = await fetchOhProgrammes(employer.id);
      setRows(refreshed);
      setRequirementsOpen(false);
      setEditingProgramme(null);
      toast({ variant: "success", title: "Requirements published" });
    } catch (saveError) {
      toast({
        variant: "error",
        title: "Could not publish requirements",
        description:
          saveError instanceof BffError
            ? saveError.message
            : saveError instanceof Error
              ? saveError.message
              : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!flagEnabled) {
    return (
      <div className="space-y-4 rounded-xl border border-dashed border-dash-border/80 px-4 py-8 text-center">
        <div>
          <h3 className="text-sm font-semibold text-brand-navy">
            Configurable programmes
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Enable programmes to publish a general exam form and select catalog
            items required on exams for {employer.name}.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => void handleEnableFlag()}
          disabled={flagLoading || isLoading}
        >
          {flagLoading ? "Enabling…" : "Enable configurable programmes"}
        </Button>
        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <OhCatalogListPanel
        title="Programmes"
        description={`Select catalog examinations, procedures, and critical activities required on exams for ${employer.name}.`}
        addLabel="Add programme"
        onAdd={() => setDialogOpen(true)}
        isLoading={isLoading}
        error={error}
        emptyTitle="No programmes yet"
        emptyDescription="Create a programme, then select catalog items required on its exams."
        isEmpty={rows.length === 0}
        embedded={embedded}
      >
        <ul className="divide-y divide-brand-border">
          {rows.map((row) => (
            <li
              key={row.uuid}
              className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-brand-navy">
                  {row.name}
                </p>
                <p className="mt-0.5 truncate text-sm text-slate-400">
                  {row.code}
                  {row.published_version_number != null
                    ? ` · v${row.published_version_number}`
                    : " · no published version"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-slate-400">
                  {row.published_version_number != null ? "Published" : "Draft"}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-brand-muted hover:text-brand-navy"
                  onClick={() => void openRequirements(row)}
                >
                  Edit requirements
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </OhCatalogListPanel>

      <OhAddProgrammeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        isSubmitting={isSubmitting}
        onSubmit={handleCreateProgramme}
      />

      <Dialog
        open={requirementsOpen}
        onOpenChange={(open) => {
          setRequirementsOpen(open);
          if (!open) {
            setEditingProgramme(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Requirements
              {editingProgramme ? ` — ${editingProgramme.name}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <p className="text-sm text-brand-muted">
              Select catalog items this programme needs on its exams. Selected
              procedures and critical activities appear on the clinic checklist.
            </p>

            <div className="space-y-2">
              <Label>Eligible critical activities</Label>
              <OhCatalogItemPicker
                itemType="critical_activity"
                selectedCodes={selectedCriticalCodes}
                onChange={setSelectedCriticalCodes}
                searchPlaceholder="Search critical activities…"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addMatrixRow(true)}
              >
                Add general row
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addMatrixRow(false)}
                disabled={jobProfiles.length === 0}
              >
                Add profile row
              </Button>
            </div>

            {matrixRows.length === 0 ? (
              <p className="text-sm text-slate-400">
                No procedure matrix rows yet. Add a general row and select
                examination + procedures from the catalog.
              </p>
            ) : (
              <div className="max-h-96 space-y-3 overflow-y-auto">
                {matrixRows.map((row, index) => (
                  <div
                    key={`${row.exam_type}-${row.job_profile_code ?? "general"}-${index}`}
                    className="space-y-3 rounded-xl border border-dash-border p-3"
                  >
                    <div className="space-y-2">
                      <Label>Examination</Label>
                      <OhCatalogItemPicker
                        itemType="exam_type"
                        selectedCodes={row.exam_type ? [row.exam_type] : []}
                        onChange={(codes) =>
                          updateMatrixRow(index, {
                            exam_type: codes[0] ?? row.exam_type,
                          })
                        }
                        multi={false}
                        searchPlaceholder="Search examinations…"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Job profile code</Label>
                      <Input
                        value={row.job_profile_code ?? ""}
                        placeholder="Empty = general (no job profile)"
                        onChange={(event) =>
                          updateMatrixRow(index, {
                            job_profile_code: event.target.value.trim()
                              ? event.target.value.trim().toUpperCase()
                              : null,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Medical procedures required</Label>
                      <OhCatalogItemPicker
                        itemType="procedure"
                        selectedCodes={row.procedures.map((item) => item.code)}
                        onChange={(codes) =>
                          updateMatrixRow(index, {
                            procedures: codesToProcedures(codes),
                          })
                        }
                        searchPlaceholder="Search procedures…"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-brand-muted"
                      onClick={() =>
                        setMatrixRows((current) =>
                          current.filter((_, rowIndex) => rowIndex !== index),
                        )
                      }
                    >
                      Remove row
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRequirementsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSubmitting || !editingProgramme}
              onClick={() => void saveRequirements()}
            >
              {isSubmitting ? "Publishing…" : "Publish new version"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
