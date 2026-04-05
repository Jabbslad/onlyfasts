import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ZoneTimeline } from "./ZoneTimeline";

describe("ZoneTimeline", () => {
  it("renders all 5 zone labels", () => {
    render(<ZoneTimeline elapsedMs={0} />);
    expect(screen.getByText("Anabolic")).toBeInTheDocument();
    expect(screen.getByText("Catabolic")).toBeInTheDocument();
    expect(screen.getByText("Fat Burning")).toBeInTheDocument();
    expect(screen.getByText("Ketosis")).toBeInTheDocument();
    expect(screen.getByText("Deep Ketosis")).toBeInTheDocument();
  });

  it("has an accessible group role", () => {
    render(<ZoneTimeline elapsedMs={0} />);
    expect(screen.getByRole("group")).toBeInTheDocument();
  });
});
