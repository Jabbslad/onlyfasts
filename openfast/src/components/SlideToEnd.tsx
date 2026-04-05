import { useRef, useState, useCallback, useEffect } from "react";

interface SlideToEndProps {
  onComplete: () => void;
  goalReached?: boolean;
}

export function SlideToEnd({ onComplete, goalReached }: SlideToEndProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const startXRef = useRef(0);
  const trackWidthRef = useRef(0);
  const thumbWidth = 64;
  const threshold = 0.85;

  const thumbColor = goalReached ? "bg-emerald-500 shadow-emerald-500/30" : "bg-indigo-500 shadow-indigo-500/30";

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (completed) return;
    const track = trackRef.current;
    if (!track) return;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    trackWidthRef.current = track.clientWidth - thumbWidth;
    startXRef.current = e.clientX;
    setDragging(true);
    setProgress(0);
  }, [completed]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || completed) return;
    const delta = e.clientX - startXRef.current;
    const pct = Math.max(0, Math.min(1, delta / trackWidthRef.current));
    setProgress(pct);
  }, [dragging, completed]);

  const handlePointerUp = useCallback(() => {
    if (!dragging || completed) return;
    setDragging(false);

    if (progress >= threshold) {
      setCompleted(true);
      setProgress(1);
      try { navigator.vibrate?.(10); } catch {}
      onComplete();
    } else {
      setProgress(0);
    }
  }, [dragging, completed, progress, onComplete]);

  // Reset completed state if component stays mounted (e.g., fast restarts)
  useEffect(() => {
    setCompleted(false);
    setProgress(0);
  }, [onComplete]);

  // Keyboard support
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (completed) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setProgress(prev => {
        const next = Math.min(1, prev + 0.05);
        if (next >= 1) {
          setCompleted(true);
          try { navigator.vibrate?.(10); } catch {}
          onComplete();
        }
        return next;
      });
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setProgress(prev => Math.max(0, prev - 0.05));
    }
  }, [completed, onComplete]);

  const translateX = progress * (trackWidthRef.current || 200);

  return (
    <div
      ref={trackRef}
      className="relative w-full h-[72px] rounded-full bg-white/[0.06] overflow-hidden select-none touch-none"
      role="slider"
      aria-label="Slide to end fast"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Label */}
      <span
        className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm font-medium pointer-events-none transition-opacity duration-150"
        style={{ opacity: 1 - progress * 2 }}
      >
        Slide to end fast
      </span>

      {/* Thumb */}
      <div
        ref={thumbRef}
        className={`absolute top-1 left-1 w-16 h-16 rounded-full ${thumbColor} shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing ${
          !dragging ? "transition-transform duration-300 ease-out" : ""
        }`}
        style={{ transform: `translateX(${translateX}px)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </div>
    </div>
  );
}
