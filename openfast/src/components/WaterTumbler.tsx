interface WaterTumblerProps {
  fillPercent: number; // 0-100
  size?: number;
}

export function WaterTumbler({ fillPercent, size = 180 }: WaterTumblerProps) {
  const clampedFill = Math.max(0, Math.min(100, fillPercent));

  // Tumbler dimensions (in viewBox coordinates)
  const viewW = 120;
  const viewH = 160;
  const topWidth = 90;     // wider at top
  const bottomWidth = 70;  // narrower at bottom
  const bodyTop = 30;      // where the glass body starts (below rim)
  const bodyBottom = 145;  // where the glass body ends
  const bodyHeight = bodyBottom - bodyTop;

  // Water fill level (fills from bottom up)
  const waterHeight = (clampedFill / 100) * bodyHeight;
  const waterTop = bodyBottom - waterHeight;

  // Tapered sides: interpolate width based on Y position
  function getWidth(y: number): number {
    const t = (y - bodyTop) / bodyHeight; // 0 at top, 1 at bottom
    return topWidth + (bottomWidth - topWidth) * t;
  }

  const waterTopWidth = getWidth(waterTop);
  const waterBottomWidth = getWidth(bodyBottom);

  // Glass outline path (tapered tumbler shape)
  const cx = viewW / 2;
  const glassPath = `
    M ${cx - topWidth / 2} ${bodyTop}
    L ${cx - bottomWidth / 2} ${bodyBottom}
    Q ${cx} ${bodyBottom + 8} ${cx + bottomWidth / 2} ${bodyBottom}
    L ${cx + topWidth / 2} ${bodyTop}
  `;

  // Water shape (clipped inside the glass)
  const waterPath = `
    M ${cx - waterTopWidth / 2} ${waterTop}
    L ${cx - waterBottomWidth / 2} ${bodyBottom}
    Q ${cx} ${bodyBottom + 8} ${cx + waterBottomWidth / 2} ${bodyBottom}
    L ${cx + waterTopWidth / 2} ${waterTop}
    Z
  `;

  // Subtle wave at water surface
  const waveY = waterTop;
  const waveW = waterTopWidth;
  const wavePath = clampedFill > 0 ? `
    M ${cx - waveW / 2} ${waveY}
    Q ${cx - waveW / 4} ${waveY - 3} ${cx} ${waveY}
    Q ${cx + waveW / 4} ${waveY + 3} ${cx + waveW / 2} ${waveY}
  ` : "";

  return (
    <svg
      width={size}
      height={size * (viewH / viewW)}
      viewBox={`0 0 ${viewW} ${viewH}`}
      fill="none"
      className="mx-auto"
    >
      <defs>
        {/* Water gradient */}
        <linearGradient id="water-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.7" />
        </linearGradient>
        {/* Glass highlight */}
        <linearGradient id="glass-shine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.08" />
          <stop offset="40%" stopColor="white" stopOpacity="0.02" />
          <stop offset="100%" stopColor="white" stopOpacity="0.06" />
        </linearGradient>
        {/* Clip to glass interior */}
        <clipPath id="glass-clip">
          <path d={`
            M ${cx - topWidth / 2 + 3} ${bodyTop + 2}
            L ${cx - bottomWidth / 2 + 3} ${bodyBottom - 2}
            Q ${cx} ${bodyBottom + 6} ${cx + bottomWidth / 2 - 3} ${bodyBottom - 2}
            L ${cx + topWidth / 2 - 3} ${bodyTop + 2}
            Z
          `} />
        </clipPath>
      </defs>

      {/* Glass body fill (translucent) */}
      <path
        d={glassPath}
        fill="url(#glass-shine)"
        stroke="none"
      />

      {/* Water fill (clipped inside glass) */}
      {clampedFill > 0 && (
        <g clipPath="url(#glass-clip)">
          <path
            d={waterPath}
            fill="url(#water-fill)"
            className="transition-all duration-700 ease-out"
          />
          {/* Wave surface */}
          {wavePath && (
            <path
              d={wavePath}
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeOpacity="0.4"
              fill="none"
            />
          )}
        </g>
      )}

      {/* Glass outline */}
      <path
        d={glassPath}
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Rim at the top */}
      <line
        x1={cx - topWidth / 2 - 2}
        y1={bodyTop}
        x2={cx + topWidth / 2 + 2}
        y2={bodyTop}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Left side highlight (glass refraction) */}
      <line
        x1={cx - topWidth / 2 + 8}
        y1={bodyTop + 10}
        x2={cx - bottomWidth / 2 + 8}
        y2={bodyBottom - 10}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
