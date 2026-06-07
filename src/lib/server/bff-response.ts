import { NextResponse } from "next/server";

import { HmisApiError } from "@/lib/server/hmis-api";

export function bffSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function bffError(error: unknown): NextResponse {
  if (error instanceof HmisApiError) {
    return NextResponse.json(
      {
        message: error.message,
        errors: error.errors,
      },
      { status: error.status ?? 400 },
    );
  }

  return NextResponse.json(
    { message: "Something went wrong. Try again later." },
    { status: 500 },
  );
}
