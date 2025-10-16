"use client";

import { isPublicPath } from "@/lib/path";
import { usePathname } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const pathname = usePathname();
  const skipFetch = isPublicPath(pathname);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!skipFetch); // if public, start as not loading

  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data || null);
    } catch (err) {
      console.error("Failed to fetch user", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (skipFetch) {
      // Public route: ensure state is sane
      setUser(null);
      setLoading(false);
      return;
    }

    // Protected route: fetch user
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        if (!cancelled) {
          if (!res.ok) {
            setUser(null);
          } else {
            const data = await res.json();
            setUser(data || null);
          }
        }
      } catch (e) {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [skipFetch, pathname]);

  const value = useMemo(
    () => ({ user, loading, refreshUser }),
    [user, loading, refreshUser],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside a <UserProvider>");
  return ctx;
}
