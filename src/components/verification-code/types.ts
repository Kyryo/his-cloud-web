export interface VerificationCodeInputProps {
  /** Number of digits. Defaults to 6. */
  length?: number;
  /** Resend cooldown in seconds. Defaults to 60. */
  resendDelay?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  error?: string;
  success?: boolean;
  /** Accessible label prefix for digit inputs. */
  label?: string;
  id?: string;
  "data-testid"?: string;
  className?: string;
  /** Controlled value — resets digit inputs when changed externally. */
  value?: string;
  onChange?: (code: string) => void;
  onComplete?: (code: string) => void;
  onResend?: () => Promise<void>;
}

export type VerificationToast = {
  type: "success" | "error";
  message: string;
} | null;
