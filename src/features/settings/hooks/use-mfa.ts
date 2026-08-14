import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  activateTotp,
  beginWebAuthnRegistration,
  completeWebAuthnRegistration,
  deactivateTotp,
  fetchMfaStatus,
  regenerateRecoveryCodes,
  removeWebAuthn,
  renameWebAuthn,
  revealRecoveryCodes,
  setupTotp,
} from "@/features/settings/services/mfa.service";

export const MFA_STATUS_QUERY_KEY = ["account-mfa"] as const;

export function useMfaStatus() {
  return useQuery({
    queryKey: MFA_STATUS_QUERY_KEY,
    queryFn: fetchMfaStatus,
  });
}

export function useInvalidateMfaStatus() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: MFA_STATUS_QUERY_KEY });
}

export function useSetupTotp() {
  return useMutation({ mutationFn: setupTotp });
}

export function useActivateTotp() {
  const invalidate = useInvalidateMfaStatus();
  return useMutation({
    mutationFn: activateTotp,
    onSuccess: () => {
      void invalidate();
    },
  });
}

export function useDeactivateTotp() {
  const invalidate = useInvalidateMfaStatus();
  return useMutation({
    mutationFn: deactivateTotp,
    onSuccess: () => {
      void invalidate();
    },
  });
}

export function useBeginWebAuthnRegistration() {
  return useMutation({ mutationFn: beginWebAuthnRegistration });
}

export function useCompleteWebAuthnRegistration() {
  const invalidate = useInvalidateMfaStatus();
  return useMutation({
    mutationFn: completeWebAuthnRegistration,
    onSuccess: () => {
      void invalidate();
    },
  });
}

export function useRenameWebAuthn() {
  const invalidate = useInvalidateMfaStatus();
  return useMutation({
    mutationFn: renameWebAuthn,
    onSuccess: () => {
      void invalidate();
    },
  });
}

export function useRemoveWebAuthn() {
  const invalidate = useInvalidateMfaStatus();
  return useMutation({
    mutationFn: removeWebAuthn,
    onSuccess: () => {
      void invalidate();
    },
  });
}

export function useRevealRecoveryCodes() {
  return useMutation({ mutationFn: revealRecoveryCodes });
}

export function useRegenerateRecoveryCodes() {
  const invalidate = useInvalidateMfaStatus();
  return useMutation({
    mutationFn: regenerateRecoveryCodes,
    onSuccess: () => {
      void invalidate();
    },
  });
}
