import React from "react";

import { useRouteError, Link } from "react-router-dom";

// The ErrorPage displays an error message when an unexpected error occurs.
// Either routeError which means the error occurred in the route,
// or appError which passed by the app.
const ErrorPage = ({ errMsg }) => {
  const routeError = useRouteError();

  // Get the error message from the routeError or the props.
  const msg = routeError ? routeError.statusText || routeError.message : errMsg;

  return (
    <div>
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{msg}</i>
      </p>
      <p>
        Back to <Link to="/">Home</Link>
      </p>
    </div>
  );
};

export default ErrorPage;
