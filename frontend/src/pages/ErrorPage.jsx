import React from "react";
import { useRouteError, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

// The ErrorPage displays an error message when an unexpected error occurs.
// Either routeError which means the error occurred in the route,
// or appError which passed by the app.
const ErrorPage = ({ errMsg }) => {
  const routeError = useRouteError();

  // Get the error message from the routeError or the props.
  const msg = routeError ? routeError.statusText || routeError.message : errMsg;

  return (
    <div className="flex flex-col min-h-screen">
      <Header isFromError={true}  />
      <main className="flex-1 flex flex-col gap-5 items-center justify-center">
        <h1 className="text-4xl text-gradient">Oops!</h1>
        <p>Sorry, an unexpected error has occurred.</p>
        <p>
          <i>{msg}</i>
        </p>
        <p>
          Back to{" "}
          <Link className="underline" to="/">
            Home
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default ErrorPage;
