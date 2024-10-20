import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MotionBtn from "../src/components/motionWrapper/MotionBtn";

describe("MotionBtn Test", () => {
  it("should render children", () => {
    render(<MotionBtn>Click Me</MotionBtn>);
    const dom = screen.getByText("Click Me");
    expect(dom).toBeInTheDocument();
  });
});
