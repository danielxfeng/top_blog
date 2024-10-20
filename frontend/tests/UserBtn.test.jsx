import React, { useEffect } from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { UserProvider, useUser } from "@/contexts/userContext";
import UserBtn from "@/components/header/UserBtn";
import { logout } from "@/services/apis/userApi";

vi.mock("@/services/apis/userApi", () => ({
  logout: vi.fn(),
}));

// Render the Dom with mocked the user context.
const renderWithMockedUserContext = ({ isSetUser}) => {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <UserProvider>
        <MockedDom isSetUser={isSetUser} />
      </UserProvider>
    </MemoryRouter>
  );
};

// For set the user context.
const MockedDom = ({ isSetUser }) => {
  const user = { id: 1, username: "test" };
  const { setUser } = useUser();
  useEffect(() => {
    if (isSetUser) {
      setUser(user);
    }
  }, [isSetUser, setUser]);
  return <UserBtn />;
};

describe("UserBtn test", () => {
  it("should display login button when user is not logged in", () => {
    renderWithMockedUserContext({ isSetUser: false });
    const loginBtn = screen.getByRole("link");
    expect(loginBtn).toBeTruthy();
    expect(loginBtn).toHaveAttribute("href", "/user/login");
  });

  it("should display username and logout button when user is logged in", () => {
    renderWithMockedUserContext({ isSetUser: true });
    const links = screen.getByRole("link");
    expect(links).toHaveAttribute("href", "/user/management");
    expect(links).toHaveTextContent("test");
    const logoutBtn = screen.getByTestId("logout");
    expect(logoutBtn).toBeInTheDocument();
    fireEvent.click(logoutBtn);
    expect(logout).toHaveBeenCalled();
  });
});
