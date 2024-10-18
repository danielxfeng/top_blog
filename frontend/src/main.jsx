import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import ErrorPage from "./pages/ErrorPage";
import "./index.css";

// The router array for the app.
const routerArray = [
  {
    path: "/",
    element: <App />, // The root element of the app, including the layout, header, and footer.
    errorElement: <ErrorPage />, // The error page to display when a route fails.
    children: [
      {
        path: "/",
        element: <Home />, // The home page.
      },
    ],
  },
];

const rootElement = document.getElementById("root");
// Check the root element first to avoid an error when running tests.
if (rootElement)
  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={createBrowserRouter(routerArray)} />
    </StrictMode>
  );

export default routerArray;