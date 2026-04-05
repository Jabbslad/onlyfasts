import { useEffect, useState } from "react";
import { useSheetDrag } from "../hooks/useSheetDrag";
import { formatDuration, formatTime } from "../utils/time";
import { getAllZones } from "../utils/zones";
import { ZONE_DETAILS } from "../content/zone-details";
import type { FastingSession } from "../types";

interface FastDetailSheetProps {
  open: boolean;
  onClose: () => void;
  session: FastingSession | null;
  onDelete: (id: number) => void;
}

function getZonesReached(durationMs: number) {
  const hours = durationMs / 3_600_000;
  const zones = getAllZones();
  return zones.filter((z) => hours > z.startHour).map((zone) => {
    const detail = ZONE_DETAILS[zone.id];
    const endHour = zone.endHour ?? zone.startHour + 24;
    const timeInZoneHours = Math.min(hours, endHour) - zone.startHour;
    const completed = hours >= endHour;
    return { zone, detail, timeInZoneHours, completed };
  });
}

export function FastDetailSheet({ open, onClose, session, onDelete }: FastDetailSheetProps) {
  const [visible, setVisible] = useState(false);
  const [sheetUp, setSheetUp] = useState(false);
  const { sheetRef, dragHandlers } = useSheetDrag({ onClose });

  useEffect(() => {
    if (open) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSheetUp(true));
      });
    } else {
      setSheetUp(false);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!visible || !session) return null;

  const durationMs = session.endTime
    ? session.endTime.getTime() - session.startTime.getTime()
    : 0;
  const dateStr = (session.endTime ?? session.startTime).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const zonesReached = getZonesReached(durationMs);
  const deepestZone = zonesReached.length > 0 ? zonesReached[zonesReached.length - 1] : null;

  // Collect all benefits from zones reached
  const allBenefits = zonesReached.flatMap((z) => z.detail.benefits);

  return (
    <div
      className={`fixed inset-0 z-50 transition-colors duration-300 ${sheetUp ? "bg-black/80" : "bg-transparent"}`}
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 bg-black rounded-t-3xl flex flex-col transition-transform duration-300 ease-out ${sheetUp ? "translate-y-0" : "translate-y-full"}`}
        style={{ height: "85%" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Fast Details"
        {...dragHandlers}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-[2px] rounded-full bg-[rgba(240,240,250,0.2)]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3">
          <h2 className="text-sm font-bold tracking-[1.17px] text-[#f0f0fa]">Fast Summary</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[rgba(240,240,250,0.06)] text-[#f0f0fa]/50 hover:text-[#f0f0fa] transition-colors"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18" /><path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {/* Stats card */}
          <div className="bg-white/[0.03] rounded-xl p-4 flex flex-col gap-2.5 mb-4">
            <DetailRow label="Protocol" value={session.protocol} />
            <DetailRow label="Date" value={dateStr} />
            <DetailRow label="Duration" value={formatDuration(durationMs)} />
            <DetailRow label="Started" value={formatTime(session.startTime)} />
            {session.endTime && (
              <DetailRow label="Ended" value={formatTime(session.endTime)} />
            )}
            {deepestZone && (
              <div className="flex justify-between items-center pt-1 border-t border-white/[0.06]">
                <span className="text-gray-500 text-sm">Deepest zone</span>
                <span className="text-sm font-medium text-[#f0f0fa]">
                  {deepestZone.zone.name}
                </span>
              </div>
            )}
          </div>

          {/* Zones journey */}
          {zonesReached.length > 0 && (
            <div className="mb-4">
              <h3 className="text-white text-xs font-semibold uppercase tracking-widest mb-3">Your journey</h3>
              <div className="flex flex-col gap-2.5">
                {zonesReached.map(({ zone, timeInZoneHours, completed }) => {
                  const hours = Math.floor(timeInZoneHours);
                  const mins = Math.round((timeInZoneHours - hours) * 60);
                  const timeLabel = hours > 0
                    ? `${hours}h ${mins > 0 ? `${mins}m` : ""}`
                    : `${mins}m`;

                  return (
                    <div
                      key={zone.id}
                      className="flex items-center gap-3"
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: "#f0f0fa" }}
                      />
                      <span className="text-sm text-white flex-1">{zone.name}</span>
                      <span className="text-xs text-gray-500">{timeLabel}</span>
                      {completed && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f0f0fa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Body impact */}
          {deepestZone && (
            <div className="mb-4">
              <h3 className="text-white text-xs font-semibold uppercase tracking-widest mb-3">Body impact</h3>
              <div
                className="bg-white/[0.03] rounded-xl p-4 mb-3"
              >
                <p className="text-gray-300 text-sm leading-relaxed">
                  {deepestZone.detail.summary}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {/* What happened */}
                <div>
                  <h4 className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-2">What happened in your body</h4>
                  <ul className="space-y-1.5">
                    {deepestZone.detail.bodyChanges.map((change, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400 leading-snug">
                        <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: "#f0f0fa" }} />
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Benefits achieved */}
                <div>
                  <h4 className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-2">Benefits achieved</h4>
                  <ul className="space-y-1.5">
                    {allBenefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400 leading-snug">
                        <span className="text-[#f0f0fa]/60 text-xs mt-0.5">+</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Delete button */}
          <button
            onClick={() => session.id !== undefined && onDelete(session.id)}
            className="w-full py-3.5 rounded-xl text-[#f0f0fa]/50 text-sm font-medium bg-[rgba(240,240,250,0.06)] border border-[rgba(240,240,250,0.15)] hover:bg-[rgba(240,240,250,0.1)] transition-colors min-h-[48px]"
          >
            Delete Fast
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-white text-sm font-medium">{value}</span>
    </div>
  );
}
