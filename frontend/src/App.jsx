import React from "react";
import { Outlet } from "react-router-dom";
import { UserProvider } from "./contexts/userContext";
import Header from "./components/Header";
import Footer from "./components/Footer";

const App = () => {
  return (
    <UserProvider>
      <div className="container flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col mt-16 p-5">
          <Outlet />
        </main>
        <Footer />
      </div>
    </UserProvider>
  );
};

export default App;
