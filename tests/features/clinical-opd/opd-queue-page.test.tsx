import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OpdQueuePage } from "@/features/clinical-opd/pages/OpdQueuePage";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/providers/user-provider", () => ({
  useUser: () => ({
    isLoading: false,
    userData: { groups: ["Clinical"], user_role: "nurse" },
  }),
}));

vi.mock("@/features/clinical-opd/hooks/use-clinical-opd", () => ({
  useOpdQueue: () => ({
    data: [
      {
        encounter_uuid: "enc-1",
        visit_uuid: "visit-1",
        customer_uuid: "cust-1",
        customer_name: "Jane Doe",
        department_name: "OPD",
        status: "waiting",
        started_at: null,
        mode_of_payment: "cash",
        insurance_scheme_name: null,
      },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
});

describe("OpdQueuePage", () => {
  it("renders queue rows for clinical users", () => {
    render(<OpdQueuePage />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open" })).toHaveAttribute(
      "href",
      "/clinical/opd/visit-1/enc-1",
    );
  });
});
