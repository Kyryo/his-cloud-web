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
  password?: string;
  name?: string;
  clinic_name?: string;
  country?: string;
  code?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    if (
      !body.email ||
      !body.password ||
      !body.name ||
      !body.clinic_name ||
      !body.code
    ) {
      return bffSuccess(
        { message: "All required signup fields must be provided." },
        400,
      );
    }

    const session = await hmisApiRequest<AuthSession>(
      AUTH_API_PATHS.signupVerify,
      {
        method: "POST",
        body: {
          email: body.email.trim().toLowerCase(),
          password: body.password,
          name: body.name.trim(),
          clinic_name: body.clinic_name.trim(),
          country: body.country?.trim() || undefined,
          code: body.code,
        },
      },
    );

    await setAuthCookies(session.tokens);

    const response: AuthVerifyResponse = { user: session.user };
    return bffSuccess(response, 201);
  } catch (error) {
    return bffError(error);
  }
}
