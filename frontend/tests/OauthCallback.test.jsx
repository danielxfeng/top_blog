import { describe, it, vi, expect } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter, Navigate } from "react-router-dom";
import OauthCallback from "@/pages/user/OauthCallback";
import { useUser } from "@/contexts/userContext";
import { setLocalStorage } from "@/services/storage/storage";
import { userLoginByToken } from "@/services/apis/userApi";

vi.mock("@/contexts/userContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/services/storage/storage", () => ({
  setLocalStorage: vi.fn(),
}));

vi.mock("@/services/apis/userApi", () => ({
  userLoginByToken: vi.fn(),
}));

describe("OauthCallback test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it("successfully get the user", async () => {
    const setUser = vi.fn();
    useUser.mockReturnValue({ setUser });
    Object.defineProperty(window, "location", {
      value: {
        search: "?token=test-token",
      },
      writable: true,
    });

    const mockUser = { id: 1 };
    userLoginByToken.mockResolvedValueOnce(mockUser);

    // Render the component
    render(
      <MemoryRouter>
        <OauthCallback />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(setLocalStorage).toHaveBeenCalledWith("user", {
        token: "test-token",
      });
      expect(userLoginByToken).toHaveBeenCalled();
      expect(setUser).toHaveBeenCalledWith(mockUser);
    });
  });

  it("will do nothing when failed the login", async () => {
    const setUser = vi.fn();
    useUser.mockReturnValue({ setUser });

    Object.defineProperty(window, "location", {
      value: {
        search: "?token=test-token",
      },
      writable: true,
    });

    const mockError = new Error("Failed to login");
    userLoginByToken.mockRejectedValueOnce(mockError);

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Render the component
    render(
      <MemoryRouter>
        <OauthCallback />
      </MemoryRouter>
    );

    // Assertions
    await waitFor(() => {
      expect(setLocalStorage).toHaveBeenCalledWith("user", {
        token: "test-token",
      });
      expect(userLoginByToken).toHaveBeenCalled();
      expect(setUser).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);
    });

    consoleErrorSpy.mockRestore();
  });

  it("will do nothing when token is not found", async () => {
    const setUser = vi.fn();
    useUser.mockReturnValue({ setUser });

    Object.defineProperty(window, "location", {
      value: {
        search: "",
      },
      writable: true,
    });

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Render the component
    render(
      <MemoryRouter>
        <OauthCallback />
      </MemoryRouter>
    );

    // Assertions
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    expect(setLocalStorage).not.toHaveBeenCalled();
    expect(userLoginByToken).not.toHaveBeenCalled();
    expect(setUser).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
