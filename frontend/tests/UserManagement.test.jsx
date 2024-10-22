import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import UserManagement from "@/pages/user/UserManagement";
import { getUserInfo, updateUserInfo } from "@/services/apis/userApi";
import { useUser } from "@/contexts/userContext";

vi.mock("@/contexts/userContext");
vi.mock("@/services/apis/userApi");

describe("User Management Tests", () => {
  beforeEach(() => {
    useUser.mockReturnValue({
      user: { id: 1, username: "testuser" },
      setUser: vi.fn(),
    });
    getUserInfo.mockResolvedValue({ id: 1, username: "testuser", oauths: [] });
  });

  it("renders user management page", async () => {
    render(
      <MemoryRouter>
        <UserManagement />
      </MemoryRouter>
    );

    expect(screen.getByText(/User Management/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByLabelText(/Username/i)).toHaveValue("testuser")
    );
  });

  it("updates user info", async () => {
    const updateMock = vi.fn();
    updateUserInfo.mockImplementation(updateMock);

    render(
      <MemoryRouter>
        <UserManagement />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/User Management/i)).toBeInTheDocument());

    const usernameInput = screen.getByLabelText(/Username/i);
    fireEvent.change(usernameInput, { target: { value: "newuser" } });

    const submitButton = screen.getByText(/Update/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledWith({
        username: "newuser",
      });
    });
  });
});
