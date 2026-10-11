import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { OnboardingProgress } from "@/features/auth/services/onboarding.service";
import { OverviewWorkspace } from "@/features/overview/components/OverviewWorkspace";

const { bffRequest, useUser } = vi.hoisted(() => ({
  bffRequest: vi.fn(),
  useUser: vi.fn(),
}));

vi.mock("@/lib/bff-client", () => ({
  bffRequest,
}));

vi.mock("@/providers/user-provider", () => ({
  useUser: () => useUser(),
}));

const emptySteps: OnboardingProgress["completed_steps"] = {
  clinic: true,
  departments: false,
  modules: true,
  consultation_services: false,
  catalog: false,
  catalog_product: false,
  catalog_pricelist: false,
  insurance: false,
  invites: false,
};

function progress(
  overrides: Partial<OnboardingProgress> = {},
): OnboardingProgress {
  return {
    status: "in_progress",
    tenant_name: "Lakeview",
    dismissed_at: null,
    completed_at: null,
    completed_steps: emptySteps,
    ...overrides,
  };
}

function renderWorkspace() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return render(<OverviewWorkspace />, { wrapper: Wrapper });
}

function mockUser(isAdmin: boolean) {
  useUser.mockReturnValue({
    userData: {
      name: "Amina Banda",
      is_admin: isAdmin,
      groups: ["Registration", "Billing"],
      enabled_modules: ["Registration", "Billing"],
    },
  });
}

