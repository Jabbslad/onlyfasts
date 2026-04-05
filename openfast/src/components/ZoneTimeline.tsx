import { getAllZones, getZoneForElapsedMs, getZoneProgress } from "../utils/zones";

interface ZoneTimelineProps {
  elapsedMs: number;
  onZoneTap?: (zoneId: string) => void;
}

export function ZoneTimeline({ elapsedMs, onZoneTap }: ZoneTimelineProps) {
  const zones = getAllZones();
  const currentZone = getZoneForElapsedMs(elapsedMs);
  const progress = getZoneProgress(elapsedMs);

  return (
    <div className="w-full max-w-sm mt-4 px-2" role="group" aria-label="Fasting zones timeline">
      {/* Segment bar */}
      <div className="flex gap-[3px] h-2 rounded-full overflow-hidden">
        {zones.map((zone) => {
          const isCurrent = zone.id === currentZone.id;
          const isPast = zone.startHour < currentZone.startHour;

          let fillPercent = 0;
          if (isPast) fillPercent = 100;
          else if (isCurrent) fillPercent = progress * 100;

          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => onZoneTap?.(zone.id)}
              className="flex-1 rounded-full overflow-hidden"
              style={{ backgroundColor: "rgba(240,240,250,0.06)" }}
              aria-label={zone.name}
            >
              <div
                className="h-full rounded-full transition-all duration-1000 pointer-events-none"
                style={{
                  width: `${fillPercent}%`,
                  backgroundColor: "#f0f0fa",
                  opacity: isPast ? zone.opacity * 0.7 : zone.opacity,
                }}
              />
            </button>
          );
        })}
      </div>
      {/* Labels */}
      <div className="flex gap-[3px] mt-1.5">
        {zones.map((zone) => {
          const isCurrent = zone.id === currentZone.id;
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => onZoneTap?.(zone.id)}
              className="flex-1 text-center text-[11px] font-medium truncate transition-colors duration-300"
              style={{ color: isCurrent ? "rgba(240,240,250,0.7)" : "rgba(240,240,250,0.25)" }}
            >
              {zone.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
