type LandingSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  inverted?: boolean;
  accent?: "teal" | "green";
};

export function LandingSectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
  inverted = false,
  accent = "teal",
}: LandingSectionHeaderProps) {
  const isCenter = align === "center";
  const accentClass =
    accent === "green"
      ? "text-[color:var(--landing-green)]"
      : "text-[color:var(--landing-teal)]";

  return (
    <div
      className={`max-w-3xl ${isCenter ? "mx-auto text-center" : ""} ${className}`.trim()}
    >
      {eyebrow ? (
        <p
          className={`landing-body text-[11px] font-semibold uppercase tracking-[0.14em] ${
            inverted ? "text-white/70" : accentClass
          }`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`landing-display text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold ${
          eyebrow ? "mt-3" : ""
        } ${inverted ? "!text-white" : ""}`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`landing-body mt-4 text-base leading-relaxed sm:text-lg ${
            inverted ? "text-white/75" : "text-[color:var(--landing-ledger-ink)]"
          } ${isCenter ? "mx-auto" : ""}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
