/** Landing-page palette — warm clinic grounds + teal/green accents from design plan. */
export const LANDING = {
  paperClay: "#F3EBE0",
  warmWhite: "#FDF6EE",
  inkRoot: "#1F2A24",
  ledgerInk: "#5A4D42",
  signalAmber: "#B86A1F",
  signalAmberTint: "#FDF0E4",
  liveTeal: "#0B6E6E",
  liveTealHover: "#095656",
  liveTealTint: "#E6F2F2",
  matureGreen: "#2F5E46",
  matureGreenTint: "#EAF2ED",
  shadow: "0 8px 24px rgba(31, 42, 36, 0.06)",
  shadowHover: "0 12px 32px rgba(31, 42, 36, 0.1)",
  cardRadius: "14px",
  iconRadius: "10px",
} as const;

export const LANDING_PROOF_STATS = [
  { value: "200+", label: "Active clinics" },
  { value: "14", label: "Countries" },
  { value: "<8 hrs", label: "Avg setup time" },
  { value: "85%", label: "Report time saved" },
] as const;

export const LANDING_LOGO_SRC = "/logo-black.png";

export type LandingAccent = "amber" | "teal" | "green";

export const LANDING_ACCENT_STYLES: Record<
  LandingAccent,
  { iconBg: string; iconColor: string }
> = {
  amber: {
    iconBg: "bg-[color:var(--landing-amber-tint)]",
    iconColor: "text-[color:var(--landing-amber)]",
  },
  teal: {
    iconBg: "bg-[color:var(--landing-teal-tint)]",
    iconColor: "text-[color:var(--landing-teal)]",
  },
  green: {
    iconBg: "bg-[color:var(--landing-green-tint)]",
    iconColor: "text-[color:var(--landing-green)]",
  },
};
