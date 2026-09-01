export type Tag = {
  id: number;
  uuid: string;
  tenant: number;
  target_type: string;
  name: string;
  slug: string;
  color: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
};

export type TagAssignment = {
  id: number;
  uuid: string;
  tenant: number;
  tag: Tag;
  target_type: string;
  target_uuid: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
};

export type TagsListResponse = {
  results: Tag[];
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  } | null;
};

export type TagListFilters = {
  target_type?: string;
  search?: string;
  is_active?: boolean;
  page?: number;
  pageSize?: number;
  ordering?: string;
};

export type CreateTagPayload = {
  target_type: string;
  name: string;
  color?: string;
  description?: string;
  is_active?: boolean;
};

export type UpdateTagPayload = Partial<CreateTagPayload>;

export type SyncEntityTagsPayload = {
  tag_uuids: string[];
};