describe("overview setup guide", () => {
  afterEach(() => {
    cleanup();
    bffRequest.mockReset();
    sessionStorage.clear();
  });

  it("shows the clinic as ready and links the next step to products", async () => {
    mockUser(true);
    bffRequest.mockImplementation((path: string) => {
      if (path === "/api/onboarding") {
        return Promise.resolve(progress());
      }
      return Promise.resolve([]);
    });

    renderWorkspace();

    expect(await screen.findByText("Lakeview is ready.")).toBeInTheDocument();
    expect(screen.getByText("Here's what your clinic still needs.")).toBeInTheDocument();
    expect(
      screen.queryByText("Finish setting up your clinic"),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Complete setup" })).not.toBeInTheDocument();
    expect(screen.getByText("2 of 5 ready")).toBeInTheDocument();
    expect(screen.getByText("Choose your modules")).toBeInTheDocument();
    expect(screen.getByText("Add departments")).toBeInTheDocument();
    expect(screen.getByText("Add a service or product")).toBeInTheDocument();
    expect(screen.getByText("Payer (or insurance)")).toBeInTheDocument();
    expect(
      screen.getByText(
        "A payer can be an insurance provider. Claims need a payer and a scheme.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Consultation service")).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Set up" })[0]).toHaveAttribute(
      "href",
      "/settings/organization?tab=departments&add=department&from=onboarding",
    );
    expect(
      screen.queryByText("Here's what you can get done today."),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Register or view clients")).not.toBeInTheDocument();
    expect(screen.queryByText("Latest from Sigma.")).not.toBeInTheDocument();
  });

  it("links choose your modules ahead of departments when modules are missing", async () => {
    mockUser(true);
    bffRequest.mockImplementation((path: string) => {
      if (path === "/api/onboarding") {
        return Promise.resolve(
          progress({
            completed_steps: { ...emptySteps, modules: false },
          }),
        );
      }
      return Promise.resolve([]);
    });

    renderWorkspace();

    expect(await screen.findByText("Choose your modules")).toBeInTheDocument();
    expect(screen.getByText("1 of 5 ready")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Set up" })[0]).toHaveAttribute(
      "href",
      "/settings/modules?from=onboarding",
    );
  });

  it("marks a service or product as ready without a pricelist", async () => {
    mockUser(true);
    bffRequest.mockImplementation((path: string) => {
      if (path === "/api/onboarding") {
        return Promise.resolve(
          progress({
            completed_steps: { ...emptySteps, catalog: true, catalog_product: true },
          }),
        );
      }
      return Promise.resolve([]);
    });

    renderWorkspace();

    expect(await screen.findByText("Lakeview is ready.")).toBeInTheDocument();
    expect(screen.getByText("3 of 5 ready")).toBeInTheDocument();
    const hrefs = screen
      .getAllByRole("link", { name: "Set up" })
      .map((link) => link.getAttribute("href"));
    expect(hrefs).not.toContain("/inventory/products?add=product&from=onboarding");
    expect(hrefs.some((href) => href?.includes("/inventory/pricelists"))).toBe(false);
  });

  it("shows the current overview once setup is complete", async () => {
    mockUser(true);
    bffRequest.mockImplementation((path: string) => {
      if (path === "/api/onboarding") {
        return Promise.resolve(
          progress({
            status: "completed",
            completed_at: "2020-01-01T00:00:00Z",
          }),
        );
      }
      return Promise.resolve([]);
    });

    renderWorkspace();

    expect(
      await screen.findByText("Here's what you can get done today."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Set up your clinic")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Register a client" })).not.toBeInTheDocument();
    expect(
      screen.queryByText("Your clinic can register a client and start billing."),
    ).not.toBeInTheDocument();
  });

  it("congratulates a clinic that just finished setup", async () => {
    mockUser(true);
    bffRequest.mockImplementation((path: string) => {
      if (path === "/api/onboarding") {
        return Promise.resolve(
          progress({
            status: "completed",
            completed_at: new Date().toISOString(),
            completed_steps: {
              ...emptySteps,
              departments: true,
              catalog: true,
              insurance: true,
            },
          }),
        );
      }
      return Promise.resolve([]);
    });

    renderWorkspace();

    expect(await screen.findByRole("dialog", { name: "You're all set" })).toBeInTheDocument();
    expect(screen.getByText("Lakeview is ready for its first client.")).toBeInTheDocument();
    expect(
      screen.queryByText("Your clinic can register a client and start billing."),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Set up your clinic")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register a client" })).toHaveAttribute(
      "href",
      "/customers?new=1",
    );
    expect(
      screen.getByText("Here's what you can get done today."),
    ).toBeInTheDocument();
  });

  it("keeps a dismissed guide as a resume line on the current overview", async () => {
    mockUser(true);
    bffRequest.mockImplementation((path: string) => {
      if (path === "/api/onboarding") {
        return Promise.resolve(
          progress({ dismissed_at: "2026-01-01T00:00:00Z" }),
        );
      }
      return Promise.resolve([]);
    });

    renderWorkspace();

    expect(
      await screen.findByText("Here's what you can get done today."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Finish setting up your clinic",
      }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Complete setup" })).not.toBeInTheDocument();
    expect(screen.getByText("Register or view clients")).toBeInTheDocument();
    expect(screen.getByText("Book or view appointments")).toBeInTheDocument();
    expect(screen.queryByText("Set up your clinic")).not.toBeInTheDocument();
  });

  it("shows a skeleton while the overview is loading", () => {
    mockUser(true);
    bffRequest.mockImplementation((path: string) => {
      if (path === "/api/onboarding") {
        return new Promise(() => undefined);
      }
      return Promise.resolve([]);
    });

    renderWorkspace();

    expect(screen.getByTestId("overview-skeleton")).toBeInTheDocument();
    expect(screen.queryByText("Here's what you can get done today.")).not.toBeInTheDocument();
    expect(screen.queryByText("Set up your clinic")).not.toBeInTheDocument();
  });

  it("does not load the guide for someone who is not an admin", async () => {
    mockUser(false);
    bffRequest.mockResolvedValue([]);

    renderWorkspace();

    expect(
      await screen.findByText("Here's what you can get done today."),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(bffRequest).toHaveBeenCalled();
    });
    expect(bffRequest).not.toHaveBeenCalledWith("/api/onboarding");
    expect(screen.queryByText("Set up your clinic")).not.toBeInTheDocument();
  });
});
