import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OpdQueuePage } from "@/features/clinical-opd/pages/OpdQueuePage";

const queueHooks = vi.hoisted(() => ({
  useSpecialtyQueue: vi.fn(),
  useMemberDepartments: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/clinical/opd",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/providers/user-provider", () => ({
  useUser: () => ({
    isLoading: false,
    userData: { groups: ["Clinical"], user_role: "physician" },
  }),
}));

vi.mock("@/features/clinical-opd/hooks/use-clinical-opd", () => ({
  useMyClinicalCapabilities: () => ({
    data: { capabilities: ["record_chief_complaint", "record_hpi"] },
    isLoading: false,
  }),
}));

vi.mock("@/features/clinical-workspace/hooks/use-clinical-departments", () => ({
  useMemberDepartments: queueHooks.useMemberDepartments,
  useSpecialtyQueue: queueHooks.useSpecialtyQueue,
}));

const OPD_DEPARTMENT = {
  uuid: "dept-opd",
  name: "OPD",
  code: "OPD",
  department_type: "opd",
  clinic_uuid: "clinic-1",
  clinic_name: "Main",
  specialty_code: "opd",
  specialty_label: "OPD",
  waiting_count: 1,
};

const QUEUE_ROW = {
  encounter_uuid: "enc-1",
  visit_uuid: "visit-1",
  visit_status: "active",
  customer_uuid: "cust-1",
  customer_name: "Jane Doe",
  department_name: "OPD",
  status: "waiting",
  started_at: null,
  visit_date: "2026-10-20T09:15:00Z",
  created_at: "2026-10-20T09:15:00Z",
  mode_of_payment: "cash",
  insurance_scheme_name: null,
  queue_stage: "registered",
  waiting_minutes: 14,
  customer_identifier: "CLI-100",
  customer_dob: "1990-06-01",
  customer_gender: "Female",
  latest_vitals: [
    {
      code: "pulse",
      name: "Pulse",
      numeric_value: "78",
      text_value: "78",
      unit: "bpm",
    },
  ],
  allergy_count: 1,
  highest_allergy_severity: "moderate",
};

function mockQueue(departments = [OPD_DEPARTMENT], rows = [QUEUE_ROW]) {
  queueHooks.useMemberDepartments.mockReturnValue({
    data: departments,
    isLoading: false,
    isSuccess: true,
  });
  queueHooks.useSpecialtyQueue.mockReturnValue({
    data: rows,
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  });
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderQueuePage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <OpdQueuePage />
    </QueryClientProvider>,
  );
}

describe("OpdQueuePage", () => {
  it("renders the view toggle and richer queue rows", () => {
    mockQueue();
    renderQueuePage();

    expect(screen.getByTestId("opd-queue-view-toggle")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByTestId("opd-queue-wait")).toHaveTextContent("14 min");
    expect(screen.getByText("CLI-100")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Date & Time" })).toBeInTheDocument();
    expect(screen.getByTestId("opd-queue-datetime")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Demographics" })).toBeInTheDocument();
    expect(screen.getByTestId("opd-queue-demographics")).toHaveTextContent(
      /^Female · \d+/,
    );
    expect(screen.getByTestId("opd-queue-stage")).toHaveTextContent("Registered");
    expect(screen.getByTestId("opd-queue-status")).toHaveTextContent("Waiting");
    expect(screen.queryByTestId("opd-queue-vitals")).not.toBeInTheDocument();
    expect(screen.queryByTestId("opd-queue-allergies")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open" })).toHaveAttribute(
      "href",
      "/clinical/opd/visit-1/enc-1/complaint",
    );
  });

  it("queries the OPD specialty queue across every member department", () => {
    mockQueue();
    renderQueuePage();

    expect(queueHooks.useMemberDepartments).toHaveBeenCalledWith("opd");
    expect(queueHooks.useSpecialtyQueue).toHaveBeenCalledWith(
      "opd",
      expect.objectContaining({ departmentUuid: null }),
      true,
    );
    expect(screen.queryByTestId("clinical-department-switcher")).not.toBeInTheDocument();
  });

  it("shows the department switcher when the user belongs to several OPD departments", () => {
    mockQueue([
      OPD_DEPARTMENT,
      { ...OPD_DEPARTMENT, uuid: "dept-annex", name: "OPD Annex", waiting_count: 3 },
    ]);
    renderQueuePage();

    expect(screen.getByTestId("clinical-department-switcher")).toBeInTheDocument();
  });

  it("explains department membership when the user belongs to no OPD department", () => {
    mockQueue([], []);
    renderQueuePage();

    expect(screen.getByTestId("clinical-no-departments")).toHaveTextContent(
      "You are not assigned to any OPD department",
    );
    expect(screen.queryByText("Jane Doe")).not.toBeInTheDocument();
  });
});
