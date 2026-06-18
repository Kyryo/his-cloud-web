"use client";

import { Download, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

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
import { updateTherapyVisitAssessment } from "@/features/therapy/services/therapy.service";
import type {
  TherapyAssessment,
  TherapyDiscipline,
} from "@/features/therapy/types/therapy.types";
import { downloadAssessmentReport } from "@/features/therapy/utils/assessment-report";
import { useToast } from "@/providers/toast-provider";

export function AssessmentSessionTab({
  assessment,
  discipline,
  visitUuid,
  onAssessmentChanged,
  isReadOnly,
}: {
  assessment: TherapyAssessment;
  discipline: TherapyDiscipline;
  visitUuid: string;
  onAssessmentChanged: (assessment: TherapyAssessment) => void;
  isReadOnly: boolean;
}) {
  const { toast } = useToast();
  const [notes, setNotes] = useState(assessment.assessment_notes);
  const [isSaving, setIsSaving] = useState(false);
  const [tenantLogoUrl, setTenantLogoUrl] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportTitleDialogOpen, setReportTitleDialogOpen] = useState(false);

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

  async function saveAssessmentNotes() {
    setIsSaving(true);
    try {
      const updatedAssessment = await updateTherapyVisitAssessment(
        discipline,
        visitUuid,
        notes,
      );
      onAssessmentChanged(updatedAssessment);
      toast({
        variant: "success",
        title: "Assessment notes saved",
        description: "The assessment session has been updated.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not save assessment notes",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDownloadReport() {
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
        notesHtml: notes,
        reportTitle: trimmedReportTitle,
        tenantLogoUrl,
      });
      setReportTitleDialogOpen(false);
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

  return (
    <form
      className="pb-28"
      onSubmit={(event) => {
        event.preventDefault();
        void saveAssessmentNotes();
      }}
    >
      <header className="mb-7 flex flex-wrap items-start justify-between gap-4 border-b border-brand-border pb-5">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-brand-navy">
            Assessment session
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            Record and update the initial assessment notes for this visit.
          </p>
        </div>
        <div className="ml-auto flex w-full justify-end sm:w-auto">
          <Button
            type="button"
            variant="ghost"
            className="shrink-0 text-brand-navy"
            disabled={isDownloading}
            onClick={() => setReportTitleDialogOpen(true)}
          >
            {isDownloading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="size-4" aria-hidden="true" />
            )}
            Download PDF
          </Button>
        </div>
      </header>

      <Dialog
        open={reportTitleDialogOpen}
        onOpenChange={(open) => {
          if (!isDownloading) {
            setReportTitleDialogOpen(open);
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
              onClick={() => setReportTitleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isDownloading || !reportTitle.trim()}
              onClick={() => void handleDownloadReport()}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Downloading...
                </>
              ) : (
                "Download"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TherapyRichTextEditor
        value={notes}
        onChange={setNotes}
        placeholder="Document the assessment findings, clinical interpretation, and recommendations..."
        disabled={isSaving || isReadOnly}
      />

      {!isReadOnly ? (
        <TherapyFormActionBar
          isSubmitting={isSaving}
          message="Assessment notes ready to update"
          saveLabel="Save assessment"
          onCancel={() => setNotes(assessment.assessment_notes)}
        />
      ) : null}
    </form>
  );
}
