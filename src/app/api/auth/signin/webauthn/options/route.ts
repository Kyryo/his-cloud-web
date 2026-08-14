import { AUTH_API_PATHS } from "@/constants/auth-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";

type RequestBody = {
  pending_mfa_token?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    if (!body.pending_mfa_token) {
      return bffSuccess({ message: "Sign-in session is required." }, 400);
    }

    const data = await hmisApiRequest<{ request_options: Record<string, unknown> }>(
      AUTH_API_PATHS.signinWebAuthnOptions,
      {
        method: "POST",
        body: { pending_mfa_token: body.pending_mfa_token },
      },
    );

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}
