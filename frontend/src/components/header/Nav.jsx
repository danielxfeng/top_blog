import React from "react";

const Nav = () => {
  return (
    <nav className="flex-none h-16 flex justify-around items-center gap-2 underline">
      <a href="/">Home</a>
      <a href="/new">New Post</a>
    </nav>
  );
};

export default Nav;
