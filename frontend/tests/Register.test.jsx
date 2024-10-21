import { describe, it, vi, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useUser } from "@/contexts/userContext";
import Register from "@/pages/user/Register";
import { userRegister } from "@/services/apis/userApi";

global.ResizeObserver = class ResizeObserver {
  constructor(callback) {}
  disconnect() {}
  observe(target, options) {}
  unobserve(target) {}
};

vi.mock("@/contexts/userContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/services/apis/userApi", () => ({
  userRegister: vi.fn(),
}));

describe("Register Form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Displays the registration form", () => {
    useUser.mockReturnValue({ user: null });
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByText(/By creating an account/i)).toBeInTheDocument();
  });

  it("Returns error when passwords do not match", async () => {
    useUser.mockReturnValue({ user: null });
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.input(screen.getByLabelText(/Username/i), {
      target: { value: "TestUser" },
    });
    fireEvent.input(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.input(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password456" },
    });

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() =>
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument()
    );
  });

  it("Returns error when consent is not checked", async () => {
    useUser.mockReturnValue({ user: null });
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.input(screen.getByLabelText(/Username/i), {
      target: { value: "TestUser" },
    });
    fireEvent.input(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.input(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() =>
      expect(
        screen.getByText(
          /By creating an account, you agree to our Terms of Service, Privacy Policy, and Cookies Policy./i
        )
      ).toBeInTheDocument()
    );
  });

  it("Returns ok when registration was successfully", async () => {
    useUser.mockReturnValue({ user: null });
    userRegister.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.input(screen.getByLabelText(/Username/i), {
      target: { value: "TestUser" },
    });
    fireEvent.input(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.input(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() =>
      expect(
        screen.getByText(
          /Registration successfully, will redirect you to Homepage!/i
        )
      ).toBeInTheDocument()
    );

    expect(userRegister).toHaveBeenCalledWith("TestUser", "password123");
  });

  it("Displays an error message when registration fails", async () => {
    useUser.mockReturnValue({ user: null });
    userRegister.mockRejectedValueOnce(new Error("Registration failed"));

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.input(screen.getByLabelText(/Username/i), {
      target: { value: "TestUser" },
    });
    fireEvent.input(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.input(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() =>
      expect(screen.getByText(/Registration failed/i)).toBeInTheDocument()
    );
  });

  it("Redirects to management page when the user is already loggin in", async () => {
    useUser.mockReturnValue({ user: { id: 1 } });
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByLabelText(/Username/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText(/Confirm Password/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Register/i })
      ).not.toBeInTheDocument();
    });
  });
});
