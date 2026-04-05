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
      className={`fixed inset-0 z-50 transition-colors duration-300 ${sheetUp ? "bg-black/80" : "bg-transparent"}`}
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 bg-black rounded-t-3xl flex flex-col transition-transform duration-300 ease-out ${sheetUp ? "translate-y-0" : "translate-y-full"}`}
        style={{ maxHeight: "45%" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Edit Start Time"
        {...dragHandlers}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-[2px] rounded-full bg-[rgba(240,240,250,0.2)]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <h2 className="text-sm font-bold tracking-[1.17px] text-[#f0f0fa]">Edit Start Time</h2>
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

        {/* Inputs */}
        <div className="px-5 flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-gray-500 text-xs font-medium uppercase tracking-widest">Date</label>
              <input
                type="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                className="w-full bg-black border border-[rgba(240,240,250,0.35)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[rgba(240,240,250,0.6)] transition-colors [color-scheme:dark]"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-gray-500 text-xs font-medium uppercase tracking-widest">Time</label>
              <input
                type="time"
                value={timeValue}
                onChange={(e) => setTimeValue(e.target.value)}
                className="w-full bg-black border border-[rgba(240,240,250,0.35)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[rgba(240,240,250,0.6)] transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          {isInFuture && (
            <p className="text-[#f0f0fa]/50 text-xs">Start time cannot be in the future.</p>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-[rgba(240,240,250,0.06)] text-sm font-medium text-[#f0f0fa]/70 hover:bg-[rgba(240,240,250,0.1)] transition-colors min-h-[48px]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isInFuture || !hasChanged}
              className="flex-1 py-3 rounded-xl bg-[rgba(240,240,250,0.1)] border border-[rgba(240,240,250,0.35)] text-sm font-medium text-[#f0f0fa] min-h-[48px] transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[rgba(240,240,250,0.15)]"
            >
              Save
            </button>
          </div>

          {onDiscard && (
            <button
              onClick={onDiscard}
              className="w-full py-3 text-[#f0f0fa]/40 text-xs hover:text-[#f0f0fa]/60 transition-colors mb-4"
            >
              Discard this fast
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
