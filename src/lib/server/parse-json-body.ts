import type { NextResponse } from "next/server";
import type { z } from "zod";

import { bffSuccess } from "@/lib/server/bff-response";
import type { V1ApiError } from "@/types/api.types";

function formatZodErrors(error: z.ZodError): V1ApiError[] {
  return error.issues.map((issue) => ({
    code: issue.code,
    field: issue.path.length > 0 ? issue.path.join(".") : null,
    message: issue.message,
  }));
}

export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<{ data: T } | { error: NextResponse }> {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return {
      error: bffSuccess({ message: "Invalid JSON body." }, 400),
    };
  }

  const result = schema.safeParse(json);

  if (!result.success) {
    return {
      error: bffSuccess(
        {
          message: "Validation failed.",
          errors: formatZodErrors(result.error),
        },
        400,
      ),
    };
  }

  return { data: result.data };
}
