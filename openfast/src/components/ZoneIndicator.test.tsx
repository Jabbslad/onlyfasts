import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ZoneIndicator } from "./ZoneIndicator";

const h = (hours: number) => hours * 3_600_000;

describe("ZoneIndicator", () => {
  it("shows Anabolic zone at 0h", () => {
    render(<ZoneIndicator elapsedMs={0} />);
    expect(screen.getByText("Anabolic")).toBeInTheDocument();
  });

  it("shows Fat Burning zone at 17h", () => {
    render(<ZoneIndicator elapsedMs={h(17)} />);
    expect(screen.getByText("Fat Burning")).toBeInTheDocument();
  });

  it("toggles description on click", () => {
    render(<ZoneIndicator elapsedMs={0} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(/digesting/)).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/digesting/)).toBeInTheDocument();

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(/digesting/)).not.toBeInTheDocument();
  });
});
