import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OpdQueuePage } from "@/features/clinical-opd/pages/OpdQueuePage";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
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
  useOpdQueue: () => ({
    data: [
      {
        encounter_uuid: "enc-1",
        visit_uuid: "visit-1",
        visit_status: "active",
        customer_uuid: "cust-1",
        customer_name: "Jane Doe",
        department_name: "OPD",
        status: "waiting",
        started_at: null,
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
      },
    ],
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  }),
  useMyClinicalCapabilities: () => ({
    data: { capabilities: ["record_chief_complaint", "record_hpi"] },
    isLoading: false,
  }),
}));

afterEach(() => {
  cleanup();
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
    renderQueuePage();

    expect(screen.getByTestId("opd-queue-view-toggle")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByTestId("opd-queue-wait")).toHaveTextContent("14 min");
    expect(screen.getByText(/CLI-100/)).toBeInTheDocument();
    expect(screen.getByText(/Female/)).toBeInTheDocument();
    expect(screen.getByTestId("opd-queue-stage")).toHaveTextContent("Registered");
    expect(screen.getByTestId("opd-queue-status")).toHaveTextContent("Waiting");
    expect(screen.queryByTestId("opd-queue-vitals")).not.toBeInTheDocument();
    expect(screen.queryByTestId("opd-queue-allergies")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open" })).toHaveAttribute(
      "href",
      "/clinical/opd/visit-1/enc-1/complaint",
    );
  });
});