import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ZoneExplorer } from "./ZoneExplorer";

describe("ZoneExplorer", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<ZoneExplorer open={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders all 5 zone names when open", () => {
    render(<ZoneExplorer open={true} onClose={() => {}} />);
    expect(screen.getAllByText("Anabolic").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Catabolic").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Fat Burning").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Ketosis").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Deep Ketosis").length).toBeGreaterThanOrEqual(1);
  });

  it("shows current zone indicator", () => {
    render(<ZoneExplorer open={true} onClose={() => {}} currentZoneId="fat_burning" elapsedMs={18 * 3_600_000} />);
    expect(screen.getByText("Current")).toBeInTheDocument();
  });

  it("calls onClose when X button clicked", () => {
    const onClose = vi.fn();
    render(<ZoneExplorer open={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("has dialog role", () => {
    render(<ZoneExplorer open={true} onClose={() => {}} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
