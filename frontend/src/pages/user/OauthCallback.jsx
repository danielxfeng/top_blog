import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "@/services/apis/userApi";

// The callback page for OAuth.
const OauthCallback = () => {

  useEffect(() => {
    const work = async () => {
      try {
        await getToken();
      } catch (error) {
        console.error(error);
      }
    };

    work();
  }, []);

  return <Navigate to="/" />;
};

export default OauthCallback;
