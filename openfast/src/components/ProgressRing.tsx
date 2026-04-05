import { formatDuration } from "../utils/time";
import { getAllZones } from "../utils/zones";
import type { FastingZone } from "../types";

interface ProgressRingProps {
  elapsedMs: number;
  targetMs: number;
  size?: number;
  zoneColor?: string;
  zoneGlowColor?: string;
  protocolName?: string;
  streakCount?: number;
}

interface ZoneMarker {
  zone: FastingZone;
  angle: number;
  isPastGoal: boolean;
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

function getZoneMarkers(targetMs: number, ringScaleMs: number): ZoneMarker[] {
  if (targetMs <= 0) return [];
  const zones = getAllZones();
  const markers: ZoneMarker[] = [];

  for (const zone of zones) {
    if (zone.startHour === 0) continue;
    const zoneStartMs = zone.startHour * 3_600_000;
    const fraction = zoneStartMs / ringScaleMs;
    if (fraction > 1) continue;
    const angle = fraction * 2 * Math.PI - Math.PI / 2;
    markers.push({ zone, angle, isPastGoal: zoneStartMs > targetMs });
  }
  return markers;
}

export function ProgressRing({ elapsedMs, targetMs, size = 300, zoneColor, zoneGlowColor, protocolName, streakCount }: ProgressRingProps) {
  const strokeWidth = 42;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ringScaleMs = getRingScale(targetMs);
  const progress = ringScaleMs > 0 ? Math.min(elapsedMs / ringScaleMs, 1) : 0;
  const goalReached = elapsedMs >= targetMs && targetMs > 0;
  const strokeColor = goalReached ? "#4ade80" : (zoneColor ?? "#818cf8");
  const glowColor = goalReached ? "rgba(74, 222, 128, 0.3)" : (zoneGlowColor ?? "rgba(129, 140, 248, 0.25)");
  const center = size / 2;
  const markers = getZoneMarkers(targetMs, ringScaleMs);
  const elapsedHours = elapsedMs / 3_600_000;

  const goalFraction = targetMs / ringScaleMs;
  const goalAngle = goalFraction * 2 * Math.PI - Math.PI / 2;
  const goalMatchesZone = markers.some(
    (m) => Math.abs(m.zone.startHour * 3_600_000 - targetMs) < 60_000
  );

  const padding = 56;
  const fullSize = size + padding * 2;

  function markerLabel(angle: number, label: string, sublabel: string, color: string, dimmed: boolean) {
    // Position label outside ring with a thin hairline connecting to the dot
    const dotRadius = radius + strokeWidth / 2 + 1;
    const dx = center + Math.cos(angle) * dotRadius;
    const dy = center + Math.sin(angle) * dotRadius;

    const lineEnd = radius + strokeWidth / 2 + 10;
    const ex = center + Math.cos(angle) * lineEnd;
    const ey = center + Math.sin(angle) * lineEnd;

    const labelDist = radius + strokeWidth / 2 + 14;
    const lx = center + Math.cos(angle) * labelDist;
    const ly = center + Math.sin(angle) * labelDist;

    const angleDeg = ((angle + Math.PI / 2) * 180) / Math.PI;
    let anchor: "start" | "middle" | "end" = "middle";
    if (angleDeg > 20 && angleDeg < 160) anchor = "start";
    else if (angleDeg > 200 && angleDeg < 340) anchor = "end";

    const op = dimmed ? 0.3 : 0.7;

    return (
      <g>
        {/* Small dot on the ring edge */}
        <circle cx={dx} cy={dy} r={2} fill={color} opacity={op} />
        {/* Thin hairline from dot to label */}
        <line x1={dx} y1={dy} x2={ex} y2={ey}
          stroke={color} strokeWidth={0.75} opacity={op * 0.6} />
        {/* Zone name */}
        <text
          x={lx} y={ly - 5}
          fill={color} fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif"
          textAnchor={anchor} dominantBaseline="central"
          opacity={op}
          letterSpacing="0.3"
        >
          {label}
        </text>
        {/* Hour sublabel */}
        <text
          x={lx} y={ly + 6}
          fill={color} fontSize="8" fontWeight="400" fontFamily="system-ui, sans-serif"
          textAnchor={anchor} dominantBaseline="central"
          opacity={op * 0.6}
        >
          {sublabel}
        </text>
      </g>
    );
  }

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
        <defs>
          <filter id="head-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g transform={`translate(${padding}, ${padding})`}>
          {/* Track */}
          <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
          {/* Progress arc */}
          {progress > 0 && (() => {
            const arcLen = circumference * progress;
            const headAngle = progress * 2 * Math.PI - Math.PI / 2;
            const headX = center + Math.cos(headAngle) * radius;
            const headY = center + Math.sin(headAngle) * radius;

            return (
              <>
                {/* Solid arc */}
                <circle
                  cx={center} cy={center} r={radius} fill="none"
                  stroke={strokeColor} strokeWidth={strokeWidth}
                  strokeDasharray={`${arcLen} ${circumference}`}
                  strokeDashoffset={0}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${center} ${center})`}
                  style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
                />
                {/* Subtle bright cap at leading edge — a small white-tinted glow */}
                <circle
                  cx={headX} cy={headY}
                  r={strokeWidth / 2 - 2}
                  fill="white"
                  opacity={0.15}
                  filter="url(#head-glow)"
                />
              </>
            );
          })()}
          {/* Goal marker */}
          {!goalMatchesZone && markerLabel(goalAngle, "Goal", formatDuration(targetMs), "#4ade80", false)}
          {/* Zone markers */}
          {markers.map((m) => {
            const dimmed = m.isPastGoal && m.zone.startHour > elapsedHours + 1;
            return (
              <g key={m.zone.id}>
                {markerLabel(m.angle, m.zone.name, `${m.zone.startHour}h`, m.zone.color, dimmed)}
              </g>
            );
          })}
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {goalReached ? (
          <span className="text-green-400 text-[10px] font-semibold uppercase tracking-widest mb-1">Goal Reached</span>
        ) : protocolName ? (
          <span className="text-gray-400 text-xs font-semibold uppercase tracking-[0.2em] mb-1.5">{protocolName}</span>
        ) : null}
        <span className="text-[2.5rem] font-bold tracking-wider text-white leading-none">{formatDuration(elapsedMs)}</span>
        <span className="text-sm text-gray-500 mt-1.5">of {formatDuration(targetMs)}</span>
        {streakCount !== undefined && streakCount > 0 && (
          <span className="text-gray-600 text-[10px] mt-1.5">
            <span className="text-orange-400 mr-0.5">&#x1F525;</span>
            {streakCount} day streak
          </span>
        )}
      </div>
    </div>
  );
}
