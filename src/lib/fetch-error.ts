export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong.",
): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export function logFetchError(context: string, error: unknown): void {
  console.error(`[${context}]`, error);
}
