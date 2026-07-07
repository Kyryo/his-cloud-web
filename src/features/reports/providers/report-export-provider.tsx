"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { buildReportFiltersPayload } from "@/features/reports/components/ReportFilterForm";
import { getReportCatalogItem } from "@/features/reports/constants/report-catalog";
import { useReportJobPoll } from "@/features/reports/hooks/use-report-job-poll";
import {
  createReportJob,
  reportDownloadUrl,
} from "@/features/reports/services/reports.service";
import type { ReportJob } from "@/features/reports/types/report-job.types";
import { defaultReportFilterValues } from "@/features/reports/utils/report-filter-defaults";

export type ReportExportPhase = "filters" | "exporting" | "success" | "error";

export type ReportExportSession = {
  reportId: string;
  reportTitle: string;
  filterValues: Record<string, string>;
  job: ReportJob | null;
  phase: ReportExportPhase;
  errorMessage: string | null;
  asideOpen: boolean;
};

type ReportExportContextValue = {
  session: ReportExportSession | null;
  isSubmitting: boolean;
  isExportActive: boolean;
  showPill: boolean;
  jobsVersion: number;
  openReport: (reportId: string) => void;
  closeAside: () => void;
  minimizeExport: () => void;
  expandFromPill: () => void;
  dismissSession: () => void;
  setFilterValue: (name: string, value: string) => void;
  startExport: () => Promise<void>;
  retryExport: () => Promise<void>;
  downloadExport: () => void;
  handleAsideOpenChange: (open: boolean) => void;
  handlePillClick: () => void;
};

const ReportExportContext = createContext<ReportExportContextValue | undefined>(
  undefined,
);

function isJobActive(job: ReportJob | null): boolean {
  return job?.status === "queued" || job?.status === "running";
}

function isTerminalPhase(phase: ReportExportPhase): boolean {
  return phase === "success" || phase === "error";
}

function shouldShowPill(session: ReportExportSession | null): boolean {
  if (!session || session.asideOpen) {
    return false;
  }
  return session.phase === "exporting" || isTerminalPhase(session.phase);
}

function terminalPhaseForJob(job: ReportJob): ReportExportPhase {
  if (job.status === "completed") {
    return "success";
  }
  return "error";
}

function terminalErrorMessage(job: ReportJob): string {
  if (job.failure_message) {
    return job.failure_message;
  }
  return "The export could not be completed. Please try again.";
}

