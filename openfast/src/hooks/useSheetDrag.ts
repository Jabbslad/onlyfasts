import { useRef, useCallback } from "react";

interface UseSheetDragOptions {
  onClose: () => void;
  threshold?: number; // pixels to drag before dismissing, default 100
}

export function useSheetDrag({ onClose, threshold = 100 }: UseSheetDragOptions) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const draggingRef = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const el = sheetRef.current;
    if (!el) return;

    // Only start drag if touching near the top of the sheet (first 48px)
    const sheetRect = el.getBoundingClientRect();
    const touchY = e.touches[0].clientY;
    if (touchY - sheetRect.top > 48) return;

    startYRef.current = touchY;
    currentYRef.current = 0;
    draggingRef.current = true;
    el.style.transition = "none";
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!draggingRef.current || !sheetRef.current) return;
    const deltaY = e.touches[0].clientY - startYRef.current;
    // Only allow dragging downward
    currentYRef.current = Math.max(0, deltaY);
    sheetRef.current.style.transform = `translateY(${currentYRef.current}px)`;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!draggingRef.current || !sheetRef.current) return;
    draggingRef.current = false;
    sheetRef.current.style.transition = "transform 300ms ease-out";

    if (currentYRef.current > threshold) {
      sheetRef.current.style.transform = "translateY(100%)";
      setTimeout(onClose, 300);
    } else {
      sheetRef.current.style.transform = "translateY(0)";
    }
    currentYRef.current = 0;
  }, [onClose, threshold]);

  return {
    sheetRef,
    dragHandlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
}
