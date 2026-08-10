"use client";

import { Loader2, Mail } from "lucide-react";
import { useCallback, useId, useState } from "react";

import { useCountdown } from "@/components/verification-code/use-countdown";
import { useOtpInput } from "@/components/verification-code/use-otp-input";
import { maskEmail } from "@/lib/mask-email";
import { cn } from "@/lib/utils";

const CODE_LENGTH = 6;
const DEFAULT_EXPIRY_SECONDS = 300;
const DEFAULT_RESEND_DELAY_SECONDS = 60;
const EXPIRY_URGENT_THRESHOLD_SECONDS = 60;

type SignupEmailConfirmStepProps = {
  email: string;
  code: string;
  onCodeChange: (code: string) => void;
  onCodeComplete?: (code: string) => void;
  onResend: () => Promise<void>;
  error?: string;
  disabled?: boolean;
  isSubmitting?: boolean;
  codeTestId?: string;
  expirySeconds?: number;
  resendDelay?: number;
};

/**
 * Signup-wizard email confirmation — designed for AuthWizardShell, not a
 * bolted-on generic OTP card. Left-aligned, shares field language with step 1.
 */
export function SignupEmailConfirmStep({
  email,
  code,
  onCodeChange,
  onCodeComplete,
  onResend,
  error,
  disabled = false,
  isSubmitting = false,
  codeTestId = "signup-otp",
  expirySeconds = DEFAULT_EXPIRY_SECONDS,
  resendDelay = DEFAULT_RESEND_DELAY_SECONDS,
}: SignupEmailConfirmStepProps) {
  const groupId = useId();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

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
    autoStart: true,
  });

  const {
    digits,
    focusedIndex,
    inputRefs,
    handleInput,
    handleKeyDown,
    handlePaste,
    handleFocus,
  } = useOtpInput({
    length: CODE_LENGTH,
    value: code,
    disabled: disabled || isResending || isExpiryExpired,
    autoFocus: true,
    onChange: (next) => {
      if (localError) setLocalError(null);
      onCodeChange(next);
    },
    onComplete: onCodeComplete,
  });

  const isExpiryUrgent =
    !isExpiryExpired && expirySecondsRemaining <= EXPIRY_URGENT_THRESHOLD_SECONDS;
  const displayError = error ?? localError;
  const masked = maskEmail(email);

  const handleResend = useCallback(async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    setResendMessage(null);
    setLocalError(null);

    try {
      await onResend();
      resetExpiry();
      resetResendCooldown();
      setResendMessage("New code sent — check your inbox.");
    } catch (resendError) {
      setResendMessage(
        resendError instanceof Error
          ? resendError.message
          : "Could not resend the code. Try again.",
      );
    } finally {
      setIsResending(false);
    }
  }, [canResend, isResending, onResend, resetExpiry, resetResendCooldown]);

  return (
    <div className="flex flex-1 flex-col" data-testid="signup-otp-form">
      {/* Destination — the one distinctive focus of this step */}
      <div
        className="inline-flex max-w-full items-center gap-2.5 self-start rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5"
        title={email}
      >
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-primary shadow-[0_0_0_1px_rgba(15,23,42,0.06)]"
          aria-hidden="true"
        >
          <Mail className="size-3.5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-brand-muted">
            Code sent to
          </p>
          <p className="truncate text-sm font-semibold tracking-tight text-brand-navy">
            {masked}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <p
          id={`${groupId}-label`}
          className="mb-3 text-[13px] font-medium text-brand-navy"
        >
          Verification code
        </p>

        <div
          role="group"
          aria-labelledby={`${groupId}-label`}
          aria-describedby={
            displayError
              ? `${groupId}-error`
              : `${groupId}-expiry`
          }
          data-testid={codeTestId}
          className={cn(
            "grid grid-cols-6 gap-2 sm:gap-2.5",
            displayError && "animate-otp-shake",
          )}
          key={displayError ?? "valid"}
        >
          {digits.map((digit, index) => {
            const isFilled = digit !== "";
            const isFocused = focusedIndex === index;

            return (
              <input
                key={`${groupId}-digit-${index}`}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                id={`${groupId}-digit-${index}`}
                data-testid={`${codeTestId}-digit-${index}`}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
                aria-invalid={Boolean(displayError)}
                maxLength={1}
                value={digit}
                disabled={disabled || isResending || isExpiryExpired || isSubmitting}
                className={cn(
                  "h-12 w-full min-w-0 rounded-xl border bg-white text-center font-[family-name:var(--font-bricolage)] text-xl font-semibold tabular-nums text-brand-navy",
                  "transition-[border-color,box-shadow,background-color] duration-150",
                  "focus-visible:outline-none",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  !displayError &&
                    !isFocused &&
                    !isFilled &&
                    "border-slate-200",
                  !displayError &&
                    isFilled &&
                    !isFocused &&
                    "border-brand-primary/30 bg-[color:color-mix(in_srgb,var(--color-brand-tint)_55%,white)]",
                  !displayError &&
                    isFocused &&
                    "border-brand-primary shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-brand-primary)_16%,transparent)]",
                  displayError &&
                    "border-destructive text-destructive shadow-[0_0_0_3px_rgba(220,38,38,0.08)]",
                )}
                onChange={(event) => handleInput(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={(event) => handlePaste(index, event)}
                onFocus={() => handleFocus(index)}
              />
            );
          })}
        </div>

        {displayError ? (
          <p
            id={`${groupId}-error`}
            role="alert"
            className="mt-3 text-sm text-destructive"
          >
            {displayError}
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p
          id={`${groupId}-expiry`}
          className={cn(
            "text-sm tabular-nums",
            isExpiryExpired || isExpiryUrgent
              ? "font-medium text-destructive"
              : "text-brand-muted",
          )}
          aria-live="polite"
        >
          {isExpiryExpired
            ? "Code expired — request a new one"
            : `Expires in ${expiryFormatted}`}
        </p>

        {isResending ? (
          <span className="inline-flex items-center gap-2 text-sm text-brand-muted">
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            Sending…
          </span>
        ) : canResend ? (
          <button
            type="button"
            onClick={() => void handleResend()}
            disabled={disabled || isSubmitting}
            data-testid={`${codeTestId}-resend`}
            className="text-sm font-medium text-brand-primary transition-colors hover:text-brand-primary-hover disabled:opacity-50"
          >
            Resend code
          </button>
        ) : (
          <span className="text-sm tabular-nums text-brand-muted">
            Resend in {resendFormatted}
          </span>
        )}
      </div>

      {resendMessage ? (
        <p
          role="status"
          className={cn(
            "mt-4 text-sm",
            resendMessage.toLowerCase().includes("sent")
              ? "text-emerald-700"
              : "text-destructive",
          )}
        >
          {resendMessage}
        </p>
      ) : null}
    </div>
  );
}
