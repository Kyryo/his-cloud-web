import { cn } from "@/lib/utils";

type LandingSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function LandingSectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: LandingSectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div
      className={cn(
        "max-w-3xl",
        isCenter && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className="landing-body text-[13px] font-medium text-[color:var(--landing-teal)]">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "landing-display whitespace-pre-line text-[clamp(1.85rem,3.4vw,2.75rem)] font-semibold tracking-[-0.04em]",
          eyebrow && "mt-3",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "landing-body mt-5 max-w-[42rem] text-[1.05rem] leading-[1.7] text-[color:var(--landing-ledger-ink)]",
            isCenter && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
