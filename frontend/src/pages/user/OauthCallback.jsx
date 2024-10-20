import React, { useEffect } from "react";
import { useUser } from "@/contexts/userContext";
import { Navigate } from "react-router-dom";
import { userLoginByToken } from "@/services/apis/userApi";
import { setLocalStorage } from "@/services/storage/storage";

// The callback page for OAuth.
const OauthCallback = () => {
  const { setUser } = useUser();

  useEffect(() => {
    const work = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      try {
        const token = urlParams.get("token");
        console.log("token", token);
        if (!token) throw new Error("Illegal access to the OAuth callback page");
        setLocalStorage("user", { token });
        const user = await userLoginByToken();
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
