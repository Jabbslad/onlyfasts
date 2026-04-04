import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TabBar } from "./TabBar";

describe("TabBar", () => {
  it("renders 5 tabs", () => {
    render(<MemoryRouter><TabBar /></MemoryRouter>);
    expect(screen.getByText("Timer")).toBeInTheDocument();
    expect(screen.getByText("Log")).toBeInTheDocument();
    expect(screen.getByText("Water")).toBeInTheDocument();
    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });
  it("renders navigation links", () => {
    render(<MemoryRouter><TabBar /></MemoryRouter>);
    expect(screen.getAllByRole("link")).toHaveLength(5);
  });
});
