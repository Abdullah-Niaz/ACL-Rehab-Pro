import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null"),
  );
  const [loading, setLoading] = useState(false);
  const login = async (email, password) => {
    setLoading(true);
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    setLoading(false);
    return data.user;
  };
  const loginWithSession = (token, dataUser) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(dataUser));
    setUser(dataUser);
  };
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) api.get("/auth/me").catch(logout);
  }, []);
  return (
    <AuthContext.Provider value={{ user, login, logout, loading, loginWithSession }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
