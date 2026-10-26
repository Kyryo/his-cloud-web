import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OhEncounterWorkspacePage } from "@/features/occupational-health/pages/OhEncounterWorkspacePage";

const ohService = vi.hoisted(() => ({
  fetchOhEncounters: vi.fn(),
  fetchOhExaminations: vi.fn(),
  fetchOhExamFindings: vi.fn(),
  fetchFitnessAssessments: vi.fn(),
  fetchFitnessCertificates: vi.fn(),
  fetchIodCases: vi.fn(),
  fetchEmploymentEpisodes: vi.fn(),
  fetchOhEmployers: vi.fn(),
  fetchOhJobTitles: vi.fn(),
  createOhExamination: vi.fn(),
  createFitnessAssessment: vi.fn(),
  createFitnessCertificate: vi.fn(),
  withdrawFitnessCertificate: vi.fn(),
  createOhExamFinding: vi.fn(),
  createIodCase: vi.fn(),
  downloadIodStatutoryPack: vi.fn(),
}));

const fetchVisitMock = vi.hoisted(() => vi.fn());
const fetchCustomerMock = vi.hoisted(() => vi.fn());
const useUserMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/occupational-health/services/oh.service", () => ohService);
vi.mock("@/features/visits/services/visits.service", () => ({
  fetchVisit: fetchVisitMock,
}));
vi.mock("@/features/customers/services/customers.service", () => ({
  fetchCustomer: fetchCustomerMock,
}));
vi.mock("@/providers/user-provider", () => ({
  useUser: () => useUserMock(),
}));
vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));
vi.mock("@/features/app-shell/hooks/use-app-breadcrumb", () => ({
  useAppBreadcrumb: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

const ENCOUNTER = {
  id: 7,
  uuid: "enc-1",
  visit: "visit-1",
  department: "dept-1",
  department_name: "Occupational Health",
  department_type: "occupational_health",
  location: null,
  location_name: "Mine clinic",
  clinician: 3,
  clinician_name: "Dr OH",
  status: "in_progress",
  billing_mode: "shared_visit",
  started_at: "2026-10-26T08:00:00Z",
  ended_at: null,
  notes: "",
  is_active: true,
  created_by: null,
  created_at: "2026-10-26T08:00:00Z",
  updated_at: "2026-10-26T08:00:00Z",
};

const EXAM = {
  id: 11,
  uuid: "exam-1",
  encounter: 7,
  employment_episode: null,
  exam_type: "periodic",
  occupational_attendance: true,
  template_code: "",
  notes: "Annual medical",
  examined_at: "2026-10-26T08:10:00Z",
  created_at: "2026-10-26T08:10:00Z",
  updated_at: "2026-10-26T08:10:00Z",
};

async function findTab(name: RegExp) {
  const tabs = await screen.findByTestId("oh-encounter-tabs");
  return within(tabs).getByRole("button", { name });
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <OhEncounterWorkspacePage visitUuid="visit-1" encounterUuid="enc-1" />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  useUserMock.mockReturnValue({
    isLoading: false,
    userData: {
      id: 3,
      groups: ["OccupationalHealth"],
      enabled_modules: ["OccupationalHealth"],
      tenant: { id: 1 },
    },
  });
  fetchVisitMock.mockResolvedValue({
    uuid: "visit-1",
    customer: "cust-1",
    encounters: [ENCOUNTER],
  });
  fetchCustomerMock.mockResolvedValue({
    id: 21,
    uuid: "cust-1",
    first_name: "Jane",
    last_name: "Doe",
    customer_identifier: "C-001",
    gender: "female",
    dob: "1990-01-01",
  });
  ohService.fetchOhExaminations.mockResolvedValue([EXAM]);
  ohService.fetchOhExamFindings.mockResolvedValue([]);
  ohService.fetchFitnessAssessments.mockResolvedValue([]);
  ohService.fetchFitnessCertificates.mockResolvedValue([]);
  ohService.fetchIodCases.mockResolvedValue([]);
  ohService.fetchEmploymentEpisodes.mockResolvedValue([]);
  ohService.fetchOhEmployers.mockResolvedValue([]);
  ohService.fetchOhJobTitles.mockResolvedValue([]);
  ohService.createOhExamination.mockResolvedValue(EXAM);
  ohService.createFitnessCertificate.mockResolvedValue({});
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  window.history.replaceState(null, "", "/");
});

const ASSESSMENT = {
  id: 31,
  uuid: "fa-1",
  examination: 11,
  outcome: "fit_with_restrictions",
  assessed_at: "2026-10-26T09:00:00Z",
  review_date: null,
  clinician: 3,
};

describe("OhEncounterWorkspacePage", () => {
  it("renders the record, encounter, and worker columns without loading the encounter list", async () => {
    renderPage();

    expect(await screen.findByTestId("oh-encounter-columns")).toBeInTheDocument();
    expect(screen.getByTestId("oh-encounter-form-column")).toBeInTheDocument();
    expect(screen.getByTestId("oh-encounter-records-column")).toBeInTheDocument();
    expect(screen.getByTestId("oh-encounter-worker-column")).toBeInTheDocument();

    const records = await screen.findByTestId("oh-exam-records");
    expect(within(records).getByText("Periodic")).toBeInTheDocument();
    expect(within(records).getByText("Annual medical")).toBeInTheDocument();
    expect(ohService.fetchOhEncounters).not.toHaveBeenCalled();
  });

  it("falls back to the encounter list when the visit does not include it", async () => {
    fetchVisitMock.mockResolvedValue({ uuid: "visit-1", customer: "cust-1", encounters: [] });
    ohService.fetchOhEncounters.mockResolvedValue([ENCOUNTER]);

    renderPage();

    expect(await screen.findByTestId("oh-encounter-columns")).toBeInTheDocument();
    expect(ohService.fetchOhEncounters).toHaveBeenCalled();
  });

  it("shows not found when the encounter cannot be resolved", async () => {
    fetchVisitMock.mockResolvedValue({ uuid: "visit-1", customer: "cust-1", encounters: [] });
    ohService.fetchOhEncounters.mockResolvedValue([]);

    renderPage();

    expect(await screen.findByTestId("oh-encounter-not-found")).toBeInTheDocument();
  });

  it("records an examination against this encounter", async () => {
    renderPage();

    fireEvent.change(await screen.findByLabelText("Notes"), {
      target: { value: "  Hearing review  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add examination" }));

    await waitFor(() =>
      expect(ohService.createOhExamination).toHaveBeenCalledWith({
        encounter: 7,
        exam_type: "periodic",
        occupational_attendance: true,
        notes: "Hearing review",
      }),
    );
  });

  it("locks fitness and findings until an examination exists", async () => {
    ohService.fetchOhExaminations.mockResolvedValue([]);
    renderPage();

    fireEvent.click(await findTab(/Fitness/));
    expect(await screen.findByTestId("oh-fitness-locked")).toBeInTheDocument();

    fireEvent.click(await findTab(/Findings/));
    expect(await screen.findByTestId("oh-findings-locked")).toBeInTheDocument();
  });

  it("certifies the outcome of the selected assessment and summarises it for the worker", async () => {
    ohService.fetchFitnessAssessments.mockResolvedValue([ASSESSMENT]);
    renderPage();

    fireEvent.click(await findTab(/Fitness/));
    fireEvent.click(await screen.findByRole("button", { name: "Issue certificate" }));

    await waitFor(() =>
      expect(ohService.createFitnessCertificate).toHaveBeenCalledWith(
        expect.objectContaining({
          assessment: 31,
          payload: { outcome: "fit_with_restrictions" },
        }),
      ),
    );

    const workerFitness = screen.getByTestId("oh-worker-fitness");
    expect(within(workerFitness).getByText("Fit with restrictions")).toBeInTheDocument();
  });

  it("links each examination to its findings and fitness outcome", async () => {
    ohService.fetchFitnessAssessments.mockResolvedValue([ASSESSMENT]);
    ohService.fetchOhExamFindings.mockResolvedValue([
      {
        id: 41,
        uuid: "f-1",
        examination: 11,
        code: "FEV1",
        numeric_value: "3.2",
        coded_value: "",
        unit: "L",
        recorded_at: "2026-10-26T08:30:00Z",
        threshold_flag: "none",
      },
    ]);
    renderPage();

    const records = await screen.findByTestId("oh-exam-records");
    expect(within(records).getByText(/1 finding/)).toBeInTheDocument();
    expect(within(records).getByText("Fit with restrictions")).toBeInTheDocument();
  });

  it("guides the next step and switches tabs from the progress checklist", async () => {
    renderPage();

    expect(await screen.findByTestId("oh-encounter-next-step")).toHaveTextContent(
      "Next: Fitness decision",
    );

    fireEvent.click(screen.getByTestId("oh-progress-step-fitness"));

    expect(await screen.findByTestId("oh-fitness-assessment-form")).toBeInTheDocument();
    expect(window.location.search).toBe("?tab=fitness");
  });

  it("opens the tab named in the URL", async () => {
    window.history.replaceState(null, "", "/?tab=iod");
    renderPage();

    expect(await screen.findByTestId("oh-iod-form")).toBeInTheDocument();
  });

  it("saves with Ctrl+Enter from the notes field", async () => {
    renderPage();

    const notes = await screen.findByLabelText("Notes");
    fireEvent.change(notes, { target: { value: "Shortcut save" } });
    fireEvent.keyDown(notes, { key: "Enter", ctrlKey: true });

    await waitFor(() =>
      expect(ohService.createOhExamination).toHaveBeenCalledWith(
        expect.objectContaining({ notes: "Shortcut save" }),
      ),
    );
  });

  it("asks for confirmation before withdrawing a certificate", async () => {
    ohService.fetchFitnessAssessments.mockResolvedValue([ASSESSMENT]);
    ohService.fetchFitnessCertificates.mockResolvedValue([
      {
        id: 51,
        uuid: "cert-1",
        assessment: 31,
        version: 1,
        status: "issued",
        valid_from: "2026-10-26",
        valid_to: "2027-10-26",
        signed_at: "2026-10-26T09:05:00Z",
        signed_by: 3,
        payload: {},
        previous_certificate: null,
        created_at: "2026-10-26T09:05:00Z",
        updated_at: "2026-10-26T09:05:00Z",
      },
    ]);
    ohService.withdrawFitnessCertificate.mockResolvedValue({});
    window.history.replaceState(null, "", "/?tab=fitness");
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Withdraw" }));
    expect(ohService.withdrawFitnessCertificate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Confirm withdraw" }));
    await waitFor(() =>
      expect(ohService.withdrawFitnessCertificate).toHaveBeenCalledWith("cert-1"),
    );
  });
});
