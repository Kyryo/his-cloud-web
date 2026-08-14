"use client";

import { KeyRound, ShieldCheck, Smartphone } from "lucide-react";

import type { MfaSigninMethod } from "@/features/auth/types/auth.types";

const METHOD_COPY: Record<
  Exclude<MfaSigninMethod, "email">,
  { label: string; description: string; icon: typeof Smartphone }
> = {
  totp: {
    label: "Authenticator app",
    description: "Use a 6-digit code from your authenticator app.",
    icon: Smartphone,
  },
  webauthn: {
    label: "Security key",
    description: "Use a passkey or hardware security key.",
    icon: KeyRound,
  },
  recovery_codes: {
    label: "Recovery code",
    description: "Use a one-time backup code from when you set up 2FA.",
    icon: ShieldCheck,
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
    <div
      className="w-full max-w-md rounded-2xl border-[1.5px] border-brand-border bg-white px-8 py-10 sm:px-10 sm:py-12"
      data-testid="login-mfa-methods"
    >
      <h1 className="text-center font-[family-name:var(--font-bricolage)] text-2xl font-extrabold tracking-tight text-brand-navy">
        Try another method
      </h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-brand-muted">
        Choose how you want to verify this sign-in.
      </p>
      <ul className="mt-8 space-y-3">
        {options.map((method) => {
          if (method === "email") {
            return (
              <li key={method}>
                <button
                  type="button"
                  data-testid="login-mfa-method-email"
                  disabled={disabled}
                  onClick={() => onSelect("email")}
                  className="flex w-full items-start gap-3 rounded-xl border border-brand-border px-4 py-3 text-left transition-colors hover:bg-brand-tint disabled:opacity-50"
                >
                  <span className="mt-0.5 text-brand-primary" aria-hidden="true">
                    @
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-brand-navy">
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
          const Icon = copy.icon;
          return (
            <li key={method}>
              <button
                type="button"
                data-testid={`login-mfa-method-${method}`}
                disabled={disabled}
                onClick={() => onSelect(method)}
                className="flex w-full items-start gap-3 rounded-xl border border-brand-border px-4 py-3 text-left transition-colors hover:bg-brand-tint disabled:opacity-50"
              >
                <Icon className="mt-0.5 h-5 w-5 text-brand-primary" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-medium text-brand-navy">
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
      <div className="mt-6 text-center">
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
