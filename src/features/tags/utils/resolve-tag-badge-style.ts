export type TagBadgeStyle = {
  className: string;
  style?: {
    backgroundColor: string;
    color: string;
    borderColor?: string;
  };
};

function parseHexColor(color: string): { r: number; g: number; b: number } | null {
  const trimmed = color.trim();
  const shortMatch = /^#([0-9a-fA-F]{3})$/.exec(trimmed);
  if (shortMatch) {
    const [r, g, b] = shortMatch[1].split("");
    return {
      r: Number.parseInt(`${r}${r}`, 16),
      g: Number.parseInt(`${g}${g}`, 16),
      b: Number.parseInt(`${b}${b}`, 16),
    };
  }

  const longMatch = /^#([0-9a-fA-F]{6})$/.exec(trimmed);
  if (!longMatch) {
    return null;
  }

  const value = Number.parseInt(longMatch[1], 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function relativeLuminance(r: number, g: number, b: number): number {
  const channel = (component: number) => {
    const normalized = component / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  return (
    0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
  );
}

export function resolveTagBadgeStyle(color: string | undefined): TagBadgeStyle {
  if (!color?.trim()) {
    return {
      className: "border-brand-border bg-brand-tint text-brand-navy",
    };
  }

  const rgb = parseHexColor(color);
  if (!rgb) {
    return {
      className: "border-brand-border bg-brand-tint text-brand-navy",
    };
  }

  const luminance = relativeLuminance(rgb.r, rgb.g, rgb.b);
  const useDarkText = luminance > 0.62;
  const useNeutralBorder = luminance > 0.9;

  return {
    className: useNeutralBorder ? "border-brand-border" : "border-transparent",
    style: {
      backgroundColor: color.trim(),
      color: useDarkText ? "#1e293b" : "#ffffff",
      borderColor: useNeutralBorder ? undefined : color.trim(),
    },
  };
}
