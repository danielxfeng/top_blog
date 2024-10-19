import React, { useState, useContext, createContext } from "react";
import { getLocalStorage } from "../services/storage/storage";

const UserContext = createContext();

// Provides the user state and setUser function to its children.
const UserProvider = ({ children }) => {
  const [user, setUser] = useState(getLocalStorage("user") || {});
  console.log("user", user);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// The convenience hook to use the user state and setUser function.
// This hook must be used within a UserProvider.
// This hook provides the user state: id, username, isAdmin, and token.
const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export { UserProvider, useUser };
