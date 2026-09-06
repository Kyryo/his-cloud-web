import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ReportsExportHistoryPage } from "@/features/reports/pages/ReportsExportHistoryPage";
import { ReportExportShell } from "@/features/reports/components/ReportExportShell";
import {
  cancelReportJob,
  fetchReportJobs,
} from "@/features/reports/services/reports.service";
import type { ReportJob } from "@/features/reports/types/report-job.types";

vi.mock("@/features/reports/services/reports.service", () => ({
  fetchReportJobs: vi.fn(),
  cancelReportJob: vi.fn(),
  reportDownloadUrl: (uuid: string) => `/api/reports/${uuid}/download`,
  createReportJob: vi.fn(),
  fetchReportJob: vi.fn(),
}));

function buildJob(overrides: Partial<ReportJob> = {}): ReportJob {
  return {
    uuid: "job-1",
    report_type: "appointments",
    file_format: "csv",
    filters: {},
    status: "completed",
    output_filename: "appointments.csv",
    content_type: "text/csv",
    checksum_sha256: "",
    row_count: 42,
    file_size: 2048,
    failure_code: "",
    failure_message: "",
    requested_by_email: "ada@clinic.test",
    started_at: null,
    completed_at: "2026-09-06T10:15:00.000Z",
    expires_at: null,
    created_at: "2026-09-06T10:15:00.000Z",
    updated_at: "2026-09-06T10:15:00.000Z",
    downloadable: true,
    ...overrides,
  };
}

function renderHistory() {
  return render(
    <ReportExportShell>
      <ReportsExportHistoryPage />
    </ReportExportShell>,
  );
}

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.mocked(fetchReportJobs).mockReset();
  vi.mocked(cancelReportJob).mockReset();
});

describe("ReportsExportHistoryPage", () => {
  it("renders finished exports with a download link", async () => {
    vi.mocked(fetchReportJobs).mockResolvedValue({
      results: [buildJob()],
      pagination: { count: 1, next: null, previous: null },
    });

    renderHistory();

    expect(await screen.findByText("Appointments")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("42 rows")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download" })).toHaveAttribute(
      "href",
      "/api/reports/job-1/download",
    );
    expect(screen.getByRole("link", { name: "New export" })).toHaveAttribute(
      "href",
      "/reports",
    );
  });

  it("shows an empty state when there are no exports", async () => {
    vi.mocked(fetchReportJobs).mockResolvedValue({
      results: [],
      pagination: { count: 0, next: null, previous: null },
    });

    renderHistory();

    expect(await screen.findByTestId("reports-history-empty")).toBeInTheDocument();
    expect(screen.getByText("No exports yet")).toBeInTheDocument();
  });

  it("requests only completed jobs when Ready is selected", async () => {
    vi.mocked(fetchReportJobs).mockResolvedValue({
      results: [],
      pagination: { count: 0, next: null, previous: null },
    });

    renderHistory();
    await screen.findByTestId("reports-history-empty");

    fireEvent.click(screen.getByRole("button", { name: "Ready" }));

    await waitFor(() => {
      expect(fetchReportJobs).toHaveBeenLastCalledWith({
        page: 1,
        reportType: undefined,
        status: "completed",
      });
    });
  });

  it("cancels a generating export and reloads the list", async () => {
    vi.mocked(fetchReportJobs)
      .mockResolvedValueOnce({
        results: [
          buildJob({
            uuid: "job-2",
            status: "running",
            downloadable: false,
            row_count: 0,
          }),
        ],
        pagination: { count: 1, next: null, previous: null },
      })
      .mockResolvedValueOnce({
        results: [],
        pagination: { count: 0, next: null, previous: null },
      });
    vi.mocked(cancelReportJob).mockResolvedValue(
      buildJob({ uuid: "job-2", status: "cancelled", downloadable: false }),
    );

    renderHistory();

    fireEvent.click(await screen.findByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(cancelReportJob).toHaveBeenCalledWith("job-2");
    });
    expect(await screen.findByTestId("reports-history-empty")).toBeInTheDocument();
  });
});
