import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { OnboardingProgress } from "@/features/auth/services/onboarding.service";
import { WorkspaceSetupBanner } from "@/features/app-shell/components/WorkspaceSetupBanner";

const { bffRequest, useUser, push } = vi.hoisted(() => ({
  bffRequest: vi.fn(),
  useUser: vi.fn(),
  push: vi.fn(),
}));

vi.mock("@/lib/bff-client", () => ({
  bffRequest,
}));

vi.mock("@/providers/user-provider", () => ({
  useUser: () => useUser(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const emptySteps: OnboardingProgress["completed_steps"] = {
  clinic: true,
  modules: true,
  consultation_services: false,
  catalog: false,
  catalog_product: false,
  catalog_pricelist: false,
  insurance: false,
  invites: false,
};

function progress(overrides: Partial<OnboardingProgress> = {}): OnboardingProgress {
  return {
    status: "in_progress",
    tenant_name: "Lakeview",
    dismissed_at: null,
    completed_at: null,
    completed_steps: emptySteps,
    ...overrides,
  };
}

function renderBanner() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return render(<WorkspaceSetupBanner />, { wrapper: Wrapper });
}

describe("workspace setup banner", () => {
  afterEach(() => {
    cleanup();
    bffRequest.mockReset();
    push.mockReset();
  });

  it("stays hidden while the setup steps are on screen", async () => {
    useUser.mockReturnValue({ userData: { is_admin: true } });
    bffRequest.mockResolvedValue(progress());

    renderBanner();

    await waitFor(() => {
      expect(bffRequest).toHaveBeenCalled();
    });
    expect(screen.queryByTestId("workspace-setup-banner")).not.toBeInTheDocument();
  });

  it("keeps the skipped setup notice as a full-width control", async () => {
    useUser.mockReturnValue({ userData: { is_admin: true } });
    bffRequest.mockResolvedValue(progress({ dismissed_at: "2026-01-01T00:00:00Z" }));

    renderBanner();

    const banner = await screen.findByRole("button", {
      name: "Finish setting up your clinic",
    });
    expect(banner).toHaveAttribute("data-testid", "workspace-setup-banner");
    expect(banner.className).toContain("w-full");
  });

  it("stays hidden once the clinic is ready", async () => {
    useUser.mockReturnValue({ userData: { is_admin: true } });
    bffRequest.mockResolvedValue(
      progress({
        status: "completed",
        completed_at: "2020-01-01T00:00:00Z",
      }),
    );

    renderBanner();

    await waitFor(() => {
      expect(bffRequest).toHaveBeenCalled();
    });
    expect(screen.queryByTestId("workspace-setup-banner")).not.toBeInTheDocument();
  });
});
