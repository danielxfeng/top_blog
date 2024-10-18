import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "../src/pages/ErrorPage";

describe("ErrorPage Props Test", () => {
  it("should display error info passed via props", () => {
    // We have to create a router first
    // because the ErrorPage component uses useRouteError() hook.
    const memoryRouter = createMemoryRouter(
      [
        {
          path: "/",
          element: <ErrorPage errMsg="Test error from props" />,
        },
      ],
      {
        initialEntries: ["/"],
      }
    );

    render(<RouterProvider router={memoryRouter} />);
    expect(screen.getByText("Test error from props")).toBeInTheDocument();
  });
});
