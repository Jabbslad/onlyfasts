import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditStartTimeSheet } from "./EditStartTimeSheet";

describe("EditStartTimeSheet", () => {
  const baseDate = new Date(2026, 3, 5, 10, 30, 0);

  it("renders nothing when closed", () => {
    const { container } = render(
      <EditStartTimeSheet open={false} onClose={() => {}} currentStartTime={baseDate} onSave={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders header when open", () => {
    render(
      <EditStartTimeSheet open={true} onClose={() => {}} currentStartTime={baseDate} onSave={() => {}} />
    );
    expect(screen.getByText("Edit Start Time")).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(
      <EditStartTimeSheet open={true} onClose={onClose} currentStartTime={baseDate} onSave={() => {}} />
    );
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("has dialog role", () => {
    render(
      <EditStartTimeSheet open={true} onClose={() => {}} currentStartTime={baseDate} onSave={() => {}} />
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders Cancel and Save buttons", () => {
    render(
      <EditStartTimeSheet open={true} onClose={() => {}} currentStartTime={baseDate} onSave={() => {}} />
    );
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
