import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";

const API_FIELD_TO_FORM: Record<string, string> = {
  title: "title",
  slug: "slug",
  excerpt: "excerpt",
  main_image_url: "mainImageUrl",
  canonical_url: "canonicalUrl",
  social_image_url: "socialImageUrl",
};

/**
 * Puts API field errors on the matching inputs and returns a message for anything else.
 * Returns null when every error was attached to a field.
 */
export function applyBlogSaveError<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>): string | null {
  if (!(error instanceof BffError)) {
    return error instanceof Error ? error.message : "Something went wrong.";
  }
  const fieldErrors = mapBffErrorsToForm(error.errors);
  let unmatched = false;
  for (const [apiField, message] of Object.entries(fieldErrors)) {
    const formField = API_FIELD_TO_FORM[apiField];
    if (formField) {
      setError(formField as Path<T>, { type: "server", message });
    } else {
      unmatched = true;
    }
  }
  if (Object.keys(fieldErrors).length > 0 && !unmatched) {
    return null;
  }
  return formatBffErrorMessage(error.message, error.errors);
}
