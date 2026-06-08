import { BFF_SETTINGS_ROUTES } from "@/constants/api";
import type {
  CreateOrganizationGroupPayload,
  CreateOrganizationUserPayload,
  CreateUserClinicAssociationPayload,
  CreateUserLocationAssociationPayload,
  GroupMembershipPayload,
  OrganizationGroup,
  OrganizationGroupDetail,
  OrganizationListResponse,
  OrganizationUser,
  OrganizationUserDetail,
  UpdateOrganizationGroupPayload,
  UpdateOrganizationUserPayload,
  UpdateUserClinicAssociationPayload,
  UpdateUserLocationAssociationPayload,
  UserClinicAssociation,
  UserLocationAssociation,
} from "@/features/settings/types/settings.types";
import { bffRequest } from "@/lib/bff-client";

export async function fetchOrganizationUsers(): Promise<
  OrganizationListResponse<OrganizationUser>
> {
  return bffRequest<OrganizationListResponse<OrganizationUser>>(
    `${BFF_SETTINGS_ROUTES.users}?page_size=100`,
  );
}

export async function createOrganizationUser(
  payload: CreateOrganizationUserPayload,
): Promise<OrganizationUser> {
  return bffRequest<OrganizationUser>(BFF_SETTINGS_ROUTES.users, {
    method: "POST",
    body: payload,
  });
}

export async function fetchOrganizationUser(
  id: number,
): Promise<OrganizationUserDetail> {
  return bffRequest<OrganizationUserDetail>(BFF_SETTINGS_ROUTES.userDetail(id));
}

export async function updateOrganizationUser(
  id: number,
  payload: UpdateOrganizationUserPayload,
): Promise<OrganizationUser> {
  return bffRequest<OrganizationUser>(BFF_SETTINGS_ROUTES.userDetail(id), {
    method: "PATCH",
    body: payload,
  });
}

export async function fetchUserClinicAssociations(
  userId: number,
): Promise<UserClinicAssociation[]> {
  const data = await bffRequest<{ results: UserClinicAssociation[] }>(
    `${BFF_SETTINGS_ROUTES.userClinics}?user_id=${userId}`,
  );

  return data.results.filter((association) => association.is_active);
}

export async function createUserClinicAssociation(
  payload: CreateUserClinicAssociationPayload,
): Promise<UserClinicAssociation> {
  return bffRequest<UserClinicAssociation>(BFF_SETTINGS_ROUTES.userClinics, {
    method: "POST",
    body: payload,
  });
}

export async function updateUserClinicAssociation(
  id: number,
  payload: UpdateUserClinicAssociationPayload,
): Promise<UserClinicAssociation> {
  return bffRequest<UserClinicAssociation>(
    BFF_SETTINGS_ROUTES.userClinicDetail(id),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function removeUserClinicAssociation(
  id: number,
): Promise<{ detail: string }> {
  return bffRequest<{ detail: string }>(BFF_SETTINGS_ROUTES.userClinicDetail(id), {
    method: "DELETE",
  });
}

export async function setPrimaryUserClinicAssociation(
  id: number,
): Promise<UserClinicAssociation> {
  return bffRequest<UserClinicAssociation>(
    BFF_SETTINGS_ROUTES.userClinicSetPrimary(id),
    { method: "POST" },
  );
}

export async function fetchUserLocationAssociations(
  userId: number,
): Promise<UserLocationAssociation[]> {
  const data = await bffRequest<{ results: UserLocationAssociation[] }>(
    `${BFF_SETTINGS_ROUTES.userLocations}?user_id=${userId}`,
  );

  return data.results.filter((association) => association.is_active);
}

export async function createUserLocationAssociation(
  payload: CreateUserLocationAssociationPayload,
): Promise<UserLocationAssociation> {
  return bffRequest<UserLocationAssociation>(BFF_SETTINGS_ROUTES.userLocations, {
    method: "POST",
    body: payload,
  });
}

export async function updateUserLocationAssociation(
  id: number,
  payload: UpdateUserLocationAssociationPayload,
): Promise<UserLocationAssociation> {
  return bffRequest<UserLocationAssociation>(
    BFF_SETTINGS_ROUTES.userLocationDetail(id),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function removeUserLocationAssociation(id: number): Promise<void> {
  await bffRequest<{ success: boolean }>(
    BFF_SETTINGS_ROUTES.userLocationDetail(id),
    { method: "DELETE" },
  );
}

export async function setPrimaryUserLocationAssociation(
  id: number,
): Promise<UserLocationAssociation> {
  return bffRequest<UserLocationAssociation>(
    BFF_SETTINGS_ROUTES.userLocationSetPrimary(id),
    { method: "POST" },
  );
}

export async function fetchOrganizationGroups(): Promise<
  OrganizationListResponse<OrganizationGroup>
> {
  return bffRequest<OrganizationListResponse<OrganizationGroup>>(
    `${BFF_SETTINGS_ROUTES.groups}?page_size=100`,
  );
}

export async function fetchOrganizationGroup(
  id: number,
): Promise<OrganizationGroupDetail> {
  return bffRequest<OrganizationGroupDetail>(BFF_SETTINGS_ROUTES.groupDetail(id));
}

export async function createOrganizationGroup(
  payload: CreateOrganizationGroupPayload,
): Promise<OrganizationGroup> {
  return bffRequest<OrganizationGroup>(BFF_SETTINGS_ROUTES.groups, {
    method: "POST",
    body: payload,
  });
}

export async function updateOrganizationGroup(
  id: number,
  payload: UpdateOrganizationGroupPayload,
): Promise<OrganizationGroup> {
  return bffRequest<OrganizationGroup>(BFF_SETTINGS_ROUTES.groupDetail(id), {
    method: "PATCH",
    body: payload,
  });
}

export async function deleteOrganizationGroup(id: number): Promise<void> {
  await bffRequest<{ success: boolean }>(BFF_SETTINGS_ROUTES.groupDetail(id), {
    method: "DELETE",
  });
}

export async function addUserToOrganizationGroup(
  payload: GroupMembershipPayload,
): Promise<{ message: string }> {
  return bffRequest<{ message: string }>(BFF_SETTINGS_ROUTES.groupAddUser, {
    method: "POST",
    body: payload,
  });
}

export async function removeUserFromOrganizationGroup(
  payload: GroupMembershipPayload,
): Promise<{ message: string }> {
  return bffRequest<{ message: string }>(BFF_SETTINGS_ROUTES.groupRemoveUser, {
    method: "POST",
    body: payload,
  });
}
