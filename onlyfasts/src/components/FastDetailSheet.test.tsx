import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FastDetailSheet } from "./FastDetailSheet";
import type { FastingSession } from "../types";

const session: FastingSession = {
  id: 1,
  startTime: new Date(2026, 3, 4, 20, 0),
  endTime: new Date(2026, 3, 5, 12, 0),
  protocol: "16:8",
  targetDurationMs: 57_600_000,
  status: "completed",
};

describe("FastDetailSheet", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <FastDetailSheet open={false} onClose={() => {}} session={session} onDelete={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders details when open", () => {
    render(
      <FastDetailSheet open={true} onClose={() => {}} session={session} onDelete={() => {}} />
    );
    expect(screen.getByText("Fast Summary")).toBeInTheDocument();
    expect(screen.getByText("16:8")).toBeInTheDocument();
    expect(screen.getByText("16:00:00")).toBeInTheDocument();
  });

  it("calls onClose when X clicked", () => {
    const onClose = vi.fn();
    render(
      <FastDetailSheet open={true} onClose={onClose} session={session} onDelete={() => {}} />
    );
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onDelete when delete button clicked", () => {
    const onDelete = vi.fn();
    render(
      <FastDetailSheet open={true} onClose={() => {}} session={session} onDelete={onDelete} />
    );
    fireEvent.click(screen.getByText("Delete Fast"));
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
