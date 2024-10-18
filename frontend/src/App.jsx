import { Outlet } from "react-router-dom";

const App = () => {
  return (
    <div className="container flex flex-col min-h-screen">
      <header></header>
      <main>
        <Outlet />
      </main>
      <footer></footer>
    </div>
  );
};

export default App;
