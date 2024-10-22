import { describe, it, vi, expect } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter, Navigate } from "react-router-dom";
import OauthCallback from "@/pages/user/OauthCallback";
import { useUser } from "@/contexts/userContext";
import { getToken } from "@/services/apis/userApi";

vi.mock("@/contexts/userContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/services/apis/userApi", () => ({
  getToken: vi.fn(),
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

    const mockUser = { id: 1 };
    getToken.mockResolvedValueOnce(mockUser);

    // Render the component
    render(
      <MemoryRouter initialEntries={["/oauth/callback"]}>
        <OauthCallback />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getToken).toHaveBeenCalled();
      expect(setUser).toHaveBeenCalledWith(mockUser);
    });
  });

  it("will do nothing when failed the login", async () => {
    const setUser = vi.fn();
    useUser.mockReturnValue({ setUser });

    const mockError = new Error("Failed to login");
    getToken.mockRejectedValueOnce(mockError);

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Render the component
    render(
      <MemoryRouter initialEntries={["/oauth/callback"]}>
        <OauthCallback />
      </MemoryRouter>
    );

    // Assertions
    await waitFor(() => {
      expect(getToken).toHaveBeenCalled();
      expect(setUser).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);
    });

    consoleErrorSpy.mockRestore();
  });
});
