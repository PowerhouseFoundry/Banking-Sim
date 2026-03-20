import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authenticateLogin, waitForBankState } from "../services/bankService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    waitForBankState();
  }, []);

  const login = async (username, password) => {
    await waitForBankState();
    const authenticatedUser = await authenticateLogin({ username, password });
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}