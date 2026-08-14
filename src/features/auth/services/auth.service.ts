import { BFF_AUTH_ROUTES } from "@/constants/api";
import type {
  AuthVerifyResponse,
  OtpRequestResponse,
  SessionResponse,
  SigninChallengeResponse,
  SigninOtpRequest,
  SigninVerifyRequest,
  SignupOtpRequest,
  SignupVerifyEmailRequest,
  SignupVerifyEmailResponse,
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
): Promise<SigninChallengeResponse> {
  return bffRequest<SigninChallengeResponse>(BFF_AUTH_ROUTES.signinRequestOtp, {
    method: "POST",
    body: {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    },
  });
}

export async function sendSigninEmailOtp(payload: {
  pending_mfa_token: string;
}): Promise<{ detail: string }> {
  return bffRequest<{ detail: string }>(BFF_AUTH_ROUTES.signinEmailOtp, {
    method: "POST",
    body: payload,
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
      pending_mfa_token: payload.pending_mfa_token,
    },
  });
}

export async function verifySigninTotp(payload: {
  pending_mfa_token: string;
  code: string;
}): Promise<AuthVerifyResponse> {
  return bffRequest<AuthVerifyResponse>(BFF_AUTH_ROUTES.signinTotp, {
    method: "POST",
    body: payload,
  });
}

export async function verifySigninRecovery(payload: {
  pending_mfa_token: string;
  code: string;
}): Promise<AuthVerifyResponse> {
  return bffRequest<AuthVerifyResponse>(BFF_AUTH_ROUTES.signinRecovery, {
    method: "POST",
    body: payload,
  });
}

export async function requestSigninWebAuthnOptions(payload: {
  pending_mfa_token: string;
}): Promise<{ request_options: Record<string, unknown> }> {
  return bffRequest<{ request_options: Record<string, unknown> }>(
    BFF_AUTH_ROUTES.signinWebAuthnOptions,
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function verifySigninWebAuthn(payload: {
  pending_mfa_token: string;
  credential: Record<string, unknown>;
}): Promise<AuthVerifyResponse> {
  return bffRequest<AuthVerifyResponse>(BFF_AUTH_ROUTES.signinWebAuthnVerify, {
    method: "POST",
    body: payload,
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

export async function verifySignupEmail(
  payload: SignupVerifyEmailRequest,
): Promise<SignupVerifyEmailResponse> {
  return bffRequest<SignupVerifyEmailResponse>(BFF_AUTH_ROUTES.signupVerifyEmail, {
    method: "POST",
    body: {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      code: payload.code,
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
      verification_token: payload.verification_token,
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
