"use client";

import {
  forwardRef,
  useId,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const floatingFieldClassName =
  "h-14 rounded-xl border-slate-200 bg-white px-3.5 pt-5 pb-2 text-[15px] shadow-none transition-[box-shadow,border-color,border-width] placeholder:text-transparent focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary/20";

const floatingFieldErrorClassName =
  "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/20";

const floatingLabelClassName =
  "pointer-events-none absolute left-3.5 top-1/2 origin-left -translate-y-1/2 text-[15px] text-brand-muted transition-all duration-200 ease-out peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:font-medium peer-focus:tracking-[0.02em] peer-focus:text-brand-primary peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-medium peer-[:not(:placeholder-shown)]:tracking-[0.02em] peer-[:not(:placeholder-shown)]:text-brand-muted";

const floatingLabelErrorClassName =
  "text-red-600 peer-focus:text-red-600 peer-[:not(:placeholder-shown)]:text-red-600";

type FloatingLabelInputProps = ComponentProps<"input"> & {
  label: string;
  error?: string;
  hint?: ReactNode;
};

export const FloatingLabelInput = forwardRef<
  HTMLInputElement,
  FloatingLabelInputProps
>(function FloatingLabelInput(
  { label, error, hint, className, id, placeholder = " ", ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hasError = Boolean(error);

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Input
          id={inputId}
          ref={ref}
          placeholder={placeholder}
          aria-invalid={hasError}
          className={cn(
            "peer",
            floatingFieldClassName,
            hasError && floatingFieldErrorClassName,
            className,
          )}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            floatingLabelClassName,
            hasError && floatingLabelErrorClassName,
          )}
        >
          {label}
        </label>
      </div>
      {hint}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
});

type FloatingLabelPasswordInputProps = Omit<
  ComponentProps<"input">,
  "type" | "placeholder"
> & {
  label: string;
  error?: string;
  hint?: ReactNode;
};

export const FloatingLabelPasswordInput = forwardRef<
  HTMLInputElement,
  FloatingLabelPasswordInputProps
>(function FloatingLabelPasswordInput(
  { label, error, hint, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);
  const hasError = Boolean(error);

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Input
          id={inputId}
          ref={ref}
          type={visible ? "text" : "password"}
          placeholder=" "
          aria-invalid={hasError}
          className={cn(
            "peer pr-10",
            floatingFieldClassName,
            hasError && floatingFieldErrorClassName,
            className,
          )}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            floatingLabelClassName,
            hasError && floatingLabelErrorClassName,
          )}
        >
          {label}
        </label>
        <button
          type="button"
          tabIndex={-1}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-brand-muted transition-colors hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/25"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {hint}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
});

export { floatingFieldClassName };
