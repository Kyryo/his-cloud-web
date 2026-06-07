"use client";

import { Loader2, Mail } from "lucide-react";
import { useCallback, useState } from "react";

import { VerificationCodeInput } from "@/components/verification-code";
import { useCountdown } from "@/components/verification-code/use-countdown";
import { Button } from "@/components/ui/button";
import { maskEmail } from "@/lib/mask-email";
import { cn } from "@/lib/utils";

const DEFAULT_EXPIRY_SECONDS = 300;
const DEFAULT_RESEND_DELAY_SECONDS = 60;
const EXPIRY_URGENT_THRESHOLD_SECONDS = 60;

type AuthOtpStepProps = {
  title: string;
  description: string;
  email: string;
  codeTestId: string;
  code: string;
  onCodeChange: (code: string) => void;
  onCodeComplete?: (code: string) => void;
  onResend?: () => Promise<void>;
  onBack?: () => void;
  error?: string;
  success?: boolean;
  disabled?: boolean;
  submitLabel: string;
  submittingLabel?: string;
  submitTestId: string;
  isSubmitting?: boolean;
  onSubmit: () => void;
  expirySeconds?: number;
  resendDelay?: number;
};

export function AuthOtpStep({
  title,
  description,
  email,
  codeTestId,
  code,
  onCodeChange,
  onCodeComplete,
  onResend,
  onBack,
  error,
  success,
  disabled,
  submitLabel,
  submittingLabel,
  submitTestId,
  isSubmitting = false,
  onSubmit,
  expirySeconds = DEFAULT_EXPIRY_SECONDS,
  resendDelay = DEFAULT_RESEND_DELAY_SECONDS,
}: AuthOtpStepProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const {
    formatted: expiryFormatted,
    isExpired: isExpiryExpired,
    secondsRemaining: expirySecondsRemaining,
    reset: resetExpiry,
  } = useCountdown({
    durationSeconds: expirySeconds,
    autoStart: true,
  });

  const {
    formatted: resendFormatted,
    isExpired: canResend,
    reset: resetResendCooldown,
  } = useCountdown({
    durationSeconds: resendDelay,
    autoStart: Boolean(onResend),
  });

  const isExpiryUrgent =
    !isExpiryExpired && expirySecondsRemaining <= EXPIRY_URGENT_THRESHOLD_SECONDS;

  const handleResend = useCallback(async () => {
    if (!onResend || isResending || !canResend) return;

    setIsResending(true);
    setResendMessage(null);

    try {
      await onResend();
      resetExpiry();
      resetResendCooldown();
      setResendMessage("A new code has been sent.");
    } catch (resendError) {
      setResendMessage(
        resendError instanceof Error
          ? resendError.message
          : "Could not resend the code. Please try again.",
      );
    } finally {
      setIsResending(false);
    }
  }, [canResend, isResending, onResend, resetExpiry, resetResendCooldown]);

  const displayError = error ?? validationError;

  function handleSubmitClick() {
    if (isSubmitting) return;

    if (isExpiryExpired) {
      setValidationError("This code has expired. Request a new one.");
      return;
    }

    if (code.length !== 6) {
      setValidationError("Enter the full 6-digit code.");
      return;
    }

    setValidationError(null);
    onSubmit();
  }

  function handleCodeChange(nextCode: string) {
    if (validationError) {
      setValidationError(null);
    }
    onCodeChange(nextCode);
  }

  return (
    <div className="w-full max-w-md rounded-2xl border-[1.5px] border-brand-border bg-white px-8 py-10 sm:px-10 sm:py-12">
      <div className="flex flex-col items-center text-center">
        <div
          className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand-tint text-brand-primary"
          aria-hidden="true"
        >
          <Mail className="h-5 w-5" strokeWidth={1.75} />
        </div>

        <h1 className="font-[family-name:var(--font-bricolage)] text-2xl font-extrabold tracking-tight text-brand-navy">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-muted">
          {description}
        </p>
        <p className="mt-1 text-sm font-medium text-brand-slate">
          {maskEmail(email)}
        </p>

        <p
          className={cn(
            "mt-4 text-sm tabular-nums",
            isExpiryExpired || isExpiryUrgent
              ? "font-medium text-destructive"
              : "text-brand-muted",
          )}
          aria-live="polite"
        >
          {isExpiryExpired ? "Code expired" : `Code expires in ${expiryFormatted}`}
        </p>
      </div>

      <div className="mt-8">
        <VerificationCodeInput
          data-testid={codeTestId}
          value={code}
          disabled={disabled || isResending || isExpiryExpired}
          error={displayError ?? undefined}
          success={success}
          onChange={handleCodeChange}
          onComplete={onCodeComplete}
        />
      </div>

      {resendMessage && (
        <p
          role="status"
          className={cn(
            "mt-4 text-center text-sm",
            resendMessage.includes("sent")
              ? "text-emerald-600"
              : "text-destructive",
          )}
        >
          {resendMessage}
        </p>
      )}

      <Button
        type="button"
        data-testid={submitTestId}
        aria-busy={isSubmitting}
        className="mt-8 h-12 w-full rounded-full bg-brand-primary text-white hover:bg-[#1254b8]"
        onClick={handleSubmitClick}
      >
        {isSubmitting ? (submittingLabel ?? `${submitLabel}...`) : submitLabel}
      </Button>

      {(onBack || onResend) && (
        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting || isResending}
              className="text-brand-muted transition-colors hover:text-brand-navy hover:underline disabled:opacity-50"
            >
              Back
            </button>
          )}

          {onResend && (
            isResending ? (
              <span className="inline-flex items-center gap-2 text-brand-muted">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                Sending...
              </span>
            ) : canResend ? (
              <button
                type="button"
                onClick={() => void handleResend()}
                disabled={isSubmitting}
                data-testid={`${codeTestId}-resend`}
                className="text-brand-muted transition-colors hover:text-brand-navy hover:underline disabled:opacity-50"
              >
                Resend code
              </button>
            ) : (
              <span className="tabular-nums text-brand-muted">
                Resend in {resendFormatted}
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
}
