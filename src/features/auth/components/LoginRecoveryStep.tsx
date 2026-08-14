"use client";

import { Loader2, ShieldCheck } from "lucide-react";

import { StatusBanner } from "@/components/ui/status-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginRecoveryStepProps = {
  code: string;
  error?: string;
  disabled?: boolean;
  isSubmitting?: boolean;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export function LoginRecoveryStep({
  code,
  error,
  disabled,
  isSubmitting,
  onCodeChange,
  onSubmit,
  onBack,
}: LoginRecoveryStepProps) {
  return (
    <div
      className="w-full max-w-md rounded-2xl border-[1.5px] border-brand-border bg-white px-8 py-10 sm:px-10 sm:py-12"
      data-testid="login-recovery-form"
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand-tint text-brand-primary">
          <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <h1 className="font-[family-name:var(--font-bricolage)] text-2xl font-extrabold tracking-tight text-brand-navy">
          Recovery code
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-muted">
          Enter one of the 8-digit backup codes you saved when setting up 2FA.
        </p>
      </div>

      <div className="mt-8 space-y-2">
        {error ? <StatusBanner variant="error" message={error} /> : null}
        <Label htmlFor="login-recovery-code">Recovery code</Label>
        <Input
          id="login-recovery-code"
          data-testid="login-recovery"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={8}
          value={code}
          disabled={disabled || isSubmitting}
          onChange={(event) =>
            onCodeChange(event.target.value.replace(/\D/g, "").slice(0, 8))
          }
        />
      </div>

      <Button
        type="button"
        data-testid="login-recovery-submit"
        className="mt-8 h-12 w-full rounded-full bg-brand-primary text-white hover:bg-brand-primary-hover"
        disabled={isSubmitting || code.length !== 8}
        onClick={onSubmit}
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
