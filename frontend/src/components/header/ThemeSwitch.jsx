import React, { useEffect, useState } from "react";
import { CiDark } from "react-icons/ci";
import { CiLight } from "react-icons/ci";
import MotionBtn from "../motionWrapper/MotionBtn";
import {
  getLocalStorage,
  setLocalStorage,
} from "../../services/storage/storage";

// The theme switcher component.
const ThemeSwitcher = () => {
  // Use state to store the current theme, also save in local storage.
  const [isDarkMode, setDarkMode] = useState(getLocalStorage("theme") || false);
  const switchTheme = () => {
    const newTheme = !isDarkMode;
    setLocalStorage("theme", newTheme);
    setDarkMode(newTheme);
  };

  // Toggle the dark mode by pre-definition in /twailwind.config.js.
  useEffect(() => {
    isDarkMode
      ? document.documentElement.classList.add("dark")
      : document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  const iconProps = {
    size: 24,
    onClick: switchTheme,
    "data-testid": isDarkMode ? "switch_btn_light" : "switch_btn_dark",
  };

  return (
    <MotionBtn>
      {isDarkMode ? <CiLight {...iconProps} /> : <CiDark {...iconProps} />}
    </MotionBtn>
  );
};

export default ThemeSwitcher;
