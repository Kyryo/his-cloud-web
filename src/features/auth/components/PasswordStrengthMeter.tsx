"use client";

import { cn } from "@/lib/utils";

export type PasswordStrength = "empty" | "weak" | "fair" | "good" | "strong";

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return "empty";

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return "weak";
  if (score === 2) return "fair";
  if (score === 3) return "good";
  return "strong";
}

const STRENGTH_META: Record<
  Exclude<PasswordStrength, "empty">,
  { label: string; bars: number; barClass: string; labelClass: string }
> = {
  weak: {
    label: "Weak",
    bars: 1,
    barClass: "bg-red-500",
    labelClass: "text-red-700",
  },
  fair: {
    label: "Fair",
    bars: 2,
    barClass: "bg-amber-500",
    labelClass: "text-amber-800",
  },
  good: {
    label: "Good",
    bars: 3,
    barClass: "bg-brand-primary",
    labelClass: "text-brand-primary",
  },
  strong: {
    label: "Strong",
    bars: 4,
    barClass: "bg-emerald-600",
    labelClass: "text-emerald-700",
  },
};

type PasswordStrengthMeterProps = {
  password: string;
  className?: string;
};

export function PasswordStrengthMeter({
  password,
  className,
}: PasswordStrengthMeterProps) {
  const strength = getPasswordStrength(password);

  if (strength === "empty") {
    return (
      <p className={cn("mt-1.5 text-xs text-brand-muted", className)}>
        Use at least 8 characters. A longer passphrase is stronger.
      </p>
    );
  }

  const meta = STRENGTH_META[strength];

  return (
    <div className={cn("mt-2 space-y-1.5", className)} data-testid="password-strength-meter">
      <div className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <span
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-200",
              index < meta.bars ? meta.barClass : "bg-brand-border",
            )}
          />
        ))}
      </div>
      <p className={cn("text-xs font-medium", meta.labelClass)} aria-live="polite">
        Password strength: {meta.label}
      </p>
    </div>
  );
}
