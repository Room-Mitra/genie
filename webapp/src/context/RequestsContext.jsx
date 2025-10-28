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

async function fetchActiveRequests({ limit, nextToken }) {
  const statuses = ["unacknowledged", "in_progress", "delayed"];
  const query = new URLSearchParams();
  statuses.forEach((s) => query.append("statuses", s));

  if (limit) query.append("limit", limit);
  if (nextToken) query.append("nextToken", nextToken);

  const res = await fetch(`/api/requests?${query.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch active requests");
  }

  return await res.json();
}

const RequestsContext = createContext(null);

export function RequestsProvider({ children }) {
  const pathname = usePathname();
  const skipFetch = isPublicPath(pathname);

  const [nextTokens, setNextTokens] = useState([]);

  const nextToken = "";
  const limit = "";

  const [loading, setLoading] = useState(!skipFetch);

  const [activeRequests, setActiveRequests] = useState([]);

  const refreshRequests = useCallback(async () => {
    setLoading(true);
    try {
      const statuses = ["unacknowledged", "in_progress", "delayed"];
      const query = new URLSearchParams();
      statuses.forEach((s) => query.append("statuses", s));

      if (limit) query.append("limit", 25);
      if (nextToken) query.append("nextToken", nextToken);

      const requests = await fetchActiveRequests({
        nextToken: nextTokens?.[nextTokens?.length - 1],
      });

      console.log(requests);
      setActiveRequests(requests?.items);

      const newNextTokens = [...nextTokens, requests?.nextToken || "END"];
      setNextTokens(newNextTokens);
    } catch (err) {
      console.error("Failed to fetch active requests", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const nextPage = refreshRequests;
  const previousPage = () => {
    if (nextTokens.pop() === "END") nextTokens.pop();
    refreshRequests();
  };

  useEffect(() => {
    if (skipFetch) {
      // Public route: ensure state is sane
      setActiveRequests([]);
      setLoading(false);
      setNextTokens([]);
      return;
    }

    if (activeRequests?.length) {
      return;
    }

    refreshRequests();
  }, [skipFetch, pathname]);

  const value = useMemo(
    () => ({
      activeRequests,
      loading,
      refreshRequests,
      previousPage,
      nextPage,
      hasMore:
        nextTokens?.length > 0 && nextTokens[nextTokens?.length - 1] !== "END",
      isAtStart: (nextTokens?.length || 0) <= 1,
    }),
    [activeRequests, loading, refreshRequests, previousPage, nextPage],
  );

  return (
    <RequestsContext.Provider value={value}>
      {children}
    </RequestsContext.Provider>
  );
}

export function useRequests() {
  const ctx = useContext(RequestsContext);
  if (!ctx)
    throw new Error("useRequests must be used inside a <RequestsProvider>");
  return ctx;
}
