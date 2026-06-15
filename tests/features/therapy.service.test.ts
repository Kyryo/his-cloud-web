import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  assignTherapyVisitTreatmentPlan,
  createTherapyVisitAssessment,
  createTherapyVisitSession,
  fetchTherapyFutureAppointments,
  fetchTherapyDepartments,
  fetchTherapyVisitDetails,
  fetchTherapyVisitAssessment,
  fetchTherapyVisitSessions,
  fetchTherapyVisits,
  recordTherapyGoalProgress,
  updateTherapyVisitAssessment,
} from "@/features/therapy/services/therapy.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

describe("therapy service", () => {
  beforeEach(() => {
    vi.mocked(bffRequest).mockReset();
  });

  it("requests accessible departments by therapy discipline", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({ results: [] });

    await fetchTherapyDepartments("physio", 12);

    expect(bffRequest).toHaveBeenCalledWith(
      "/api/therapy?discipline=physio&active_clinic_id=12",
    );
  });

  it("filters visits with the public department UUID", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      results: [],
      pagination: null,
    });

    await fetchTherapyVisits({
      discipline: "speech",
      activeClinicId: 12,
      departmentUuid: "9ca46f31-af4e-4e79-90ac-cf7d62ca76f8",
      page: 2,
      pageSize: 20,
      search: "Banda",
      status: "active",
    });

    const requestPath = vi.mocked(bffRequest).mock.calls[0]?.[0];
    const url = new URL(String(requestPath), "http://localhost");

    expect(url.pathname).toBe("/api/therapy/visits");
    expect(url.searchParams.get("discipline")).toBe("speech");
    expect(url.searchParams.get("active_clinic_id")).toBe("12");
    expect(url.searchParams.get("department_uuid")).toBe(
      "9ca46f31-af4e-4e79-90ac-cf7d62ca76f8",
    );
    expect(url.searchParams.get("department_id")).toBeNull();
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("page_size")).toBe("20");
    expect(url.searchParams.get("search")).toBe("Banda");
    expect(url.searchParams.get("status")).toBe("active");
  });

  it("omits the status filter for the all queue", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      results: [],
      pagination: null,
    });

    await fetchTherapyVisits({
      discipline: "physio",
      activeClinicId: 12,
      departmentUuid: "9ca46f31-af4e-4e79-90ac-cf7d62ca76f8",
      page: 1,
      pageSize: 20,
      status: "all",
    });

    const requestPath = vi.mocked(bffRequest).mock.calls[0]?.[0];
    const url = new URL(String(requestPath), "http://localhost");

    expect(url.searchParams.get("status")).toBeNull();
  });

  it("requests visit details through the discipline route", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({});

    await fetchTherapyVisitDetails(
      "occupational",
      "9ca46f31-af4e-4e79-90ac-cf7d62ca76f8",
    );

    expect(bffRequest).toHaveBeenCalledWith(
      "/api/therapy/occupational/visits/9ca46f31-af4e-4e79-90ac-cf7d62ca76f8",
    );
  });

  it("requests sessions for the visit treatment plan", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({ results: [] });

    await fetchTherapyVisitSessions(
      "physio",
      "9ca46f31-af4e-4e79-90ac-cf7d62ca76f8",
    );

    expect(bffRequest).toHaveBeenCalledWith(
      "/api/therapy/physio/visits/9ca46f31-af4e-4e79-90ac-cf7d62ca76f8/sessions",
    );
  });

  it("retrieves, creates, and updates the visit assessment", async () => {
    const visitUuid = "9ca46f31-af4e-4e79-90ac-cf7d62ca76f8";
    const route = `/api/therapy/physio/visits/${visitUuid}/assessment`;
    vi.mocked(bffRequest)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});

    await fetchTherapyVisitAssessment("physio", visitUuid);
    await createTherapyVisitAssessment("physio", visitUuid);
    await updateTherapyVisitAssessment(
      "physio",
      visitUuid,
      "<p>Assessment notes</p>",
    );

    expect(bffRequest).toHaveBeenNthCalledWith(1, route);
    expect(bffRequest).toHaveBeenNthCalledWith(2, route, {
      method: "POST",
      body: {},
    });
    expect(bffRequest).toHaveBeenNthCalledWith(3, route, {
      method: "PUT",
      body: { assessment_notes: "<p>Assessment notes</p>" },
    });
  });

  it("records a rich-text therapy session for the visit", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({});
    const payload = {
      date: "2026-06-14",
      duration_minutes: 45,
      subjective_complaint: "<p>Less pain today</p>",
      objective_findings: "<ul><li>Improved gait</li></ul>",
      patient_response: "good" as const,
      assessment_notes: "<p>Progressing well</p>",
      plan_for_next_session: "<p>Increase distance</p>",
      is_final_session: false,
    };

    await createTherapyVisitSession(
      "physio",
      "9ca46f31-af4e-4e79-90ac-cf7d62ca76f8",
      payload,
    );

    expect(bffRequest).toHaveBeenCalledWith(
      "/api/therapy/physio/visits/9ca46f31-af4e-4e79-90ac-cf7d62ca76f8/sessions",
      { method: "POST", body: payload },
    );
  });

  it("links a treatment plan to the visit appointment", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({});

    await assignTherapyVisitTreatmentPlan(
      "physio",
      "9ca46f31-af4e-4e79-90ac-cf7d62ca76f8",
      { treatment_plan_uuid: "3bd6e44a-4724-4dd1-8df0-3528dc92c550" },
    );

    expect(bffRequest).toHaveBeenCalledWith(
      "/api/therapy/physio/visits/9ca46f31-af4e-4e79-90ac-cf7d62ca76f8/treatment-goals",
      {
        method: "PUT",
        body: {
          treatment_plan_uuid: "3bd6e44a-4724-4dd1-8df0-3528dc92c550",
        },
      },
    );
  });

  it("records progress against a visit treatment goal", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({});

    await recordTherapyGoalProgress(
      "speech",
      "9ca46f31-af4e-4e79-90ac-cf7d62ca76f8",
      "3bd6e44a-4724-4dd1-8df0-3528dc92c550",
      { measured_value: "2.5", notes: "Improved articulation" },
    );

    expect(bffRequest).toHaveBeenCalledWith(
      "/api/therapy/speech/visits/9ca46f31-af4e-4e79-90ac-cf7d62ca76f8/treatment-goals/3bd6e44a-4724-4dd1-8df0-3528dc92c550/progress",
      {
        method: "POST",
        body: {
          measured_value: "2.5",
          notes: "Improved articulation",
        },
      },
    );
  });

  it("requests future appointments for the visit client", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({ results: [] });

    await fetchTherapyFutureAppointments(
      "occupational",
      "9ca46f31-af4e-4e79-90ac-cf7d62ca76f8",
    );

    expect(bffRequest).toHaveBeenCalledWith(
      "/api/therapy/occupational/visits/9ca46f31-af4e-4e79-90ac-cf7d62ca76f8/future-appointments",
    );
  });
});
