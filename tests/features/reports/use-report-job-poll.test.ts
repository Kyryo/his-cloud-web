import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useReportJobPoll } from "@/features/reports/hooks/use-report-job-poll";
import { fetchReportJob } from "@/features/reports/services/reports.service";

vi.mock("@/features/reports/services/reports.service", () => ({
  fetchReportJob: vi.fn(),
}));

describe("useReportJobPoll", () => {
  it("calls onTerminal when the job is already completed", async () => {
    vi.mocked(fetchReportJob).mockResolvedValueOnce({
      uuid: "job-1",
      status: "completed",
      downloadable: true,
    } as Awaited<ReturnType<typeof fetchReportJob>>);

    const onTerminal = vi.fn();
    renderHook(() =>
      useReportJobPoll("job-1", {
        onTerminal,
      }),
    );

    await waitFor(() => {
      expect(onTerminal).toHaveBeenCalled();
    });
  });
});
