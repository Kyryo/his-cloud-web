import type { V1ApiError } from "@/types/api.types";

export function getFieldError(
  errors: V1ApiError[],
  field: string,
): string | undefined {
  return errors.find((error) => error.field === field)?.message;
}

export function getFirstErrorMessage(errors: V1ApiError[]): string | undefined {
  return errors[0]?.message;
}

export function mapBffErrorsToForm(
  errors: V1ApiError[],
): Record<string, string> {
  return errors.reduce<Record<string, string>>((acc, error) => {
    if (error.field && !acc[error.field]) {
      acc[error.field] = error.message;
    }
    return acc;
  }, {});
}

export function formatBffErrorMessage(
  message: string | unknown,
  errors: V1ApiError[] = [],
): string {
  if (errors.length > 0) {
    return errors.map((error) => error.message).join(" ");
  }

  if (typeof message === "string") {
    return message;
  }

  if (message instanceof Error && message.message.trim()) {
    return message.message;
  }

  return "Something went wrong.";
}
