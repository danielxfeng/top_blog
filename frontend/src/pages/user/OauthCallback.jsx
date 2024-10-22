import React, { useEffect } from "react";
import { useUser } from "@/contexts/userContext";
import { Navigate } from "react-router-dom";
import { getToken } from "@/services/apis/userApi";

// The callback page for OAuth.
const OauthCallback = () => {
  const { setUser } = useUser();

  useEffect(() => {
    const work = async () => {
      try {
        const user = await getToken();
        if (user && user.id) setUser(user);
      } catch (error) {
        console.error(error);
      }
    };

    work();
  }, []);

  return <Navigate to="/" />;
};

export default OauthCallback;
