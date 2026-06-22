import { AUTH_API_PATHS } from "@/constants/auth-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";

type RequestBody = {
  email?: string;
  password?: string;
  code?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    if (!body.email || !body.password || !body.code) {
      return bffSuccess(
        { message: "Email, password, and verification code are required." },
        400,
      );
    }

    const data = await hmisApiRequest<{
      detail: string;
      verification_token: string;
    }>(AUTH_API_PATHS.signupVerifyEmail, {
      method: "POST",
      body: {
        email: body.email.trim().toLowerCase(),
        password: body.password,
        code: body.code,
      },
    });

    return bffSuccess(data, 200);
  } catch (error) {
    return bffError(error);
  }
}
