import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ThemeSwitcher from "../src/components/header/ThemeSwitch";
import {
  getLocalStorage,
  setLocalStorage,
} from "../src/services/storage/storage";

vi.mock("../src/services/storage/storage", {
  getLocalStorage: vi.fn(),
  setLocalStorage: vi.fn(),
});

describe("Theme Switch test", () => {
  beforeEach(() => {
    // Mock document functions
    document.documentElement.classList.remove = vi.fn();
    document.documentElement.classList.add = vi.fn();
  });

  it("renders the dark icon initially", () => {
    getLocalStorage.mockReturnValue(false);
    render(<ThemeSwitcher />);

    expect(screen.getByTestId("switch_btn_dark")).toBeInTheDocument();
  });

  it("switches the icon based on value in local storage", () => {
    getLocalStorage.mockReturnValue(true);
    render(<ThemeSwitcher />);

    expect(screen.getByTestId("switch_btn_light")).toBeInTheDocument();
  });

  it("toggles the theme when the icon is clicked", () => {
    getLocalStorage.mockReturnValue(false);
    render(<ThemeSwitcher />);

    fireEvent.click(screen.getByTestId("switch_btn_dark"));
    expect(screen.getByTestId("switch_btn_light")).toBeInTheDocument();
    expect(document.documentElement.classList.add).toHaveBeenCalledWith("dark");
    expect(setLocalStorage).toHaveBeenCalledWith("theme", true);

    fireEvent.click(screen.getByTestId("switch_btn_light"));
    expect(screen.getByTestId("switch_btn_dark")).toBeInTheDocument();
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith("dark");
    expect(setLocalStorage).toHaveBeenCalledWith("theme", false);
  });
});
