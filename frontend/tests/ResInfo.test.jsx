import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ResInfo from "@/components/ResInfo";

describe("ResInfo Component", () => {
  it("renders normally when sending an OK info.", () => {
    const resInfo = {
      type: "ok",
      msg: "ok",
    };
    render(<ResInfo resInfo={resInfo} />);
    expect(screen.getByText(resInfo.msg)).toHaveClass("text-primary");
  });

  it("renders normally when sending an error info", () => {
    const resInfo = {
      type: "error",
      msg: "error",
    };
    render(<ResInfo resInfo={resInfo} />);
    expect(screen.getByText(resInfo.msg)).toHaveClass("text-destructive");
  });

  it("renders nothing when sending an empty info", () => {
    const { container } = render(<ResInfo resInfo={{}} />);
    expect(container.firstChild).toBeNull();
  });
});
