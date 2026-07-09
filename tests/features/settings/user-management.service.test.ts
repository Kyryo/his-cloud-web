import { describe, expect, it, vi } from "vitest";

import { BFF_SETTINGS_ROUTES } from "@/constants/api";
import {
  addUserToOrganizationGroup,
  createOrganizationGroup,
  createOrganizationUser,
  createUserClinicAssociation,
  fetchOrganizationGroup,
  fetchOrganizationGroups,
  fetchOrganizationUser,
  fetchOrganizationUsers,
  fetchUserClinicAssociations,
  removeUserFromOrganizationGroup,
  setPrimaryUserClinicAssociation,
  updateOrganizationGroup,
  updateOrganizationUser,
} from "@/features/settings/services/user-management.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

describe("user-management.service", () => {
  it("fetches organization users", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      results: [{ id: 1, name: "Jane Doe", email: "jane@test.com" }],
      pagination: null,
    });

    const response = await fetchOrganizationUsers();

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_SETTINGS_ROUTES.users}?page_size=100`,
    );
    expect(response.results).toHaveLength(1);
  });

  it("creates and updates organization users", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({ id: 2, name: "New User" });
    await createOrganizationUser({
      name: "New User",
      email: "new@test.com",
      password: "password123",
    });
    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.users, {
      method: "POST",
      body: {
        name: "New User",
        email: "new@test.com",
        password: "password123",
      },
    });

    vi.mocked(bffRequest).mockResolvedValueOnce({ id: 2, name: "Updated User" });
    await updateOrganizationUser(2, { name: "Updated User" });
    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.userDetail(2), {
      method: "PATCH",
      body: { name: "Updated User" },
    });

    vi.mocked(bffRequest).mockResolvedValueOnce({
      id: 2,
      name: "Updated User",
      is_admin: true,
    });
    await updateOrganizationUser(2, { is_admin: true });
    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.userDetail(2), {
      method: "PATCH",
      body: { is_admin: true },
    });
  });

  it("fetches and updates organization groups", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      results: [{ id: 1, name: "Billing" }],
      pagination: null,
    });
    await fetchOrganizationGroups();
    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_SETTINGS_ROUTES.groups}?page_size=100`,
    );

    vi.mocked(bffRequest).mockResolvedValueOnce({
      id: 1,
      name: "Billing",
      users: [],
    });
    await fetchOrganizationGroup(1);
    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.groupDetail(1));

    vi.mocked(bffRequest).mockResolvedValueOnce({ id: 3, name: "Sales" });
    await createOrganizationGroup({ name: "Sales" });
    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.groups, {
      method: "POST",
      body: { name: "Sales" },
    });

    vi.mocked(bffRequest).mockResolvedValueOnce({ id: 1, name: "Updated Billing" });
    await updateOrganizationGroup(1, { name: "Updated Billing" });
    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.groupDetail(1), {
      method: "PATCH",
      body: { name: "Updated Billing" },
    });
  });

  it("adds and removes users from groups", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({ message: "added" });
    await addUserToOrganizationGroup({ user_id: 1, group_id: 2 });
    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.groupAddUser, {
      method: "POST",
      body: { user_id: 1, group_id: 2 },
    });

    vi.mocked(bffRequest).mockResolvedValueOnce({ message: "removed" });
    await removeUserFromOrganizationGroup({ user_id: 1, group_id: 2 });
    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.groupRemoveUser, {
      method: "POST",
      body: { user_id: 1, group_id: 2 },
    });
  });

  it("fetches user detail and clinic associations", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      id: 2,
      name: "Jane Doe",
      user_role: "nurse",
    });
    await fetchOrganizationUser(2);
    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.userDetail(2));

    vi.mocked(bffRequest).mockResolvedValueOnce({
      results: [{ id: 10, clinic: { id: 1, name: "Main" }, is_active: true }],
    });
    const associations = await fetchUserClinicAssociations(2);
    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_SETTINGS_ROUTES.userClinics}?user_id=2`,
    );
    expect(associations).toHaveLength(1);
  });

  it("creates clinic associations and sets primary clinic", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({ id: 11 });
    await createUserClinicAssociation({
      user: 2,
      clinic_id: 5,
      role: "staff",
    });
    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.userClinics, {
      method: "POST",
      body: { user: 2, clinic_id: 5, role: "staff" },
    });

    vi.mocked(bffRequest).mockResolvedValueOnce({ id: 11, is_primary: true });
    await setPrimaryUserClinicAssociation(11);
    expect(bffRequest).toHaveBeenCalledWith(
      BFF_SETTINGS_ROUTES.userClinicSetPrimary(11),
      { method: "POST" },
    );
  });
});
