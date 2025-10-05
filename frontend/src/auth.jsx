import React, { createContext, useState, useEffect } from "react";
import api, { setToken as setApiToken } from "./api";

export const AuthContext = createContext({ user: null, token: null, setAuth: () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t && u) {
      setApiToken(t);
      setTokenState(t);
      try {
        setUser(JSON.parse(u));
      } catch (e) {
        setUser(null);
        setTokenState(null);
        setApiToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const setAuth = (t, userObj) => {
    if (t) {
      localStorage.setItem("token", t);
      setApiToken(t);
      setTokenState(t);
    } else {
      localStorage.removeItem("token");
      setApiToken(null);
      setTokenState(null);
    }
    if (userObj) {
      localStorage.setItem("user", JSON.stringify(userObj));
      setUser(userObj);
    } else {
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// Helpers
export function getToken() {
  return localStorage.getItem("token") || null;
}
export function setToken(token) {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}
export function setUser(user) {
  if (user) localStorage.setItem("user", JSON.stringify(user));
  else localStorage.removeItem("user");
}
export function logout() {
  setToken(null);
  setUser(null);
}

export default AuthProvider;
