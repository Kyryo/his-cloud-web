type LandingSectionHeaderProps = {
  eyebrow: string;
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
  className = "",
}: LandingSectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div
      className={`max-w-3xl ${isCenter ? "mx-auto text-center" : ""} ${className}`.trim()}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-[family-name:var(--font-bricolage)] text-3xl font-extrabold tracking-[-0.03em] text-brand-navy sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 text-base leading-7 text-brand-muted sm:text-lg ${isCenter ? "mx-auto" : ""}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
