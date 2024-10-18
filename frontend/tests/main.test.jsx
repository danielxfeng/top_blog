import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import routerArray from "../src/main";

describe("Router test", () => {
  it("Can navitate to /", () => {
    const memoryRouter = createMemoryRouter(routerArray, {
      initialEntries: ["/"],
    });

    render(<RouterProvider router={memoryRouter} />);
    expect(screen.getByText("Welcome to the Home Page!")).toBeInTheDocument();
  });

  it("Redirects to ErrorPage when a link does not exist", () => {
    const memoryRouter = createMemoryRouter(routerArray, {
      initialEntries: ["/unknown"],
    });

    render(<RouterProvider router={memoryRouter} />);
    expect(screen.getByText("Not Found")).toBeInTheDocument();
  });
});
