export type MfaStatus = {
  email: { enabled: boolean };
  totp: {
    enabled: boolean;
    created_at: string | null;
    last_used_at: string | null;
  };
  webauthn: Array<{
    id: number;
    name: string;
    created_at: string;
    last_used_at: string | null;
  }>;
  recovery_codes: {
    enabled: boolean;
    unused_count: number;
    total_count: number;
  };
};

export type TotpSetupResponse = {
  secret: string;
  otpauth_url: string;
  qr_svg: string;
};

export type RecoveryCodesResponse = {
  unused_codes: string[];
};
