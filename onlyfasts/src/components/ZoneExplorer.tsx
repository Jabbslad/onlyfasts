import { useEffect, useRef, useState, useCallback } from "react";
import { useSheetDrag } from "../hooks/useSheetDrag";
import { getAllZones, getZoneProgress } from "../utils/zones";
import { ZONE_DETAILS } from "../content/zone-details";
import type { FastingZone } from "../types";

interface ZoneExplorerProps {
  open: boolean;
  onClose: () => void;
  currentZoneId?: string;
  initialZoneId?: string;
  elapsedMs?: number;
}

export function ZoneExplorer({ open, onClose, currentZoneId, initialZoneId, elapsedMs }: ZoneExplorerProps) {
  const zones = getAllZones();
  const [activeTab, setActiveTab] = useState(initialZoneId ?? currentZoneId ?? zones[0].id);
  const [visible, setVisible] = useState(false);
  const [sheetUp, setSheetUp] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const programmaticScroll = useRef(false);
  const { sheetRef: dragRef, dragHandlers } = useSheetDrag({ onClose });

  // Mount/unmount animation
  useEffect(() => {
    if (open) {
      setActiveTab(initialZoneId ?? currentZoneId ?? zones[0].id);
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSheetUp(true));
      });
    } else {
      setSheetUp(false);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open, initialZoneId, currentZoneId, zones]);

  // Scroll to initial zone after animation
  useEffect(() => {
    if (sheetUp && (initialZoneId || currentZoneId)) {
      const targetId = initialZoneId ?? currentZoneId;
      const timer = setTimeout(() => {
        const el = cardRefs.current[targetId!];
        if (el) {
          programmaticScroll.current = true;
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          setTimeout(() => { programmaticScroll.current = false; }, 500);
        }
      }, 320);
      return () => clearTimeout(timer);
    }
  }, [sheetUp, initialZoneId, currentZoneId]);

  // IntersectionObserver to sync tab strip with scroll
  useEffect(() => {
    if (!visible || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (programmaticScroll.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const id = entry.target.getAttribute("data-zone-id");
            if (id) setActiveTab(id);
          }
        }
      },
      { root: scrollRef.current, threshold: 0.5 }
    );
    for (const el of Object.values(cardRefs.current)) {
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [visible]);

  const scrollToZone = useCallback((zoneId: string) => {
    setActiveTab(zoneId);
    const el = cardRefs.current[zoneId];
    if (el) {
      programmaticScroll.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => { programmaticScroll.current = false; }, 500);
    }
  }, []);

  if (!visible) return null;

  const elapsedHours = (elapsedMs ?? 0) / 3_600_000;

  function getZoneStatus(zone: FastingZone): "current" | "past" | "upcoming" | "none" {
    if (!currentZoneId) return "none";
    if (zone.id === currentZoneId) return "current";
    if (zone.startHour < elapsedHours) return "past";
    return "upcoming";
  }

  return (
    <div
      className={`fixed inset-0 z-50 transition-colors duration-300 ${sheetUp ? "bg-black/70 backdrop-blur-sm" : "bg-transparent"}`}
      onClick={onClose}
    >
      <div
        ref={dragRef}
        className={`absolute bottom-0 left-0 right-0 bg-[#12121f] rounded-t-3xl flex flex-col transition-transform duration-300 ease-out ${sheetUp ? "translate-y-0" : "translate-y-full"}`}
        style={{ height: "88%" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Fasting Zones"
        {...dragHandlers}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3">
          <h2 className="text-white text-lg font-semibold">Fasting Zones</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.06] text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18" /><path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab strip */}
        <div className="flex gap-2 px-5 pb-3 sticky top-0 z-10 bg-[#12121f]">
          {zones.map((zone) => {
            const isActive = activeTab === zone.id;
            return (
              <button
                key={zone.id}
                onClick={() => scrollToZone(zone.id)}
                className="flex-1 py-1.5 rounded-full text-[10px] font-semibold tracking-wide truncate transition-all duration-200"
                style={{
                  backgroundColor: isActive ? zone.color + "22" : "rgba(255,255,255,0.04)",
                  color: isActive ? zone.color : "rgb(107, 114, 128)",
                  borderWidth: 1,
                  borderColor: isActive ? zone.color + "44" : "transparent",
                }}
              >
                {zone.name}
              </button>
            );
          })}
        </div>

        {/* Scrollable zone cards */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-8 scroll-smooth">
          {zones.map((zone) => {
            const detail = ZONE_DETAILS[zone.id];
            const status = getZoneStatus(zone);
            const dimmed = status === "upcoming";
            const hourRange = zone.endHour ? `${zone.startHour}–${zone.endHour}h` : `${zone.startHour}h+`;

            return (
              <div
                key={zone.id}
                ref={(el) => { cardRefs.current[zone.id] = el; }}
                data-zone-id={zone.id}
                className={`mb-4 rounded-2xl overflow-hidden transition-opacity duration-300 ${dimmed ? "opacity-60" : ""}`}
                style={{ borderLeft: `3px solid ${zone.color}` }}
              >
                <div className="bg-white/[0.03] p-5">
                  {/* Zone header */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-base font-bold" style={{ color: zone.color }}>{zone.name}</span>
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: zone.color + "1a", color: zone.color }}
                    >
                      {hourRange}
                    </span>
                    {status === "current" && (
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-green-400 ml-auto">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Current
                      </span>
                    )}
                    {status === "past" && (
                      <span className="text-[10px] text-gray-500 ml-auto">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="inline -mt-0.5 mr-0.5">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        Complete
                      </span>
                    )}
                    {status === "upcoming" && (
                      <span className="text-[10px] text-gray-600 ml-auto">Upcoming</span>
                    )}
                  </div>

                  {/* Current zone progress */}
                  {status === "current" && elapsedMs !== undefined && (
                    <div className="mb-3">
                      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${getZoneProgress(elapsedMs) * 100}%`,
                            backgroundColor: zone.color,
                            boxShadow: `0 0 8px ${zone.glowColor}`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">{detail.summary}</p>

                  {/* What's happening */}
                  <div className="mb-4">
                    <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-2">What's happening</h4>
                    <ul className="space-y-1.5">
                      {detail.bodyChanges.map((change, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-400 leading-snug">
                          <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: zone.color }} />
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Benefits */}
                  <div className="mb-4">
                    <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-2">Benefits</h4>
                    <ul className="space-y-1.5">
                      {detail.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-400 leading-snug">
                          <span className="text-green-400 text-xs mt-0.5">+</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tip */}
                  <div className="bg-white/[0.03] rounded-xl p-3.5 flex gap-2.5 items-start">
                    <span className="text-base leading-none mt-0.5">💡</span>
                    <p className="text-xs text-gray-400 leading-relaxed">{detail.tip}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
