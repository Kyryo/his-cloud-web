import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthGuard } from "@/features/auth/components/AuthGuard";
import type { User } from "@/features/auth/types/auth.types";
import { useSessionStore } from "@/state/session.store";

vi.mock("@/features/auth/services/auth.service", () => ({
  bootstrapSession: vi.fn(),
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/handle-session-expired", () => ({
  handleSessionExpired: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: function MockImage({
    alt,
  }: {
    alt: string;
  }) {
    return <span>{alt}</span>;
  },
}));

import { bootstrapSession } from "@/features/auth/services/auth.service";

const user = {
  id: 1,
  name: "Ada Lovelace",
  url: "/users/1",
  email: "ada@example.com",
  permissions: {},
  is_admin: false,
  location: null,
  groups: ["Registration"],
  tenant: {
    id: 9,
    uuid: "tenant-9",
    name: "Sigma Clinic",
    code: "SIG",
    is_active: true,
  },
  clinics: null,
  locations: null,
  primary_clinic: null,
  primary_location: null,
} satisfies User;

describe("AuthGuard", () => {
  beforeEach(() => {
    useSessionStore.getState().reset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows the initialization screen until the session is ready", async () => {
    vi.mocked(bootstrapSession).mockResolvedValue(user);

    render(
      <AuthGuard>
        <div>Workspace</div>
      </AuthGuard>,
    );

    expect(screen.getByTestId("app-initialization-screen")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Workspace")).toBeInTheDocument();
    });
  });

  it("renders children immediately when the session is already hydrated", () => {
    useSessionStore.getState().hydrate(user);

    render(
      <AuthGuard>
        <div>Workspace</div>
      </AuthGuard>,
    );

    expect(screen.getByText("Workspace")).toBeInTheDocument();
    expect(
      screen.queryByTestId("app-initialization-screen"),
    ).not.toBeInTheDocument();
    expect(bootstrapSession).not.toHaveBeenCalled();
  });
});
