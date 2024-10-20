import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Logo from "../src/components/header/Logo";

describe("Logo test", () => {
  it("Renders the logo", () => {
    render(<Logo />);
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("log")).toBeInTheDocument();
  });
});
