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
  fetchOhHazardProfiles: vi.fn(),
  fetchOhExamTemplateVersions: vi.fn(),
  createOhExamination: vi.fn(),
  createFitnessAssessment: vi.fn(),
  createFitnessCertificate: vi.fn(),
  withdrawFitnessCertificate: vi.fn(),
  createOhExamFinding: vi.fn(),
  createIodCase: vi.fn(),
  downloadIodStatutoryPack: vi.fn(),
  fetchOhVisitHistory: vi.fn(),
  patchOhExaminationResponses: vi.fn(),
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

const EPISODE = {
  id: 9,
  uuid: "ep-1",
  customer: 21,
  employer: 5,
  job_title: 1,
  site: "",
  department_name: "",
  employment_type: "employee",
  employee_number: "",
  start_date: "2026-01-01",
  end_date: null,
  requires_fitness: false,
  hazard_profile: 44,
  job_profile: null,
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const ASSESSMENT = {
  id: 31,
  uuid: "fa-1",
  examination: 11,
  outcome: "fit_with_restrictions",
  assessed_at: "2026-10-26T09:00:00Z",
  review_date: null,
  clinician: 3,
};

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
  ohService.fetchOhExaminations.mockResolvedValue([]);
  ohService.fetchOhExamFindings.mockResolvedValue([]);
  ohService.fetchFitnessAssessments.mockResolvedValue([]);
  ohService.fetchFitnessCertificates.mockResolvedValue([]);
  ohService.fetchIodCases.mockResolvedValue([]);
  ohService.fetchEmploymentEpisodes.mockResolvedValue([EPISODE]);
  ohService.fetchOhEmployers.mockResolvedValue([]);
  ohService.fetchOhJobTitles.mockResolvedValue([]);
  ohService.fetchOhHazardProfiles.mockResolvedValue([
    {
      id: 44,
      uuid: "hp-1",
      name: "Welding",
      code: "WELD",
      exam_template: "tmpl-1",
      exam_template_code: "EXAM",
      exam_template_name: "Annual exam",
      employer: 5,
    },
  ]);
  ohService.fetchOhExamTemplateVersions.mockResolvedValue([
    {
      id: 1,
      uuid: "ver-1",
      number: 1,
      status: "published",
      snapshot_json: {
        schema_version: 2,
        sections: [
          {
            code: "vitals",
            name: "Vitals",
            content_mode: "direct",
            response_fields: [{ code: "bp", label: "BP", response_type: "text" }],
            items: [],
          },
        ],
      },
    },
  ]);
  ohService.fetchOhVisitHistory.mockResolvedValue({
    visits: [],
    selected_visit_uuid: null,
    selected_encounter_uuid: null,
    examinations: [],
    findings: [],
    fitness_assessments: [],
    fitness_certificates: [],
    iod_cases: [],
  });
  ohService.createFitnessCertificate.mockResolvedValue({});
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  window.history.replaceState(null, "", "/");
});

describe("OhEncounterWorkspacePage", () => {
  it("renders the module nav and medical examinations dialog", async () => {
    renderPage();

    expect(await screen.findByTestId("oh-encounter-module-layout")).toBeInTheDocument();
    const nav = screen.getByTestId("oh-encounter-module-nav");
    expect(within(nav).getByText("Medical Examinations")).toBeInTheDocument();
    expect(within(nav).getByText("Occupational Health Certificate")).toBeInTheDocument();
    expect(within(nav).getByText("Injury on Duty Management")).toBeInTheDocument();
    expect(await screen.findByTestId("oh-exam-type-dialog")).toBeInTheDocument();
    expect(ohService.fetchOhEncounters).not.toHaveBeenCalled();
  });

  it("falls back to the encounter list when the visit does not include it", async () => {
    fetchVisitMock.mockResolvedValue({ uuid: "visit-1", customer: "cust-1", encounters: [] });
    ohService.fetchOhEncounters.mockResolvedValue([ENCOUNTER]);

    renderPage();

    expect(await screen.findByTestId("oh-encounter-module-layout")).toBeInTheDocument();
    expect(ohService.fetchOhEncounters).toHaveBeenCalled();
  });

  it("shows not found when the encounter cannot be resolved", async () => {
    fetchVisitMock.mockResolvedValue({ uuid: "visit-1", customer: "cust-1", encounters: [] });
    ohService.fetchOhEncounters.mockResolvedValue([]);

    renderPage();

    expect(await screen.findByTestId("oh-encounter-not-found")).toBeInTheDocument();
  });

  it("opens the certificate module with form and records", async () => {
    ohService.fetchFitnessAssessments.mockResolvedValue([ASSESSMENT]);
    ohService.fetchOhExaminations.mockResolvedValue([
      {
        id: 11,
        uuid: "exam-1",
        encounter: 7,
        exam_type: "periodic",
        occupational_attendance: true,
        template_code: "",
        notes: "",
        examined_at: "2026-10-26T08:10:00Z",
        created_at: "2026-10-26T08:10:00Z",
        updated_at: "2026-10-26T08:10:00Z",
      },
    ]);
    window.history.replaceState(null, "", "/?panel=certificate");
    renderPage();

    expect(await screen.findByTestId("oh-fitness-certificate-form")).toBeInTheDocument();
    expect(screen.getByTestId("oh-certificate-records-empty")).toBeInTheDocument();
    const nav = screen.getByTestId("oh-encounter-module-nav");
    expect(within(nav).getByText("Occupational Health Certificate")).toBeInTheDocument();
  });

  it("asks for confirmation before withdrawing a certificate", async () => {
    ohService.fetchFitnessAssessments.mockResolvedValue([ASSESSMENT]);
    ohService.fetchOhExaminations.mockResolvedValue([
      {
        id: 11,
        uuid: "exam-1",
        encounter: 7,
        exam_type: "periodic",
        occupational_attendance: true,
        template_code: "",
        notes: "",
        examined_at: "2026-10-26T08:10:00Z",
        created_at: "2026-10-26T08:10:00Z",
        updated_at: "2026-10-26T08:10:00Z",
      },
    ]);
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
    window.history.replaceState(null, "", "/?panel=certificate");
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Withdraw" }));
    expect(ohService.withdrawFitnessCertificate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Confirm withdraw" }));
    await waitFor(() =>
      expect(ohService.withdrawFitnessCertificate).toHaveBeenCalledWith("cert-1"),
    );
  });
});
