import { AUTH_API_PATHS } from "@/constants/auth-api";
import type {
  AuthSession,
  AuthVerifyResponse,
} from "@/features/auth/types/auth.types";
import { setAuthCookies } from "@/lib/server/auth-cookies";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";

type RequestBody = {
  email?: string;
  code?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    if (!body.email || !body.code) {
      return bffSuccess(
        { message: "Email and verification code are required." },
        400,
      );
    }

    const session = await hmisApiRequest<AuthSession>(
      AUTH_API_PATHS.signinVerify,
      {
        method: "POST",
        body: {
          email: body.email.trim().toLowerCase(),
          code: body.code,
        },
      },
    );

    await setAuthCookies(session.tokens);

    const response: AuthVerifyResponse = { user: session.user };
    return bffSuccess(response);
  } catch (error) {
    return bffError(error);
  }
}
