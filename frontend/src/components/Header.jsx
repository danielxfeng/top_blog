import React from "react";
import Nav from "./header/Nav";
import Logo from "./header/Logo";
import UserBtn from "./header/UserBtn";
import ThemeSwitch from "./header/ThemeSwitch";

const Header = ({ isFromError = false }) => {
  return (
    <header className="fixed top-0 left-0 h-16 p-5 w-full bg-background opacity-90 flex justify-between items-center">
      <Logo />
      {!isFromError && <Nav />}
      {!isFromError && (
        <div className="flex justify-center items-center gap-2">
          <UserBtn />
          <ThemeSwitch />
        </div>
      )}
    </header>
  );
};

export default Header;
