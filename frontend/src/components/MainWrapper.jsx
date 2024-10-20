import React from "react";

// The main wrapper of the page.
const MainWrapper = ({ title, children }) => {
  return (
    <>
      <h1 className="mb-3 text-3xl font-semibold text-gradient">{title}</h1>
      {children}
    </>
  );
};

export default MainWrapper;
