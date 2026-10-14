export type OverviewChartPalette = {
  text: string;
  muted: string;
  grid: string;
  surface: string;
  tooltipBorder: string;
  primary: string;
  primaryFill: [string, string];
  bar: string;
  positive: string;
  negative: string;
  /** Sequential scale, low → high retention. */
  heat: string[];
  /** Text color to use on top of the darker half of the heat scale. */
  heatInk: [string, string];
};

/** Mirrors the overview CSS tokens in globals.css for light mode. */
export const OVERVIEW_CHART_PALETTE_LIGHT: OverviewChartPalette = {
  text: "#1f2a24",
  muted: "#6b7280",
  grid: "#ececea",
  surface: "#ffffff",
  tooltipBorder: "#e5e7eb",
  primary: "#0b6e6e",
  primaryFill: ["rgba(11,110,110,0.22)", "rgba(11,110,110,0)"],
  bar: "rgba(11,110,110,0.16)",
  positive: "#15803d",
  negative: "#dc2626",
  heat: ["#f1f7f6", "#cfe7e3", "#97cbc4", "#4fa59d", "#13807a", "#085a5a"],
  heatInk: ["#1f2a24", "#ffffff"],
};

/** Mirrors the overview CSS tokens in globals.css for dark mode. */
export const OVERVIEW_CHART_PALETTE_DARK: OverviewChartPalette = {
  text: "#e6ebe9",
  muted: "#8b9894",
  grid: "#222a28",
  surface: "#141a19",
  tooltipBorder: "#2a3331",
  primary: "#45c4b8",
  primaryFill: ["rgba(69,196,184,0.28)", "rgba(69,196,184,0)"],
  bar: "rgba(69,196,184,0.16)",
  positive: "#4ade80",
  negative: "#f87171",
  heat: ["#151d1c", "#173533", "#1a514d", "#1f7570", "#2f9e95", "#62d3c8"],
  heatInk: ["#e6ebe9", "#071211"],
};
