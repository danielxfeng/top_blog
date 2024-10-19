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
          <h4>Title</h4>
          <p>Not title</p>
          <p>当你继续滚动时，内容会卷入到 header 下方...</p>
        </main>
        <Footer />
      </div>
    </UserProvider>
  );
};

export default App;
