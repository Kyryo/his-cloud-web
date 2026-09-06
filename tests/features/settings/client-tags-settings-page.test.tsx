import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ClientTagsSettingsPage } from "@/features/settings/pages/ClientTagsSettingsPage";

const useUser = vi.fn();
const fetchTags = vi.fn();
const archiveTag = vi.fn();
const toast = vi.fn();

vi.mock("@/providers/user-provider", () => ({
  useUser: () => useUser(),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast }),
}));

vi.mock("@/features/tags/services/tags.service", () => ({
  fetchTags: (...args: unknown[]) => fetchTags(...args),
  archiveTag: (...args: unknown[]) => archiveTag(...args),
  createTag: vi.fn(),
  updateTag: vi.fn(),
}));

afterEach(() => {
  cleanup();
  useUser.mockReset();
  fetchTags.mockReset();
  archiveTag.mockReset();
  toast.mockReset();
});

describe("ClientTagsSettingsPage", () => {
  it("restricts the page for non-admins", () => {
    useUser.mockReturnValue({
      userData: { is_admin: false },
      isLoading: false,
    });

    render(<ClientTagsSettingsPage />);

    expect(screen.getByText("Access restricted")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to account settings" }),
    ).toBeInTheDocument();
  });

  it("lists tags as rows and archives one", async () => {
    useUser.mockReturnValue({
      userData: { is_admin: true },
      isLoading: false,
    });
    fetchTags.mockResolvedValue({
      results: [
        {
          id: 1,
          uuid: "tag-1",
          tenant: 1,
          target_type: "customer",
          name: "VIP",
          slug: "vip",
          color: "#0f766e",
          description: "Priority clients",
          is_active: true,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
          created_by: null,
        },
      ],
    });
    archiveTag.mockResolvedValue(undefined);

    render(<ClientTagsSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText("VIP")).toBeInTheDocument();
    });
    expect(screen.getByText("Priority clients")).toBeInTheDocument();
    expect(screen.queryByRole("columnheader")).not.toBeInTheDocument();
    expect(screen.queryByText("#0f766e")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Archive" }));

    await waitFor(() => {
      expect(archiveTag).toHaveBeenCalledWith("tag-1");
    });
    expect(screen.queryByText("VIP")).not.toBeInTheDocument();
  });
});
