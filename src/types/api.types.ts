export type V1ApiError = {
  code: string;
  field: string | null;
  message: string;
};

export type ApiPagination = {
  count: number;
  next: string | null;
  previous: string | null;
};

export type PaginatedListResponse<T> = {
  results: T[];
  pagination: ApiPagination | null;
};

export type V1Envelope<T> = {
  success: boolean;
  message: string;
  data: T;
  meta: {
    request_id: string;
    pagination?: {
      count: number;
      next: string | null;
      previous: string | null;
    };
  };
  errors: V1ApiError[];
};

export function isV1Envelope<T>(value: unknown): value is V1Envelope<T> {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.success === "boolean" &&
    "data" in record &&
    Array.isArray(record.errors)
  );
}
