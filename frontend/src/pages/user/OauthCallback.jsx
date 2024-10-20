import React, { useEffect } from "react";
import { useUser } from "@/contexts/userContext";
import { Navigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { userLoginByToken } from "@/services/apis/userApi";
import { setLocalStorage } from "@/services/storage/storage";

// The callback page for OAuth.
const OauthCallback = () => {
  const { setUser } = useUser();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const work = async () => {
      try {
        const token = searchParams.get("token");
        if (!token)
          throw new Error("Illegal access to the OAuth callback page");
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
