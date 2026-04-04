import { formatDuration } from "../utils/time";

interface ProgressRingProps {
  elapsedMs: number;
  targetMs: number;
  size?: number;
}

export function ProgressRing({ elapsedMs, targetMs, size = 200 }: ProgressRingProps) {
  const progress = Math.min(elapsedMs / targetMs, 1);
  const goalReached = elapsedMs >= targetMs;

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  const trackColor = "#2a2a4a";
  const progressColor = goalReached ? "#4ade80" : "#818cf8";

  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      {/* Track circle */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={progressColor}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      {/* Center text */}
      {goalReached ? (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={progressColor}
          fontSize="16"
          fontWeight="bold"
        >
          Goal Reached!
        </text>
      ) : (
        <>
          <text
            x={cx}
            y={cy - 10}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="18"
            fontWeight="bold"
          >
            {formatDuration(elapsedMs)}
          </text>
          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#9ca3af"
            fontSize="12"
          >
            of {formatDuration(targetMs)}
          </text>
        </>
      )}
    </svg>
  );
}
