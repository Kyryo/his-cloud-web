export type CareProviderRecord = {
  id: number;
  uuid: string;
  provider_id: number;
  display_name: string;
  is_active: boolean;
  provider_has_user: boolean;
  provider_user_id: number | null;
  user_id: number | null;
  user_email: string | null;
  user_role: string | null;
  clinic_ids: number[];
  created_at: string;
  updated_at: string;
};

export type CareProvidersListResponse = {
  count: number;
  results: CareProviderRecord[];
};

export type FetchCareProvidersOptions = {
  search?: string;
  clinicId?: number | null;
  hasUser?: boolean;
  isActive?: boolean;
};

export type CreateCareProviderPayload = {
  display_name: string;
  user_id?: number | null;
  clinic_ids?: number[];
  create_user_account?: boolean;
  invite_email?: string;
  user_role?: "physician" | "nurse";
};

export type UpdateCareProviderPayload = {
  display_name?: string;
  is_active?: boolean;
  user_id?: number | null;
  unlink_user?: boolean;
  clinic_ids?: number[];
};
