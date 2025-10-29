"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

const RequestsContext = createContext(null);

export function RequestsProvider({ children }) {
  const pathname = usePathname();

  // Page 0 uses null as the cursor (first page).
  const [cursorStack, setCursorStack] = useState([null]);
  const [cursorIndex, setCursorIndex] = useState(0);

  const [activeRequests, setActiveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const isAtStart = cursorIndex === 0;

  // Prevent double-fetch on StrictMode dev re-mounts
  const mountedOnce = useRef(false);

  // Serialize a potentially object-shaped token for the querystring.
  const serializeToken = (token) => {
    if (token == null) return null;
    return typeof token === "string"
      ? token
      : encodeURIComponent(JSON.stringify(token));
  };

  const fetchPageAt = useCallback(
    async ({ index, limit } = {}) => {
      setLoading(true);
      try {
        const tokenForThisPage = cursorStack[index] ?? null;

        const qs = new URLSearchParams();
        ["unacknowledged", "in_progress", "delayed"].forEach((s) =>
          qs.append("statuses", s),
        );
        if (limit) qs.append("limit", String(limit));
        const qToken = serializeToken(tokenForThisPage);
        if (qToken) qs.append("nextToken", qToken);

        const res = await fetch(`/api/requests?${qs.toString()}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: { "cache-control": "no-store" },
        });
        const data = await res.json();

        setActiveRequests(Array.isArray(data?.items) ? data.items : []);
        const next = data?.nextToken ?? null; // raw token for the *next* page
        setHasMore(Boolean(next));
        setCursorIndex(index);

        setCursorStack((prev) => {
          const copy = prev.slice(0, index + 1); // drop any forward history
          copy[index + 1] = next; // store cursor for the next page

          console.log(copy);
          return copy;
        });
      } finally {
        setLoading(false);
      }
    },
    [cursorStack],
  );

  const refreshRequests = useCallback(
    ({ limit } = {}) => {
      setCursorStack([null]);
      // Important: call fetch with index 0 explicitly
      fetchPageAt({ index: 0, limit });
    },
    [fetchPageAt],
  );

  const nextPage = useCallback(() => {
    const tokenForNext = cursorStack[cursorIndex + 1];
    if (!tokenForNext) return; // no more pages
    fetchPageAt({ index: cursorIndex + 1 });
  }, [cursorIndex, cursorStack, fetchPageAt]);

  const previousPage = useCallback(() => {
    if (cursorIndex === 0) return;
    fetchPageAt({ index: cursorIndex - 1 });
  }, [cursorIndex, fetchPageAt]);

  // GUARANTEE an initial fetch after mount (and on route changes).
  useEffect(() => {
    // On a hard refresh or path change, always start at page 0.
    setCursorStack([null]);
    setCursorIndex(0);
    setHasMore(false);

    // Avoid double-run in dev StrictMode
    if (mountedOnce.current) {
      // On client-side navigations, fetch immediately
      refreshRequests({});
    } else {
      mountedOnce.current = true;
      // On the very first mount of this provider, also fetch page 0
      refreshRequests({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const value = useMemo(
    () => ({
      activeRequests,
      loading,
      refreshRequests,
      previousPage,
      nextPage,
      hasMore,
      isAtStart,
      cursorIndex, // optional: expose for debugging/UI
    }),
    [
      activeRequests,
      loading,
      previousPage,
      nextPage,
      hasMore,
      isAtStart,
      cursorIndex,
      refreshRequests,
    ],
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
