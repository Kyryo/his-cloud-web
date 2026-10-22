import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { UpdateUserDepartmentsPanel } from "@/features/settings/components/UpdateUserDepartmentsPanel";

const service = vi.hoisted(() => ({
  fetchUserDepartmentMemberships: vi.fn(),
  revokeUserDepartmentMembership: vi.fn(),
  fetchUserClinicAssociations: vi.fn(),
  grantUserDepartmentMembership: vi.fn(),
}));

vi.mock("@/features/settings/services/user-management.service", () => service);

vi.mock("@/features/settings/services/settings.service", () => ({
  fetchOrganizationDepartments: vi.fn().mockResolvedValue({ results: [] }),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

function renderPanel(onChanged = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <UpdateUserDepartmentsPanel userId={7} isActive onChanged={onChanged} />
    </QueryClientProvider>,
  );
  return onChanged;
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("UpdateUserDepartmentsPanel", () => {
  it("lists memberships and revokes one", async () => {
    service.fetchUserDepartmentMemberships.mockResolvedValue([
      {
        id: 1,
        department_uuid: "dept-dental",
        department_name: "Dental",
        department_code: "DENTAL",
        department_type: "dental",
        specialty_code: "dental",
        clinic_uuid: "clinic-1",
        clinic_name: "Main",
        is_active: true,
        created_at: "2026-10-17T09:00:00Z",
      },
    ]);
    service.revokeUserDepartmentMembership.mockResolvedValue(undefined);
    const onChanged = renderPanel();

    const membership = await screen.findByTestId("user-department-membership");
    expect(membership).toHaveTextContent("Dental");
    expect(membership).toHaveTextContent("Main");

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(() =>
      expect(service.revokeUserDepartmentMembership).toHaveBeenCalledWith(
        7,
        "dept-dental",
      ),
    );
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
  });

  it("explains that clinical access needs a department", async () => {
    service.fetchUserDepartmentMemberships.mockResolvedValue([]);
    renderPanel();

    expect(
      await screen.findByText(/Not a member of any department/),
    ).toBeInTheDocument();
  });
});
