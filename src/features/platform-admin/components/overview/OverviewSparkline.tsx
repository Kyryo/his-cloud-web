import { useId } from "react";

import { buildSparklinePaths } from "@/features/platform-admin/utils/overview-series";

type Props = {
  values: readonly number[];
  width?: number;
  height?: number;
  className?: string;
};

/** Dependency-free SVG sparkline; colored with `currentColor`. */
export function OverviewSparkline({
  values,
  width = 120,
  height = 36,
  className,
}: Props) {
  const id = useId();
  const paths = buildSparklinePaths(values, width, height);
  if (!paths) return null;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden
      data-testid="overview-sparkline"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.22} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={paths.area} fill={`url(#${id})`} />
      <path
        d={paths.line}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
