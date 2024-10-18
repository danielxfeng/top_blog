import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "../src/components/Footer";

describe("Footer Test", () => {
  it("should display the footer", () => {
    render(<Footer />);
    expect(screen.getByText("Fancy Blog")).toBeInTheDocument();
    expect(screen.getByText("Daniel")).toBeInTheDocument();
  });
});
