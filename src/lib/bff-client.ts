import type { V1ApiError } from "@/types/api.types";

const BFF_TIMEOUT_MS = 30_000;

export class BffError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly errors: V1ApiError[] = [],
  ) {
    super(message);
    this.name = "BffError";
  }
}

type BffRequestOptions = {
  method?: string;
  body?: unknown;
};

export async function bffRequest<T>(
  path: string,
  options: BffRequestOptions = {},
): Promise<T> {
  const { method = "GET", body } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BFF_TIMEOUT_MS);

  try {
    const response = await fetch(path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
      signal: controller.signal,
      cache: "no-store",
    });

    if (response.status === 204) {
      return undefined as T;
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      if (!response.ok) {
        throw new BffError(
          response.status >= 500
            ? "Something went wrong. Try again later."
            : "Request failed.",
          response.status,
        );
      }
      return undefined as T;
    }

    if (!response.ok) {
      const record = payload as { message?: string; errors?: V1ApiError[] };
      throw new BffError(
        record.message ?? "Request failed.",
        response.status,
        record.errors ?? [],
      );
    }

    return payload as T;
  } catch (error) {
    if (error instanceof BffError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new BffError("Request timed out. Please try again.");
    }

    throw new BffError("Something went wrong. Try again later.");
  } finally {
    clearTimeout(timeout);
  }
}
