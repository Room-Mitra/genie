"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user info from /auth/me
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/auth/me", {
          method: "GET",
          credentials: "include", // send cookie (rm_jwt)
        });

        if (!res.ok) {
          setUser(null);
          return;
        }

        const user = await res.json();
        setUser(user || null);
      } catch (err) {
        console.error("Failed to fetch user", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used inside a <UserProvider>");
  return context;
}