export function ReportExportProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ReportExportSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobsVersion, setJobsVersion] = useState(0);

  const handleJobUpdate = useCallback((job: ReportJob) => {
    setSession((current) => (current ? { ...current, job } : current));
  }, []);

  const handleJobTerminal = useCallback((job: ReportJob) => {
    setJobsVersion((version) => version + 1);
    setSession((current) => {
      if (!current) {
        return current;
      }

      if (job.status === "completed") {
        return { ...current, job, phase: "success", errorMessage: null };
      }

      if (
        job.status === "failed" ||
        job.status === "cancelled" ||
        job.status === "expired"
      ) {
        return {
          ...current,
          job,
          phase: "error",
          errorMessage: terminalErrorMessage(job),
        };
      }

      return { ...current, job };
    });
  }, []);

  const pollJobUuid =
    session && isJobActive(session.job) ? session.job?.uuid ?? null : null;

  useReportJobPoll(pollJobUuid, {
    onUpdate: handleJobUpdate,
    onTerminal: handleJobTerminal,
  });

  const runExport = useCallback(
    async (reportId: string, filterValues: Record<string, string>) => {
      const item = getReportCatalogItem(reportId);
      if (!item) {
        return;
      }

      setIsSubmitting(true);
      setSession((current) =>
        current
          ? {
              ...current,
              phase: "exporting",
              errorMessage: null,
              asideOpen: true,
              job: null,
            }
          : current,
      );

      try {
        const job = await createReportJob({
          report_type: item.reportType,
          file_format: "csv",
          filters: buildReportFiltersPayload(filterValues),
        });

        setSession((current) => {
          if (!current) {
            return current;
          }

          if (isJobActive(job)) {
            return { ...current, job, phase: "exporting" };
          }

          return {
            ...current,
            job,
            phase: terminalPhaseForJob(job),
            errorMessage:
              job.status === "completed" ? null : terminalErrorMessage(job),
          };
        });

        if (!isJobActive(job)) {
          setJobsVersion((version) => version + 1);
        }
      } catch (error) {
        setSession((current) =>
          current
            ? {
                ...current,
                phase: "error",
                errorMessage:
                  error instanceof Error
                    ? error.message
                    : "Failed to queue report export.",
              }
            : current,
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const openReport = useCallback((reportId: string) => {
    setSession((current) => {
      if (current && isJobActive(current.job)) {
        return { ...current, asideOpen: true };
      }

      const item = getReportCatalogItem(reportId);
      if (!item) {
        return current;
      }

      return {
        reportId,
        reportTitle: item.title,
        filterValues: defaultReportFilterValues(reportId),
        job: null,
        phase: "filters",
        errorMessage: null,
        asideOpen: true,
      };
    });
  }, []);

  const dismissSession = useCallback(() => {
    setSession(null);
    setIsSubmitting(false);
  }, []);

  const minimizeExport = useCallback(() => {
    setSession((current) =>
      current ? { ...current, asideOpen: false } : current,
    );
  }, []);

  const expandFromPill = useCallback(() => {
    setSession((current) =>
      current ? { ...current, asideOpen: true } : current,
    );
  }, []);

  const handleAsideOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        expandFromPill();
        return;
      }

      setSession((current) => {
        if (!current) {
          return current;
        }

        if (current.phase === "exporting" && isJobActive(current.job)) {
          return { ...current, asideOpen: false };
        }

        return null;
      });
    },
    [expandFromPill],
  );

  const setFilterValue = useCallback((name: string, value: string) => {
    setSession((current) =>
      current
        ? {
            ...current,
            filterValues: { ...current.filterValues, [name]: value },
          }
        : current,
    );
  }, []);

  const startExport = useCallback(async () => {
    if (!session) {
      return;
    }
    await runExport(session.reportId, session.filterValues);
  }, [runExport, session]);

  const retryExport = useCallback(async () => {
    if (!session) {
      return;
    }
    await runExport(session.reportId, session.filterValues);
  }, [runExport, session]);

  const downloadExport = useCallback(() => {
    if (!session?.job?.downloadable) {
      return;
    }

    window.location.assign(reportDownloadUrl(session.job.uuid));
  }, [session]);

  const handlePillClick = useCallback(() => {
    if (!session) {
      return;
    }

    if (session.phase === "success" && session.job?.downloadable) {
      downloadExport();
      return;
    }

    expandFromPill();
  }, [downloadExport, expandFromPill, session]);

  const value = useMemo(
    () => ({
      session,
      isSubmitting,
      isExportActive: Boolean(session && isJobActive(session.job)),
      showPill: shouldShowPill(session),
      jobsVersion,
      openReport,
      closeAside: handleAsideOpenChange.bind(null, false),
      minimizeExport,
      expandFromPill,
      dismissSession,
      setFilterValue,
      startExport,
      retryExport,
      downloadExport,
      handleAsideOpenChange,
      handlePillClick,
    }),
    [
      dismissSession,
      downloadExport,
      expandFromPill,
      handleAsideOpenChange,
      handlePillClick,
      isSubmitting,
      jobsVersion,
      minimizeExport,
      openReport,
      retryExport,
      session,
      setFilterValue,
      startExport,
    ],
  );

  return (
    <ReportExportContext.Provider value={value}>
      {children}
    </ReportExportContext.Provider>
  );
}

export function useReportExport(): ReportExportContextValue {
  const context = useContext(ReportExportContext);
  if (!context) {
    throw new Error("useReportExport must be used within ReportExportProvider");
  }
  return context;
}
