"use client";

import { StatusBanner } from "@/components/ui/status-banner";
import { Button } from "@/components/ui/button";

type LoginWebAuthnStepProps = {
  error?: string;
  isSubmitting?: boolean;
  onVerify: () => void;
  onBack: () => void;
  onTryAnother?: () => void;
};

export function LoginWebAuthnStep({
  error,
  isSubmitting,
  onVerify,
  onBack,
  onTryAnother,
}: LoginWebAuthnStepProps) {
  return (
    <div className="w-full" data-testid="login-webauthn-form">
      <h2 className="font-[family-name:var(--font-bricolage)] text-[2rem] font-semibold tracking-[-0.02em] text-brand-navy sm:text-[2.25rem]">
        Security key
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-brand-muted">
        {isSubmitting
          ? "Complete the prompt in your browser or on the key."
          : "Use your passkey or hardware key to finish signing in."}
      </p>

      {error ? (
        <StatusBanner variant="error" message={error} className="mt-6" />
      ) : null}

      {isSubmitting ? (
        <p className="sr-only" role="status" aria-live="polite">
          Waiting for your key
        </p>
      ) : null}

      <Button
        type="button"
        data-testid="login-webauthn-submit"
        className="mt-8 h-12 w-full rounded-full bg-brand-primary text-white hover:bg-brand-primary-hover"
        disabled={isSubmitting}
        onClick={onVerify}
      >
        {isSubmitting ? "Waiting for your key..." : "Use security key"}
      </Button>

      {onTryAnother ? (
        <Button
          type="button"
          variant="outline"
          data-testid="login-try-another-method"
          disabled={isSubmitting}
          onClick={onTryAnother}
          className="mt-3 h-12 w-full rounded-full border-slate-300 bg-white text-brand-navy hover:bg-slate-50 hover:text-brand-navy"
        >
          Try another method
        </Button>
      ) : null}

      <div className="mt-6">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="text-sm font-medium text-brand-navy transition-colors hover:text-brand-primary disabled:opacity-50"
        >
          Back
        </button>
      </div>
    </div>
  );
}
