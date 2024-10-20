import React, { useEffect } from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { UserProvider, useUser } from "../src/contexts/userContext";
import UserBtn from "../src/components/header/UserBtn";

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
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/user/management");
    expect(links[0]).toHaveTextContent("test");
    expect(links[1]).toHaveAttribute("href", "/user/logout");
  });
});
