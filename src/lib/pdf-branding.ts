import {
  fetchOrganization,
  fetchOrganizationBranding,
} from "@/features/settings/services/settings.service";
import type { TenantBranding } from "@/features/settings/types/settings.types";

export type RgbColor = [number, number, number];

export type PdfBrandPalette = {
  primary: RgbColor;
  secondary: RgbColor;
  accent: RgbColor;
  cardFill: RgbColor;
  cardBorder: RgbColor;
  tableStripe: RgbColor;
  totalHighlight: RgbColor;
  mutedText: RgbColor;
  bodyText: RgbColor;
  onPrimary: RgbColor;
};

export type PdfBrandingContext = TenantBranding & {
  organizationName: string;
  organizationEmail: string;
  organizationPhone: string;
  organizationAddress: string;
  colors: PdfBrandPalette;
};

export type PdfLogo = {
  dataUrl: string;
  width: number;
  height: number;
};

const DEFAULT_PRIMARY: RgbColor = [79, 70, 229];
const DEFAULT_SECONDARY: RgbColor = [99, 102, 241];
const DEFAULT_ACCENT: RgbColor = [129, 140, 248];
const BODY_TEXT: RgbColor = [15, 23, 42];

function normalizeHexColor(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return null;
  }

  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return /^#[0-9a-fA-F]{6}$/.test(withHash) ? withHash : null;
}

export function hexToRgb(
  hex: string | null | undefined,
  fallback: RgbColor,
): RgbColor {
  const normalized = normalizeHexColor(hex);
  if (!normalized) {
    return fallback;
  }

  const value = Number.parseInt(normalized.slice(1), 16);
  if (Number.isNaN(value)) {
    return fallback;
  }

  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

export function lightenRgb(color: RgbColor, factor: number): RgbColor {
  return [
    Math.round(color[0] + (255 - color[0]) * factor),
    Math.round(color[1] + (255 - color[1]) * factor),
    Math.round(color[2] + (255 - color[2]) * factor),
  ];
}

export function mixRgb(
  left: RgbColor,
  right: RgbColor,
  weight = 0.5,
): RgbColor {
  const inverse = 1 - weight;
  return [
    Math.round(left[0] * weight + right[0] * inverse),
    Math.round(left[1] * weight + right[1] * inverse),
    Math.round(left[2] * weight + right[2] * inverse),
  ];
}

function relativeLuminance(color: RgbColor): number {
  const channels = color.map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function resolveOnPrimaryTextColor(primary: RgbColor): RgbColor {
  return relativeLuminance(primary) > 0.45 ? BODY_TEXT : [255, 255, 255];
}

export function resolvePdfBrandPalette(branding: TenantBranding): PdfBrandPalette {
  const primary = hexToRgb(
    branding.branding_primary_color,
    DEFAULT_PRIMARY,
  );
  const secondary = hexToRgb(
    branding.branding_secondary_color || branding.branding_primary_color,
    hexToRgb(branding.branding_primary_color, DEFAULT_SECONDARY),
  );
  const accent = hexToRgb(
    branding.branding_accent_color ||
      branding.branding_secondary_color ||
      branding.branding_primary_color,
    hexToRgb(branding.branding_secondary_color, DEFAULT_ACCENT),
  );

  return {
    primary,
    secondary,
    accent,
    cardFill: lightenRgb(primary, 0.94),
    cardBorder: lightenRgb(secondary, 0.72),
    tableStripe: lightenRgb(primary, 0.97),
    totalHighlight: lightenRgb(accent, 0.8),
    mutedText: mixRgb(secondary, BODY_TEXT, 0.35),
    bodyText: BODY_TEXT,
    onPrimary: resolveOnPrimaryTextColor(primary),
  };
}

export async function loadLogoForPdf(url: string): Promise<PdfLogo | null> {
  if (!url.trim()) {
    return null;
  }

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return null;
    }

    context.drawImage(bitmap, 0, 0);
    bitmap.close();

    const format = blob.type.includes("png") ? "image/png" : "image/jpeg";
    return {
      dataUrl: canvas.toDataURL(format, 0.92),
      width: canvas.width,
      height: canvas.height,
    };
  } catch {
    return null;
  }
}

export async function loadPdfBrandingContext(): Promise<PdfBrandingContext> {
  const [branding, organization] = await Promise.all([
    fetchOrganizationBranding().catch(() => ({
      branding_logo_url: "",
      branding_primary_color: "",
      branding_secondary_color: "",
      branding_accent_color: "",
    })),
    fetchOrganization().catch(() => null),
  ]);

  return {
    ...branding,
    organizationName: organization?.name?.trim() ?? "",
    organizationEmail: organization?.email?.trim() ?? "",
    organizationPhone: organization?.phone?.trim() ?? "",
    organizationAddress:
      organization?.full_address?.trim() || organization?.address?.trim() || "",
    colors: resolvePdfBrandPalette(branding),
  };
}
