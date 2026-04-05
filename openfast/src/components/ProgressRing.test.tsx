import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressRing } from "./ProgressRing";

describe("ProgressRing", () => {
  it("renders elapsed time", () => {
    render(<ProgressRing elapsedMs={43_473_000} targetMs={57_600_000} />);
    expect(screen.getByText("12:04:33")).toBeInTheDocument();
  });
  it("renders target time", () => {
    render(<ProgressRing elapsedMs={0} targetMs={57_600_000} />);
    expect(screen.getByText("of 16:00:00")).toBeInTheDocument();
  });
  it("shows goal reached state", () => {
    render(<ProgressRing elapsedMs={60_000_000} targetMs={57_600_000} />);
    expect(screen.getByText("GOAL REACHED")).toBeInTheDocument();
  });
  it("has accessible role", () => {
    render(<ProgressRing elapsedMs={0} targetMs={57_600_000} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
