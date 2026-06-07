import { BFF_AUTH_ROUTES } from "@/constants/api";
import type {
  AuthVerifyResponse,
  OtpRequestResponse,
  SessionResponse,
  SigninOtpRequest,
  SigninVerifyRequest,
  SignupOtpRequest,
  SignupVerifyRequest,
  User,
} from "@/features/auth/types/auth.types";
import { bffRequest } from "@/lib/bff-client";

export async function checkSession(): Promise<SessionResponse> {
  return bffRequest<SessionResponse>(BFF_AUTH_ROUTES.session);
}

export async function isAccessTokenValid(): Promise<boolean> {
  const session = await checkSession();
  return session.authenticated;
}

export async function requestSigninOtp(
  payload: SigninOtpRequest,
): Promise<OtpRequestResponse> {
  return bffRequest<OtpRequestResponse>(BFF_AUTH_ROUTES.signinRequestOtp, {
    method: "POST",
    body: {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    },
  });
}

export async function verifySignin(
  payload: SigninVerifyRequest,
): Promise<AuthVerifyResponse> {
  return bffRequest<AuthVerifyResponse>(BFF_AUTH_ROUTES.signinVerify, {
    method: "POST",
    body: {
      email: payload.email.trim().toLowerCase(),
      code: payload.code,
    },
  });
}

export async function requestSignupOtp(
  payload: SignupOtpRequest,
): Promise<OtpRequestResponse> {
  return bffRequest<OtpRequestResponse>(BFF_AUTH_ROUTES.signupRequestOtp, {
    method: "POST",
    body: {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    },
  });
}

export async function verifySignup(
  payload: SignupVerifyRequest,
): Promise<AuthVerifyResponse> {
  return bffRequest<AuthVerifyResponse>(BFF_AUTH_ROUTES.signupVerify, {
    method: "POST",
    body: {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      name: payload.name.trim(),
      clinic_name: payload.clinic_name.trim(),
      country: payload.country?.trim() || undefined,
      code: payload.code,
    },
  });
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const data = await bffRequest<{ user: User }>(BFF_AUTH_ROUTES.me);
    return data.user;
  } catch {
    return null;
  }
}

export async function refreshAccessToken(): Promise<boolean> {
  try {
    await bffRequest<{ ok: boolean }>(BFF_AUTH_ROUTES.refresh, {
      method: "POST",
    });
    return true;
  } catch {
    return false;
  }
}

export async function logout(): Promise<void> {
  try {
    await bffRequest<{ ok: boolean }>(BFF_AUTH_ROUTES.logout, {
      method: "POST",
    });
  } finally {
    await bffRequest(BFF_AUTH_ROUTES.session, { method: "DELETE" });
    if (typeof window !== "undefined") {
      window.location.href = "/auth";
    }
  }
}

export function markAuthenticatedSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("cameFromLogin", "true");
}
