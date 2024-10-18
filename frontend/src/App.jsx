import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "./components/Footer";

const App = () => {
  return (
    <div className="container flex flex-col min-h-screen">
      <header></header>
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default App;
