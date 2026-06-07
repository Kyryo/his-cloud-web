import { HMIS_API_URL } from "@/constants/api";
import { createRequestId } from "@/lib/request-id";
import {
  isV1Envelope,
  type V1ApiError,
  type V1Envelope,
} from "@/types/api.types";

const API_TIMEOUT_MS = 30_000;

export class HmisApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly errors: V1ApiError[] = [],
  ) {
    super(message);
    this.name = "HmisApiError";
  }
}

type HmisRequestOptions = {
  method?: string;
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
};

export type HmisRequestMeta = V1Envelope<unknown>["meta"];

export type HmisRequestResult<T> = {
  data: T;
  meta: HmisRequestMeta;
};

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export async function hmisApiRequest<T>(
  path: string,
  options: HmisRequestOptions = {},
): Promise<T> {
  const result = await hmisApiRequestWithMeta<T>(path, options);
  return result.data;
}

export async function hmisApiRequestWithMeta<T>(
  path: string,
  options: HmisRequestOptions = {},
): Promise<HmisRequestResult<T>> {
  if (!HMIS_API_URL) {
    throw new HmisApiError(
      "HMIS_API_URL is not configured on the server.",
    );
  }

  const { method = "GET", body, token, headers = {} } = options;
  const requestId = createRequestId();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(`${HMIS_API_URL}${normalizePath(path)}`, {
      method,
      headers: {
        accept: "application/json",
        "X-Request-ID": requestId,
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache: "no-store",
    });

    if (response.status === 204) {
      return {
        data: undefined as T,
        meta: { request_id: requestId },
      };
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      if (!response.ok) {
        throw new HmisApiError(
          response.status >= 500
            ? "Something went wrong. Try again later."
            : "Request failed.",
          response.status,
        );
      }

      return {
        data: undefined as T,
        meta: { request_id: requestId },
      };
    }

    if (isV1Envelope<T>(payload)) {
      const envelope = payload as V1Envelope<T>;

      if (!response.ok || !envelope.success) {
        throw new HmisApiError(
          parseEnvelopeMessage(envelope),
          response.status,
          envelope.errors,
        );
      }

      return {
        data: envelope.data,
        meta: envelope.meta,
      };
    }

    if (!response.ok) {
      throw new HmisApiError(
        parseLegacyErrorMessage(payload),
        response.status,
      );
    }

    return {
      data: payload as T,
      meta: { request_id: requestId },
    };
  } catch (error) {
    if (error instanceof HmisApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new HmisApiError("Request timed out. Please try again.");
    }

    throw new HmisApiError("Something went wrong. Try again later.");
  } finally {
    clearTimeout(timeout);
  }
}

function parseEnvelopeMessage(envelope: V1Envelope<unknown>): string {
  if (envelope.errors.length > 0) {
    return envelope.errors.map((error) => error.message).join(" ");
  }

  return envelope.message || "Request failed.";
}

function parseLegacyErrorMessage(payload: unknown): string {
  if (typeof payload !== "object" || payload === null) {
    return "Request failed.";
  }

  const record = payload as Record<string, unknown>;

  if (typeof record.detail === "string") {
    return record.detail;
  }

  if (typeof record.message === "string") {
    return record.message;
  }

  return "Request failed.";
}
