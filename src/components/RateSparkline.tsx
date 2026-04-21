interface RateSparklineProps {
  // Status drives the color tone of the line
  status: "gain" | "loss" | "stable";
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Lightweight inline SVG sparkline for the dashboard alert card.
 * Generates a gentle deterministic trend line based on status.
 * No data fetching — purely decorative until real history is wired in.
 */
const RateSparkline = ({
  status,
  width = 180,
  height = 36,
  className,
}: RateSparklineProps) => {
  const points = generateTrend(status);
  const path = pointsToPath(points, width, height);

  const strokeClass =
    status === "gain"
      ? "text-gain"
      : status === "loss"
        ? "text-loss"
        : "text-stable";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label={`${status} rate trend, last 30 days`}
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

function generateTrend(status: "gain" | "loss" | "stable"): number[] {
  // Deterministic pseudo-random walk based on a fixed seed per status.
  const seed = status === "gain" ? 12 : status === "loss" ? 7 : 3;
  const drift = status === "gain" ? 0.08 : status === "loss" ? -0.08 : 0;
  const jitter = status === "stable" ? 0.05 : 0.18;
  const out: number[] = [];
  let v = 0.5;
  for (let i = 0; i < 30; i++) {
    const r = pseudo(seed + i);
    v += drift + (r - 0.5) * jitter;
    v = Math.max(0.05, Math.min(0.95, v));
    out.push(v);
  }
  return out;
}

function pseudo(n: number) {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function pointsToPath(points: number[], w: number, h: number) {
  const stepX = w / (points.length - 1);
  return points
    .map((p, i) => {
      const x = i * stepX;
      const y = h - p * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export default RateSparkline;
