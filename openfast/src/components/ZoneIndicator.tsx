import { useState } from "react";
import { getZoneForElapsedMs } from "../utils/zones";

interface ZoneIndicatorProps {
  elapsedMs: number;
  onExploreTap?: () => void;
}

export function ZoneIndicator({ elapsedMs, onExploreTap }: ZoneIndicatorProps) {
  const [expanded, setExpanded] = useState(false);
  const zone = getZoneForElapsedMs(elapsedMs);

  return (
    <div className="flex flex-col items-center mt-4 w-full max-w-xs">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        aria-controls="zone-detail"
        className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium tracking-wide transition-colors duration-200"
        style={{
          color: zone.color,
          backgroundColor: zone.color + "1a",
          borderWidth: 1,
          borderColor: zone.color + "33",
        }}
      >
        <span>{zone.name}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        >
          <path d="M2 4l3 3 3-3" />
        </svg>
      </button>
      {expanded && (
        <div id="zone-detail" className="text-center mt-3 px-4 max-w-[300px]">
          <p className="text-gray-400 text-sm leading-relaxed">
            {zone.description}
          </p>
          {onExploreTap && (
            <button
              onClick={onExploreTap}
              className="text-xs font-medium mt-2 transition-colors duration-200"
              style={{ color: zone.color }}
            >
              Learn more &rarr;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
