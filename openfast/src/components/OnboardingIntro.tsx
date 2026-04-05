import { useState, useRef, useCallback, useEffect } from "react";
import { ONBOARDING_SLIDES } from "../content/onboarding";

interface OnboardingIntroProps {
  onComplete: () => void;
}

/* Inline SVG icons for each slide */
function SlideIcon({ slideId, color }: { slideId: string; color: string }) {
  switch (slideId) {
    case "welcome":
      return (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <rect x="16" y="8" width="48" height="64" rx="8" stroke={color} strokeWidth="3" />
          <path d="M32 36l8 8 8-16" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="40" cy="56" r="4" fill={color} />
        </svg>
      );
    case "zones":
      return (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="30" stroke="#f0f0fa" strokeWidth="3" strokeDasharray="12 8" />
          <circle cx="40" cy="40" r="22" stroke="#f0f0fa" strokeWidth="3" strokeDasharray="10 6" opacity="0.6" />
          <circle cx="40" cy="40" r="14" stroke="#f0f0fa" strokeWidth="3" strokeDasharray="8 5" opacity="0.4" />
          <circle cx="40" cy="40" r="6" fill="#f0f0fa" />
        </svg>
      );
    case "benefits":
      return (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <path d="M40 12C32 12 20 20 20 36c0 16 20 32 20 32s20-16 20-32C60 20 48 12 40 12z" stroke={color} strokeWidth="3" strokeLinejoin="round" />
          <path d="M34 36l4 4 8-8" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "start":
      return (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <path d="M40 16L44 28H56L46 36L50 48L40 40L30 48L34 36L24 28H36L40 16Z" stroke={color} strokeWidth="3" strokeLinejoin="round" />
          <circle cx="40" cy="56" r="8" stroke={color} strokeWidth="3" />
          <path d="M37 56l2 2 4-4" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

export function OnboardingIntro({ onComplete }: OnboardingIntroProps) {
  const [step, setStep] = useState(0);
  const [animateIn, setAnimateIn] = useState(true);
  const touchStartX = useRef(0);
  const isLastSlide = step === ONBOARDING_SLIDES.length - 1;
  const slide = ONBOARDING_SLIDES[step];

  /* Fade in on initial mount */
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setMounted(true));
    });
  }, []);

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= ONBOARDING_SLIDES.length) return;
      setAnimateIn(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setStep(next);
          setAnimateIn(true);
        });
      });
    },
    [],
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0 && step < ONBOARDING_SLIDES.length - 1) goTo(step + 1);
      if (dx > 0 && step > 0) goTo(step - 1);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}
      style={{
        background: "#000000",
      }}
    >
      {/* Slide content */}
      <div
        className={`flex-1 flex flex-col items-center justify-center px-8 relative transition-all duration-300 ease-out ${
          animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Icon */}
        <div className="mb-8">
          <SlideIcon slideId={slide.id} color={slide.accentColor} />
        </div>

        {/* Headline */}
        <h1 className="text-2xl font-bold text-[#f0f0fa] text-center leading-tight whitespace-pre-line mb-4">
          {slide.headline}
        </h1>

        {/* Body */}
        <p className="text-[#f0f0fa]/50 text-center text-base leading-relaxed max-w-sm mb-8">
          {slide.body}
        </p>

        {/* Highlights */}
        <ul className="space-y-3 w-full max-w-sm">
          {slide.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-[#f0f0fa]/70 leading-snug">
              <span className="mt-1.5 shrink-0">
                <svg width="8" height="8" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" fill="#f0f0fa" />
                </svg>
              </span>
              {h}
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom controls */}
      <div className="relative px-8 pb-10 pt-4">
        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {ONBOARDING_SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={`Go to slide ${i + 1}`}
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === step ? "w-2.5 h-2.5 bg-[#f0f0fa]" : "w-2 h-2 bg-[rgba(240,240,250,0.2)]"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-4">
          {!isLastSlide ? (
            <button
              onClick={onComplete}
              className="min-h-[44px] px-4 text-[#f0f0fa]/40 text-sm font-medium transition-colors hover:text-[#f0f0fa]/60"
            >
              Skip
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={() => (isLastSlide ? onComplete() : goTo(step + 1))}
            className="min-h-[44px] px-8 py-3 rounded-[32px] text-sm font-bold tracking-[1.17px] transition-all duration-300 bg-[rgba(240,240,250,0.1)] border border-[rgba(240,240,250,0.35)] text-[#f0f0fa] hover:bg-[rgba(240,240,250,0.15)]"
          >
            {isLastSlide ? "Get Started" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
