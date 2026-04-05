import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SlideToEnd } from "./SlideToEnd";

describe("SlideToEnd", () => {
  it("renders with slider role and label", () => {
    render(<SlideToEnd onComplete={() => {}} />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
    expect(screen.getByText("Slide to end fast")).toBeInTheDocument();
  });

  it("does not call onComplete on render", () => {
    const onComplete = vi.fn();
    render(<SlideToEnd onComplete={onComplete} />);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("fires onComplete after repeated ArrowRight", () => {
    const onComplete = vi.fn();
    render(<SlideToEnd onComplete={onComplete} />);
    const slider = screen.getByRole("slider");
    // 20 presses at 5% each = 100%
    for (let i = 0; i < 21; i++) {
      fireEvent.keyDown(slider, { key: "ArrowRight" });
    }
    expect(onComplete).toHaveBeenCalled();
  });

  it("renders thumb by default", () => {
    render(<SlideToEnd onComplete={() => {}} />);
    const slider = screen.getByRole("slider");
    const thumb = slider.querySelector("[class*='bg-[rgba(240,240,250,0.2)]']");
    expect(thumb).toBeInTheDocument();
  });

  it("renders brighter thumb when goalReached", () => {
    render(<SlideToEnd onComplete={() => {}} goalReached />);
    const slider = screen.getByRole("slider");
    const thumb = slider.querySelector("[class*='bg-[rgba(240,240,250,0.4)]']");
    expect(thumb).toBeInTheDocument();
  });
});
