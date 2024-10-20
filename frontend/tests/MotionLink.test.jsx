import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MotionLink from "../src/components/motionWrapper/MotionLink";

describe("MotionLink Test", () => {
  it("should render children", () => {
    render(<MotionLink>Click Me</MotionLink>);
    const dom = screen.getByText("Click Me");
    expect(dom).toBeInTheDocument();
  });
});