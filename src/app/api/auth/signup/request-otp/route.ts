import { AUTH_API_PATHS } from "@/constants/auth-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import type { OtpRequestResponse } from "@/features/auth/types/auth.types";

type RequestBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    if (!body.email || !body.password) {
      return bffSuccess(
        { message: "Email and password are required." },
        400,
      );
    }

    const data = await hmisApiRequest<OtpRequestResponse>(
      AUTH_API_PATHS.signupRequestOtp,
      {
        method: "POST",
        body: {
          email: body.email.trim().toLowerCase(),
          password: body.password,
        },
      },
    );

    return bffSuccess(data, 202);
  } catch (error) {
    return bffError(error);
  }
}
