import { useEffect, useState } from "react";
import { useSheetDrag } from "../hooks/useSheetDrag";

interface EditStartTimeSheetProps {
  open: boolean;
  onClose: () => void;
  currentStartTime: Date;
  onSave: (newStartTime: Date) => void;
  onDiscard?: () => void;
}

function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toTimeInputValue(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function EditStartTimeSheet({ open, onClose, currentStartTime, onSave, onDiscard }: EditStartTimeSheetProps) {
  const [visible, setVisible] = useState(false);
  const [sheetUp, setSheetUp] = useState(false);
  const { sheetRef, dragHandlers } = useSheetDrag({ onClose });
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");

  useEffect(() => {
    if (open) {
      setDateValue(toDateInputValue(currentStartTime));
      setTimeValue(toTimeInputValue(currentStartTime));
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSheetUp(true));
      });
    } else {
      setSheetUp(false);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open, currentStartTime]);

  if (!visible) return null;

  const selectedDate = new Date(`${dateValue}T${timeValue}:00`);
  const isInFuture = selectedDate.getTime() > Date.now();
  const hasChanged = selectedDate.getTime() !== currentStartTime.getTime();

  function handleSave() {
    if (isInFuture || !hasChanged) return;
    onSave(selectedDate);
  }

  return (
    <div
      className={`fixed inset-0 z-50 transition-colors duration-300 ${sheetUp ? "bg-black/70 backdrop-blur-sm" : "bg-transparent"}`}
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 bg-[#12121f] rounded-t-3xl flex flex-col transition-transform duration-300 ease-out ${sheetUp ? "translate-y-0" : "translate-y-full"}`}
        style={{ maxHeight: "45%" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Edit Start Time"
        {...dragHandlers}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <h2 className="text-white text-lg font-semibold">Edit Start Time</h2>
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

        {/* Inputs */}
        <div className="px-5 flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-gray-500 text-xs font-medium uppercase tracking-widest">Date</label>
              <input
                type="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors [color-scheme:dark]"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-gray-500 text-xs font-medium uppercase tracking-widest">Time</label>
              <input
                type="time"
                value={timeValue}
                onChange={(e) => setTimeValue(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          {isInFuture && (
            <p className="text-red-400 text-xs">Start time cannot be in the future.</p>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-white/[0.06] text-sm font-medium text-gray-300 hover:bg-white/[0.1] transition-colors min-h-[48px]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isInFuture || !hasChanged}
              className="flex-1 py-3 rounded-xl bg-indigo-500 text-sm font-medium text-white min-h-[48px] transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-400"
            >
              Save
            </button>
          </div>

          {onDiscard && (
            <button
              onClick={onDiscard}
              className="w-full py-3 text-red-400/70 text-xs hover:text-red-400 transition-colors pb-[max(1rem,env(safe-area-inset-bottom))]"
            >
              Discard this fast
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
