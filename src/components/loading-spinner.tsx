import { cn } from "@/lib/utils";

const GLYPH_SIZES = {
  xs: "h-4 w-4",
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-10 w-10",
  "2xl": "h-12 w-12",
} as const;

export type SpinnerGlyphSize = keyof typeof GLYPH_SIZES;

const LOADING_SPINNER_TO_GLYPH = {
  sm: "md",
  md: "lg",
  lg: "xl",
} as const satisfies Record<string, SpinnerGlyphSize>;

export type LoadingSpinnerSize = keyof typeof LOADING_SPINNER_TO_GLYPH;

export const DEFAULT_LOADING_SPINNER_SIZE: LoadingSpinnerSize = "md";

export const DEFAULT_SPINNER_GLYPH_SIZE: SpinnerGlyphSize = "md";

export function SpinnerGlyph({
  size = DEFAULT_SPINNER_GLYPH_SIZE,
  className,
  "aria-label": ariaLabel = "Loading",
}: {
  size?: SpinnerGlyphSize;
  className?: string;
  "aria-label"?: string;
}) {
  const dim = GLYPH_SIZES[size];

  return (
    <div
      className={cn(`${dim} relative shrink-0`, className)}
      role="status"
      aria-label={ariaLabel}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            dim,
            "animate-spin rounded-full border-2 border-brand-tint",
          )}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            dim,
            "animate-spin rounded-full border-2 border-transparent border-t-brand-primary",
          )}
          style={{ animationDuration: "0.8s" }}
        />
      </div>
    </div>
  );
}

type LoadingSpinnerProps = {
  message?: string;
  className?: string;
  size?: LoadingSpinnerSize;
  layout?: "horizontal" | "vertical";
};

export function LoadingSpinner({
  message = "Loading...",
  className,
  size = DEFAULT_LOADING_SPINNER_SIZE,
  layout = "horizontal",
}: LoadingSpinnerProps) {
  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  } as const;

  const layoutClasses =
    layout === "vertical" ? "flex-col space-y-3" : "flex-row space-x-3";

  const glyphSize = LOADING_SPINNER_TO_GLYPH[size];

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn("flex items-center", layoutClasses)}>
        <SpinnerGlyph size={glyphSize} />
        <span className={cn(textSizeClasses[size], "text-brand-muted")}>
          {message}
        </span>
      </div>
    </div>
  );
}
