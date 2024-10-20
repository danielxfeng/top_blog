import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, vi, expect } from "vitest";
import Login from "@/pages/user/Login";
import { useUser } from "@/contexts/userContext";
import { userLogin } from "@/services/apis/userApi";

vi.mock("@/contexts/userContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/services/apis/userApi", () => ({
  userLogin: vi.fn(),
}));

describe("Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders doms", () => {
    useUser.mockReturnValue({ user: null });
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links.some((link) => link.href.includes("google"))).toBeTruthy();
    expect(links.some((link) => link.href.includes("github"))).toBeTruthy();
    expect(links.some((link) => link.href.includes("register"))).toBeTruthy();

  });

  it("can submit login form", async () => {
    const setUserMock = vi.fn();
    useUser.mockReturnValue({ user: null, setUser: setUserMock });
    userLogin.mockResolvedValue({ id: 1, username: "testUser" });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "validUser" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "validPass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(userLogin).toHaveBeenCalledWith("validUser", "validPass");
      expect(setUserMock).toHaveBeenCalled();
    });
  });

  it("Displays error info when login error.", async () => {
    useUser.mockReturnValue({ user: null });

    userLogin.mockRejectedValueOnce(new Error("Login failed"));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "invalidUser" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "invalidPass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(userLogin).toHaveBeenCalled();
      expect(
        screen.getByText("Login failed")
      ).toBeInTheDocument();
    });
  });

  it("should get a validation error when submitting an empty form", async () => {
    useUser.mockReturnValue({ user: null });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Username must be between 6 and 64 characters")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Password must be between 6 and 64 characters")
      ).toBeInTheDocument();
    });
  });

  it("should redirect to management page if user is logged in", () => {
    useUser.mockReturnValue({ user: { id: 1 } });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.queryByText("Login")).not.toBeInTheDocument();
  });
});
