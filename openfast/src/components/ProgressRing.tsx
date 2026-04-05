import { formatDuration } from "../utils/time";
import { getAllZones, getZoneForElapsedMs } from "../utils/zones";

interface ProgressRingProps {
  elapsedMs: number;
  targetMs: number;
  size?: number;
  zoneColor?: string;
  zoneGlowColor?: string;
  protocolName?: string;
  streakCount?: number;
}

function getRingScale(targetMs: number): number {
  const zones = getAllZones();
  let maxBoundaryMs = targetMs;
  for (const zone of zones) {
    const boundaryMs = zone.startHour * 3_600_000;
    if (boundaryMs > targetMs) {
      maxBoundaryMs = boundaryMs;
      break;
    }
  }
  return Math.max(targetMs, maxBoundaryMs) * 1.15;
}

// Generate an SVG arc path for textPath to follow
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const x1 = cx + Math.cos(startAngle) * r;
  const y1 = cy + Math.sin(startAngle) * r;
  const x2 = cx + Math.cos(endAngle) * r;
  const y2 = cy + Math.sin(endAngle) * r;
  const sweep = endAngle - startAngle;
  const largeArc = sweep > Math.PI ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

export function ProgressRing({ elapsedMs, targetMs, size = 300, protocolName, streakCount }: ProgressRingProps) {
  const strokeWidth = 42;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ringScaleMs = getRingScale(targetMs);
  const progress = ringScaleMs > 0 ? Math.min(elapsedMs / ringScaleMs, 1) : 0;
  const goalReached = elapsedMs >= targetMs && targetMs > 0;
  const center = size / 2;
  const elapsedHours = elapsedMs / 3_600_000;
  const currentZone = getZoneForElapsedMs(elapsedMs);
  const zones = getAllZones();

  const padding = 12;
  const fullSize = size + padding * 2;

  // Gap between segments in circumference units
  const gapLen = 3;

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Fasting progress"
      className="relative inline-flex items-center justify-center"
      style={{ width: fullSize, height: fullSize }}
    >
      <svg width={fullSize} height={fullSize} viewBox={`0 0 ${fullSize} ${fullSize}`} style={{ overflow: "visible" }}>
        <g transform={`translate(${padding}, ${padding})`}>
          {/* Zone segments on the track */}
          {zones.map((zone) => {
            const startFrac = (zone.startHour * 3_600_000) / ringScaleMs;
            const rawEndFrac = zone.endHour
              ? (zone.endHour * 3_600_000) / ringScaleMs
              : 1;
            const endFrac = Math.min(rawEndFrac, 1);
            if (startFrac >= 1) return null;

            const segmentLen = (endFrac - startFrac) * circumference;
            if (segmentLen < 2) return null;

            // Draw the segment arc using strokeDasharray
            const dashLen = Math.max(0, segmentLen - gapLen);
            const dashOffset = -(startFrac * circumference);

            const isPast = elapsedHours >= (zone.endHour ?? Infinity);
            const isCurrent = zone.id === currentZone.id && elapsedMs > 0;

            // Arc path for curved text — offset inward to visually center within the stroke
            const startAng = startFrac * 2 * Math.PI - Math.PI / 2;
            const endAng = endFrac * 2 * Math.PI - Math.PI / 2;
            const textRadius = radius + 1;
            const textPath = describeArc(center, center, textRadius, startAng, endAng);

            return (
              <g key={zone.id}>
                {/* Zone segment */}
                <circle
                  cx={center} cy={center} r={radius} fill="none"
                  stroke="#f0f0fa"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                  strokeDashoffset={dashOffset}
                  transform={`rotate(-90 ${center} ${center})`}
                  opacity={isCurrent ? 0.25 : isPast ? 0.12 : zone.opacity}
                />
                {/* Curved zone name */}
                <path id={`zp-${zone.id}`} d={textPath} fill="none" stroke="none" />
                <text>
                  <textPath
                    href={`#zp-${zone.id}`}
                    startOffset="50%"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#f0f0fa"
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="Barlow, sans-serif"
                    letterSpacing="1.5"
                    opacity={isCurrent ? 0.7 : isPast ? zone.opacity * 0.7 : zone.opacity * 0.5}
                  >
                    {zone.name}
                  </textPath>
                </text>
              </g>
            );
          })}

          {/* Progress arc */}
          {progress > 0 && (() => {
            const arcLen = circumference * progress;

            return (
              <circle
                cx={center} cy={center} r={radius} fill="none"
                stroke="#f0f0fa" strokeWidth={strokeWidth}
                strokeDasharray={`${arcLen} ${circumference}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                transform={`rotate(-90 ${center} ${center})`}
                opacity={0.55}
              />
            );
          })()}
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {goalReached ? (
          <span className="text-[#f0f0fa] text-[10px] font-bold tracking-[1px] mb-1">GOAL REACHED</span>
        ) : protocolName ? (
          <span className="text-[13px] font-bold tracking-[1.17px] text-[#f0f0fa]/40 mb-1.5">{protocolName}</span>
        ) : null}
        <span className="text-[3rem] font-bold tracking-[0.96px] text-[#f0f0fa] leading-none">{formatDuration(elapsedMs)}</span>
        <span className="text-[13px] text-[#f0f0fa]/25 mt-1.5">of {formatDuration(targetMs)}</span>
        {streakCount !== undefined && streakCount > 0 && (
          <span className="text-[#f0f0fa]/30 text-[10px] tracking-[1px] mt-1.5">
            {streakCount} DAY STREAK
          </span>
        )}
      </div>
    </div>
  );
}
