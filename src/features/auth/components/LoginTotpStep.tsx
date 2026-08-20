"use client";

import { Loader2 } from "lucide-react";
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
    <div className="w-full" data-testid="login-totp-form">
      <h2 className="font-[family-name:var(--font-bricolage)] text-[2rem] font-semibold tracking-[-0.02em] text-brand-navy sm:text-[2.25rem]">
        Authenticator app
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-brand-muted">
        Enter the 6-digit code from your authenticator app.
      </p>

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
      <div className="mt-6">
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
