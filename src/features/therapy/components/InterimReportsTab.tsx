"use client";

import { Download, FilePlus2 } from "lucide-react";
import { useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { SpinnerGlyph } from "@/components/loading-spinner";
import { AddActionButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { fetchOrganizationBranding } from "@/features/settings/services/settings.service";
import { TherapyFormActionBar } from "@/features/therapy/components/TherapyFormActionBar";
import { TherapyRichTextEditor } from "@/features/therapy/components/TherapyRichTextEditor";
import {
  createTherapyVisitInterimReport,
  fetchTherapyVisitInterimReports,
  updateTherapyVisitInterimReport,
} from "@/features/therapy/services/therapy.service";
import type {
  TherapyDiscipline,
  TherapyInterimReport,
} from "@/features/therapy/types/therapy.types";
import { downloadAssessmentReport } from "@/features/therapy/utils/assessment-report";
import { useToast } from "@/providers/toast-provider";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-MW", {
  dateStyle: "medium",
  timeStyle: "short",
});

type EditorMode =
  | { kind: "idle" }
  | { kind: "create" }
  | { kind: "edit"; report: TherapyInterimReport };

export function InterimReportsTab({
  discipline,
  visitUuid,
  isReadOnly,
}: {
  discipline: TherapyDiscipline;
  visitUuid: string;
  isReadOnly: boolean;
}) {
  const { toast } = useToast();
  const [reports, setReports] = useState<TherapyInterimReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>({ kind: "idle" });
  const [draftHtml, setDraftHtml] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [tenantLogoUrl, setTenantLogoUrl] = useState("");
  const [downloadTarget, setDownloadTarget] =
    useState<TherapyInterimReport | null>(null);
  const [reportTitle, setReportTitle] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await fetchTherapyVisitInterimReports(
          discipline,
          visitUuid,
        );
        if (!cancelled) {
          setReports(data);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Could not load interim reports.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadReports();
    return () => {
      cancelled = true;
    };
  }, [discipline, visitUuid]);

  useEffect(() => {
    let active = true;

    async function loadBrandingLogo() {
      try {
        const branding = await fetchOrganizationBranding();
        if (active) {
          setTenantLogoUrl(branding.branding_logo_url ?? "");
        }
      } catch {
        if (active) {
          setTenantLogoUrl("");
        }
      }
    }

    void loadBrandingLogo();
    return () => {
      active = false;
    };
  }, []);

  function startCreate() {
    setEditorMode({ kind: "create" });
    setDraftHtml("");
  }

  function startEdit(report: TherapyInterimReport) {
    setEditorMode({ kind: "edit", report });
    setDraftHtml(report.report);
  }

  function cancelEditor() {
    setEditorMode({ kind: "idle" });
    setDraftHtml("");
  }

  async function saveReport() {
    setIsSaving(true);
    try {
      if (editorMode.kind === "create") {
        const created = await createTherapyVisitInterimReport(
          discipline,
          visitUuid,
          draftHtml,
        );
        setReports((current) => [created, ...current]);
        toast({
          variant: "success",
          title: "Interim report added",
          description: "The report has been saved for this visit.",
        });
      } else if (editorMode.kind === "edit") {
        const updated = await updateTherapyVisitInterimReport(
          discipline,
          visitUuid,
          editorMode.report.uuid,
          draftHtml,
        );
        setReports((current) =>
          current.map((item) =>
            item.uuid === updated.uuid ? updated : item,
          ),
        );
        toast({
          variant: "success",
          title: "Interim report updated",
          description: "Your changes have been saved.",
        });
      }
      cancelEditor();
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not save interim report",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDownloadReport() {
    if (!downloadTarget) {
      return;
    }

    const trimmedReportTitle = reportTitle.trim();
    if (!trimmedReportTitle) {
      toast({
        variant: "error",
        title: "Report title required",
        description: "Enter a report title before downloading the PDF.",
      });
      return;
    }

    setIsDownloading(true);
    try {
      await downloadAssessmentReport({
        notesHtml: downloadTarget.report,
        reportTitle: trimmedReportTitle,
        tenantLogoUrl,
      });
      setDownloadTarget(null);
      setReportTitle("");
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not download report",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsDownloading(false);
    }
  }

  if (isLoading) {
    return <PageLoader message="Loading interim reports..." />;
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
          <h2 className="text-base font-semibold text-brand-navy">
            Interim report
          </h2>
          <p className="mt-1 text-xs text-brand-muted">
            View and update interim clinical reports for this visit.
          </p>
        </div>
        <AddActionButton
          label="Add interim report"
          size="sm"
          disabled={isReadOnly || editorMode.kind !== "idle"}
          onClick={startCreate}
        />
      </div>

      {editorMode.kind === "create" ? (
        <form
          className="rounded-xl border border-brand-border bg-white p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void saveReport();
          }}
        >
          <p className="mb-3 text-sm font-medium text-brand-navy">
            New interim report
          </p>
          <TherapyRichTextEditor
            value={draftHtml}
            onChange={setDraftHtml}
            placeholder="Write the interim report..."
            disabled={isSaving}
          />
          <TherapyFormActionBar
            isSubmitting={isSaving}
            message="Unsaved interim report"
            saveLabel="Save report"
            onCancel={cancelEditor}
          />
        </form>
      ) : null}

      {reports.length === 0 && editorMode.kind === "idle" ? (
        <div className="rounded-xl border border-dashed border-brand-border px-4 py-12 text-center">
          <FilePlus2 className="mx-auto size-6 text-brand-muted" />
          <p className="mt-2 text-sm font-medium text-brand-navy">
            No interim reports yet
          </p>
          <p className="mt-1 text-xs text-brand-muted">
            Add the first interim report for this visit.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const isEditing =
              editorMode.kind === "edit" &&
              editorMode.report.uuid === report.uuid;

            return (
              <article
                key={report.uuid}
                className="rounded-xl border border-brand-border bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brand-navy">
                      {DATE_FORMATTER.format(new Date(report.created_at))}
                    </p>
                    <p className="mt-0.5 text-xs text-brand-muted">
                      {report.created_by_name?.trim() || "Unknown author"}
                    </p>
                  </div>
                  {!isEditing && editorMode.kind === "idle" ? (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-brand-navy"
                        disabled={isDownloading}
                        onClick={() => {
                          setDownloadTarget(report);
                          setReportTitle("");
                        }}
                      >
                        {isDownloading &&
                        downloadTarget?.uuid === report.uuid ? (
                          <SpinnerGlyph size="xs" />
                        ) : (
                          <Download className="size-3.5" aria-hidden="true" />
                        )}
                        Download
                      </Button>
                      {!isReadOnly ? (
                        <SecondaryButton
                          type="button"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => startEdit(report)}
                        >
                          Edit
                        </SecondaryButton>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {isEditing ? (
                  <form
                    className="mt-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void saveReport();
                    }}
                  >
                    <TherapyRichTextEditor
                      value={draftHtml}
                      onChange={setDraftHtml}
                      placeholder="Update the interim report..."
                      disabled={isSaving}
                    />
                    <TherapyFormActionBar
                      isSubmitting={isSaving}
                      message="Unsaved interim report changes"
                      saveLabel="Save changes"
                      onCancel={cancelEditor}
                    />
                  </form>
                ) : (
                  <div
                    className="prose prose-sm mt-3 max-w-none text-brand-slate"
                    dangerouslySetInnerHTML={{
                      __html: report.report || "<p>No content</p>",
                    }}
                  />
                )}
              </article>
            );
          })}
        </div>
      )}

      <Dialog
        open={Boolean(downloadTarget)}
        onOpenChange={(open) => {
          if (!isDownloading && !open) {
            setDownloadTarget(null);
            setReportTitle("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report title</DialogTitle>
            <DialogDescription>
              This title will appear below the organization logo in the PDF.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm font-medium text-brand-navy">Title</p>
            <Input
              value={reportTitle}
              onChange={(event) => setReportTitle(event.target.value)}
              placeholder="Enter report title"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={isDownloading}
              onClick={() => {
                setDownloadTarget(null);
                setReportTitle("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isDownloading || !reportTitle.trim()}
              onClick={() => void handleDownloadReport()}
            >
              {isDownloading ? <SpinnerGlyph size="xs" /> : null}
              {isDownloading ? "Downloading..." : "Download PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
