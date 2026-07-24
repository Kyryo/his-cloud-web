import { BRAND, BRAND_LOGO_SRC } from "@/constants/brand";

/** Landing-page palette — derived from global brand tokens. */
export const LANDING = {
  paperClay: BRAND.paperClay,
  warmWhite: BRAND.warmWhite,
  inkRoot: BRAND.ink,
  ledgerInk: BRAND.slate,
  signalAmber: BRAND.amber,
  signalAmberTint: BRAND.amberTint,
  liveTeal: BRAND.primary,
  liveTealHover: BRAND.primaryHover,
  liveTealTint: BRAND.tealTint,
  matureGreen: BRAND.green,
  matureGreenTint: BRAND.greenTint,
  shadow: "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.04)",
  shadowHover: "0 2px 4px rgba(15, 23, 42, 0.04), 0 16px 40px rgba(15, 23, 42, 0.08)",
  cardRadius: "20px",
  iconRadius: "12px",
} as const;

export const LANDING_PROOF_STATS = [
  { value: "200+", label: "Active clinics" },
  { value: "14", label: "Countries" },
  { value: "<8 hrs", label: "Avg setup time" },
  { value: "85%", label: "Report time saved" },
] as const;

export const LANDING_LOGO_SRC = BRAND_LOGO_SRC;

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
