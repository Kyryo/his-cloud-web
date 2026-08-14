import { AUTH_API_PATHS } from "@/constants/auth-api";
import type {
  AuthSession,
  AuthVerifyResponse,
} from "@/features/auth/types/auth.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { persistSigninSession } from "@/lib/server/persist-signin-session";

type RequestBody = {
  pending_mfa_token?: string;
  code?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    if (!body.pending_mfa_token || !body.code) {
      return bffSuccess(
        { message: "Sign-in session and authenticator code are required." },
        400,
      );
    }

    const session = await hmisApiRequest<AuthSession>(AUTH_API_PATHS.signinTotp, {
      method: "POST",
      body: {
        pending_mfa_token: body.pending_mfa_token,
        code: body.code,
      },
    });

    const response: AuthVerifyResponse = await persistSigninSession(session);
    return bffSuccess(response);
  } catch (error) {
    return bffError(error);
  }
}
