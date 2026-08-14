import { BFF_AUTH_ROUTES } from "@/constants/api";
import type {
  MfaStatus,
  RecoveryCodesResponse,
  TotpSetupResponse,
} from "@/features/settings/types/mfa.types";
import { bffRequest } from "@/lib/bff-client";

export async function fetchMfaStatus(): Promise<MfaStatus> {
  return bffRequest<MfaStatus>(BFF_AUTH_ROUTES.mfa);
}

export async function setupTotp(password: string): Promise<TotpSetupResponse> {
  return bffRequest<TotpSetupResponse>(BFF_AUTH_ROUTES.mfaTotpSetup, {
    method: "POST",
    body: { password },
  });
}

export async function activateTotp(payload: {
  password: string;
  code: string;
}): Promise<{ recovery_codes: string[] }> {
  return bffRequest<{ recovery_codes: string[] }>(BFF_AUTH_ROUTES.mfaTotpActivate, {
    method: "POST",
    body: payload,
  });
}

export async function deactivateTotp(password: string): Promise<{ detail: string }> {
  return bffRequest<{ detail: string }>(BFF_AUTH_ROUTES.mfaTotpDeactivate, {
    method: "POST",
    body: { password },
  });
}

export async function beginWebAuthnRegistration(payload: {
  password: string;
  name?: string;
}): Promise<{ creation_options: Record<string, unknown> }> {
  return bffRequest<{ creation_options: Record<string, unknown> }>(
    BFF_AUTH_ROUTES.mfaWebAuthnRegisterOptions,
    { method: "POST", body: payload },
  );
}

export async function completeWebAuthnRegistration(payload: {
  password: string;
  name?: string;
  credential: Record<string, unknown>;
}): Promise<{ id: number; name: string; recovery_codes: string[] }> {
  return bffRequest<{ id: number; name: string; recovery_codes: string[] }>(
    BFF_AUTH_ROUTES.mfaWebAuthnRegister,
    { method: "POST", body: payload },
  );
}

export async function renameWebAuthn(payload: {
  id: number;
  password: string;
  name: string;
}): Promise<{ id: number; name: string }> {
  return bffRequest<{ id: number; name: string }>(
    BFF_AUTH_ROUTES.mfaWebAuthnDetail(payload.id),
    {
      method: "PATCH",
      body: { password: payload.password, name: payload.name },
    },
  );
}

export async function removeWebAuthn(payload: {
  id: number;
  password: string;
}): Promise<{ detail: string }> {
  return bffRequest<{ detail: string }>(BFF_AUTH_ROUTES.mfaWebAuthnDetail(payload.id), {
    method: "DELETE",
    body: { password: payload.password },
  });
}

export async function revealRecoveryCodes(
  password: string,
): Promise<RecoveryCodesResponse> {
  return bffRequest<RecoveryCodesResponse>(BFF_AUTH_ROUTES.mfaRecoveryCodesReveal, {
    method: "POST",
    body: { password },
  });
}

export async function regenerateRecoveryCodes(
  password: string,
): Promise<RecoveryCodesResponse> {
  return bffRequest<RecoveryCodesResponse>(
    BFF_AUTH_ROUTES.mfaRecoveryCodesRegenerate,
    { method: "POST", body: { password } },
  );
}

export async function setPreferredMfaMethod(payload: {
  password: string;
  method: "email" | "totp" | "webauthn";
}): Promise<{ preferred_method: string }> {
  return bffRequest<{ preferred_method: string }>(BFF_AUTH_ROUTES.mfaPreferred, {
    method: "POST",
    body: payload,
  });
}
