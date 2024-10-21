import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import TermsPolicy from "@/pages/TermsPolicy";

describe("Terms Policy Page", () => {
  it("should render the terms policy page", () => {
    const { container } = render(<TermsPolicy />);
    expect(container).toMatchSnapshot();
  });
});
