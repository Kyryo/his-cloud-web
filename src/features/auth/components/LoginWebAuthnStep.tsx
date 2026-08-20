"use client";

import { Loader2 } from "lucide-react";

import { StatusBanner } from "@/components/ui/status-banner";
import { Button } from "@/components/ui/button";

type LoginWebAuthnStepProps = {
  error?: string;
  isSubmitting?: boolean;
  onVerify: () => void;
  onBack: () => void;
};

export function LoginWebAuthnStep({
  error,
  isSubmitting,
  onVerify,
  onBack,
}: LoginWebAuthnStepProps) {
  return (
    <div className="w-full" data-testid="login-webauthn-form">
      <h2 className="font-[family-name:var(--font-bricolage)] text-[2rem] font-semibold tracking-[-0.02em] text-brand-navy sm:text-[2.25rem]">
        Security key
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-brand-muted">
        Use your passkey or hardware security key to finish signing in.
      </p>

      {error ? (
        <StatusBanner variant="error" message={error} className="mt-8" />
      ) : null}

      <Button
        type="button"
        data-testid="login-webauthn-submit"
        className="mt-8 h-12 w-full rounded-full bg-brand-primary text-white hover:bg-brand-primary-hover"
        disabled={isSubmitting}
        onClick={onVerify}
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Waiting for security key...
          </span>
        ) : (
          "Use security key"
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
