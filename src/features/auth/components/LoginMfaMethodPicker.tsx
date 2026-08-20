"use client";

import type { MfaSigninMethod } from "@/features/auth/types/auth.types";

const METHOD_COPY: Record<
  Exclude<MfaSigninMethod, "email">,
  { label: string; description: string }
> = {
  totp: {
    label: "Authenticator app",
    description: "Use a 6-digit code from your authenticator app.",
  },
  webauthn: {
    label: "Security key",
    description: "Use a passkey or hardware security key.",
  },
  recovery_codes: {
    label: "Recovery code",
    description: "Use a one-time backup code from when you set up 2FA.",
  },
};

type LoginMfaMethodPickerProps = {
  methods: MfaSigninMethod[];
  currentMethod: MfaSigninMethod;
  onSelect: (method: MfaSigninMethod) => void;
  onBack: () => void;
  disabled?: boolean;
};

export function LoginMfaMethodPicker({
  methods,
  currentMethod,
  onSelect,
  onBack,
  disabled,
}: LoginMfaMethodPickerProps) {
  const options = methods.filter((method) => method !== currentMethod);

  return (
    <div className="w-full" data-testid="login-mfa-methods">
      <h2 className="font-[family-name:var(--font-bricolage)] text-[2rem] font-semibold tracking-[-0.02em] text-brand-navy sm:text-[2.25rem]">
        Try another method
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-brand-muted">
        Choose how you want to verify this sign-in.
      </p>
      <ul className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
        {options.map((method) => {
          if (method === "email") {
            return (
              <li key={method}>
                <button
                  type="button"
                  data-testid="login-mfa-method-email"
                  disabled={disabled}
                  onClick={() => onSelect("email")}
                  className="flex w-full items-start py-4 text-left transition-colors hover:text-brand-primary disabled:opacity-50"
                >
                  <span>
                    <span className="block text-[15px] font-medium text-brand-navy">
                      Email code
                    </span>
                    <span className="mt-0.5 block text-sm text-brand-muted">
                      Use the verification code sent to your email.
                    </span>
                  </span>
                </button>
              </li>
            );
          }

          const copy = METHOD_COPY[method];
          return (
            <li key={method}>
              <button
                type="button"
                data-testid={`login-mfa-method-${method}`}
                disabled={disabled}
                onClick={() => onSelect(method)}
                className="flex w-full items-start py-4 text-left transition-colors hover:text-brand-primary disabled:opacity-50"
              >
                <span>
                  <span className="block text-[15px] font-medium text-brand-navy">
                    {copy.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-brand-muted">
                    {copy.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-6">
        <button
          type="button"
          onClick={onBack}
          disabled={disabled}
          className="text-sm text-brand-muted transition-colors hover:text-brand-navy hover:underline disabled:opacity-50"
        >
          Back
        </button>
      </div>
    </div>
  );
}

export function hasAlternateMfaMethods(methods: MfaSigninMethod[]): boolean {
  return methods.some((method) => method !== "email");
}
