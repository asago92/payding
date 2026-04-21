interface RateSparklineProps {
  // Status drives the color tone of the line
  status: "gain" | "loss" | "stable";
  // Real rate values, oldest first. Falsy/empty triggers a muted skeleton.
  data?: number[];
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Inline SVG sparkline rendering the actual fetched rate history.
 * Auto-scales to the min/max of the provided series; renders a flat
 * placeholder line while data is loading or unavailable.
 */
const RateSparkline = ({
  status,
  data,
  width = 180,
  height = 36,
  className,
}: RateSparklineProps) => {
  const hasData = Array.isArray(data) && data.length >= 2;

  const strokeClass =
    !hasData
      ? "text-muted-foreground/40"
      : status === "gain"
        ? "text-gain"
        : status === "loss"
          ? "text-loss"
          : "text-stable";

  const path = hasData
    ? seriesToPath(data!, width, height)
    : flatPath(width, height);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label={
        hasData
          ? `${status} rate trend, last ${data!.length} data points`
          : "Loading rate trend"
      }
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={strokeClass}
      />
    </svg>
  );
};

function seriesToPath(values: number[], w: number, h: number): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1; // avoid divide-by-zero on flat series
  const padY = 3; // leave a little vertical breathing room
  const usableH = h - padY * 2;
  const stepX = w / (values.length - 1);

  return values
    .map((v, i) => {
      const x = i * stepX;
      const norm = (v - min) / range; // 0..1
      const y = h - padY - norm * usableH;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function flatPath(w: number, h: number): string {
  const y = (h / 2).toFixed(2);
  return `M0,${y} L${w.toFixed(2)},${y}`;
}

export default RateSparkline;
