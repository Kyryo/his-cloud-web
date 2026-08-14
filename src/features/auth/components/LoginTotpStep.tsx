"use client";

import { Loader2, Smartphone } from "lucide-react";
import { useState } from "react";

import { VerificationCodeInput } from "@/components/verification-code";
import { StatusBanner } from "@/components/ui/status-banner";
import { Button } from "@/components/ui/button";

type LoginTotpStepProps = {
  code: string;
  error?: string;
  disabled?: boolean;
  isSubmitting?: boolean;
  onCodeChange: (code: string) => void;
  onCodeComplete: (code: string) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export function LoginTotpStep({
  code,
  error,
  disabled,
  isSubmitting,
  onCodeChange,
  onCodeComplete,
  onSubmit,
  onBack,
}: LoginTotpStepProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const displayError = error ?? validationError;

  function handleSubmit() {
    if (isSubmitting) return;
    if (code.length !== 6) {
      setValidationError("Enter the full 6-digit code.");
      return;
    }
    setValidationError(null);
    onSubmit();
  }

  return (
    <div
      className="w-full max-w-md rounded-2xl border-[1.5px] border-brand-border bg-white px-8 py-10 sm:px-10 sm:py-12"
      data-testid="login-totp-form"
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand-tint text-brand-primary">
          <Smartphone className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <h1 className="font-[family-name:var(--font-bricolage)] text-2xl font-extrabold tracking-tight text-brand-navy">
          Authenticator app
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-muted">
          Enter the 6-digit code from your authenticator app.
        </p>
      </div>

      <div className="mt-8">
        {displayError ? (
          <StatusBanner variant="error" message={displayError} className="mb-4" />
        ) : null}
        <VerificationCodeInput
          data-testid="login-totp"
          value={code}
          disabled={disabled || isSubmitting}
          onChange={(next) => {
            setValidationError(null);
            onCodeChange(next);
          }}
          onComplete={onCodeComplete}
        />
      </div>

      <Button
        type="button"
        data-testid="login-totp-submit"
        className="mt-8 h-12 w-full rounded-full bg-brand-primary text-white hover:bg-brand-primary-hover"
        onClick={handleSubmit}
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Signing in...
          </span>
        ) : (
          "Sign in"
        )}
      </Button>
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="text-sm text-brand-muted transition-colors hover:text-brand-navy hover:underline disabled:opacity-50"
        >
          Back
        </button>
      </div>
    </div>
  );
}
