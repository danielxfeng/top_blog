import React, { useState, useContext, createContext, useEffect } from "react";
import { getLocalStorage } from "../services/storage/storage";
import { getToken } from "../services/apis/userApi";

const UserContext = createContext();

const gap = 5 * 60 * 1000; // 5 minutes

// A helper function to check if the token is near expiration.
const isNearExpiration = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = atob(base64);
    const decoded = JSON.parse(jsonPayload);

    const currentTime = Date.now();
    const expirationTime = decoded.exp * 1000;
    const timeLeft = expirationTime - currentTime;

    return timeLeft < gap;
  } catch (error) {
    console.error("Failed to parse JWT", error);
    return true;
  }
};

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(getLocalStorage("user") || {});

   // Listen to localStorage changes
   useEffect(() => {
    const handleStorageChange = (event) => {
      let newUser = event.detail.value;
      newUser = newUser && newUser.id ? newUser : {};
      setUser(newUser);
    };

    // Add event listener for localStorage changes
    window.addEventListener("localStorageUpdate", handleStorageChange);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("localStorageUpdate", handleStorageChange);
    };
  }, []);

  // Check if the token is near expiration every 5 minutes.
  useEffect(() => {
    const updateToken = async () => {
      if (user && user.token && isNearExpiration(user.token)) {
        try {
          const updatedUser = await getToken();
          if (updatedUser && updatedUser.id) setUser(updatedUser);
        } catch (error) {
          console.error("Failed to refresh token", error);
        }
      }
    };

    const interval = setInterval(updateToken, gap / 5);

    return () => clearInterval(interval);
  }, [user, setUser]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export { UserProvider, useUser };
