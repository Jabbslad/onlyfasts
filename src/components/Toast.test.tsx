import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Toast } from "./Toast";

describe("Toast", () => {
  it("renders message when visible", () => {
    render(<Toast message="Badge earned!" visible={true} />);
    expect(screen.getByText("Badge earned!")).toBeInTheDocument();
  });
  it("is hidden when not visible", () => {
    render(<Toast message="Badge earned!" visible={false} />);
    const el = screen.getByText("Badge earned!");
    expect(el.closest("div")).toHaveClass("opacity-0");
  });
});
