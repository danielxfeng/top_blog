import React from "react";

// This component is used to display the response of form submission.
const ResInfo = ({ resInfo }) => {
  return (
    resInfo && resInfo.type && (
      <div
        className={resInfo.type === "ok" ? "text-primary" : "text-destructive"}
      >
        {resInfo.msg}
      </div>
    )
  );
};

export default ResInfo;
