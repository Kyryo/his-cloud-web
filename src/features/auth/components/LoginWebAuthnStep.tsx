"use client";

import { KeyRound, Loader2 } from "lucide-react";

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
    <div
      className="w-full max-w-md rounded-2xl border-[1.5px] border-brand-border bg-white px-8 py-10 sm:px-10 sm:py-12"
      data-testid="login-webauthn-form"
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand-tint text-brand-primary">
          <KeyRound className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <h1 className="font-[family-name:var(--font-bricolage)] text-2xl font-extrabold tracking-tight text-brand-navy">
          Security key
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-muted">
          Use your passkey or hardware security key to finish signing in.
        </p>
      </div>

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
