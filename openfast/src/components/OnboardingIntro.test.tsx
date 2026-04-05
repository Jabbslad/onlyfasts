import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OnboardingIntro } from "./OnboardingIntro";
import { ONBOARDING_SLIDES } from "../content/onboarding";

// Stub rAF so transitions resolve synchronously in tests
beforeEach(() => {
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    cb(0);
    return 0;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("OnboardingIntro", () => {
  it("renders the first slide body text on mount", () => {
    render(<OnboardingIntro onComplete={vi.fn()} />);
    expect(screen.getByText(ONBOARDING_SLIDES[0].body)).toBeInTheDocument();
  });

  it("advances to the next slide when Next is clicked", async () => {
    const user = userEvent.setup();
    render(<OnboardingIntro onComplete={vi.fn()} />);
    await act(async () => {
      await user.click(screen.getByText("Next"));
    });
    expect(screen.getByText(ONBOARDING_SLIDES[1].body)).toBeInTheDocument();
  });

  it("calls onComplete when Skip is clicked", async () => {
    const onComplete = vi.fn();
    const user = userEvent.setup();
    render(<OnboardingIntro onComplete={onComplete} />);
    await user.click(screen.getByText("Skip"));
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("shows Get Started on the last slide and calls onComplete", async () => {
    const onComplete = vi.fn();
    const user = userEvent.setup();
    render(<OnboardingIntro onComplete={onComplete} />);
    for (let i = 0; i < ONBOARDING_SLIDES.length - 1; i++) {
      await act(async () => {
        await user.click(screen.getByText("Next"));
      });
    }
    expect(screen.getByText("Get Started")).toBeInTheDocument();
    await user.click(screen.getByText("Get Started"));
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("renders the correct number of dot indicators", () => {
    render(<OnboardingIntro onComplete={vi.fn()} />);
    const dots = screen.getAllByRole("button", { name: /go to slide/i });
    expect(dots).toHaveLength(ONBOARDING_SLIDES.length);
  });
});
