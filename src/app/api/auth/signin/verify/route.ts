import { AUTH_API_PATHS } from "@/constants/auth-api";
import type {
  AuthSession,
  AuthVerifyResponse,
} from "@/features/auth/types/auth.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { persistSigninSession } from "@/lib/server/persist-signin-session";

type RequestBody = {
  email?: string;
  code?: string;
  pending_mfa_token?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    if (!body.email || !body.code || !body.pending_mfa_token) {
      return bffSuccess(
        {
          message:
            "Email, verification code, and sign-in session are required.",
        },
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
          pending_mfa_token: body.pending_mfa_token,
        },
      },
    );

    const response: AuthVerifyResponse = await persistSigninSession(session);
    return bffSuccess(response);
  } catch (error) {
    return bffError(error);
  }
}
