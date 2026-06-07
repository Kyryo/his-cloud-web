"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

import type { VerificationCodeInputProps } from "./types";
import { useOtpInput } from "./use-otp-input";

export function VerificationCodeInput({
  length = 6,
  disabled = false,
  autoFocus = true,
  error,
  success = false,
  label = "Verification code",
  id,
  "data-testid": dataTestId,
  className,
  value,
  onChange,
  onComplete,
}: VerificationCodeInputProps) {
  const generatedId = useId();
  const groupId = id ?? `verification-code-${generatedId}`;

  const {
    digits,
    focusedIndex,
    inputRefs,
    handleInput,
    handleKeyDown,
    handlePaste,
    handleFocus,
  } = useOtpInput({
    length,
    value,
    disabled,
    autoFocus,
    onChange,
    onComplete,
  });

  const hasError = Boolean(error);

  return (
    <div className={cn("w-full", className)} data-testid={dataTestId}>
      <div
        role="group"
        aria-labelledby={`${groupId}-label`}
        aria-describedby={
          hasError
            ? `${groupId}-error`
            : success
              ? `${groupId}-success`
              : undefined
        }
        className={cn(
          "flex justify-center gap-2 sm:gap-3",
          hasError && "animate-otp-shake",
        )}
        key={error ?? "valid"}
      >
        <span id={`${groupId}-label`} className="sr-only">
          {label}
        </span>

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
              data-testid={
                dataTestId ? `${dataTestId}-digit-${index}` : `${groupId}-digit-${index}`
              }
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              aria-label={`${label} digit ${index + 1} of ${length}`}
              aria-invalid={hasError}
              maxLength={1}
              value={digit}
              disabled={disabled}
              className={cn(
                "h-12 w-11 max-w-[3rem] flex-1 rounded-md border-[1.5px] bg-white text-center text-lg font-medium tabular-nums text-brand-navy",
                "transition-[border-color,box-shadow,background-color] duration-150",
                "focus-visible:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-50",
                !hasError &&
                  !success &&
                  !isFocused &&
                  !isFilled &&
                  "border-brand-border",
                !hasError &&
                  !success &&
                  isFilled &&
                  !isFocused &&
                  "border-brand-slate/40 bg-brand-tint",
                !hasError &&
                  !success &&
                  isFocused &&
                  "border-brand-primary ring-2 ring-brand-primary/15",
                hasError &&
                  "border-destructive text-destructive ring-2 ring-destructive/10",
                success &&
                  !hasError &&
                  "border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/10",
              )}
              onChange={(event) => handleInput(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={(event) => handlePaste(index, event)}
              onFocus={() => handleFocus(index)}
            />
          );
        })}
      </div>

      {hasError && (
        <p
          id={`${groupId}-error`}
          role="alert"
          className="mt-4 text-center text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}

      {success && !hasError && (
        <p
          id={`${groupId}-success`}
          role="status"
          className="mt-4 text-center text-sm text-emerald-600 dark:text-emerald-400"
        >
          Code verified successfully.
        </p>
      )}
    </div>
  );
}
