"use client";

import SortTable from "@/components/ui/sort-table";
import RequestStatus from "../_components/requestStatus";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { ID } from "@/components/ui/id";
import { Room } from "@/components/ui/room";
import User from "@/components/ui/user";
import { Dates } from "@/components/ui/dates";
import { Department } from "@/components/ui/department";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ConversationModal } from "../_components/conversationModal";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { Details } from "@/components/ui/details";

const LIMIT = 50;

export default function Page() {
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [conversation, setConversation] = useState(null);

  // Page 0 uses null as the cursor (first page).
  const [cursorStack, setCursorStack] = useState([null]);
  const [cursorIndex, setCursorIndex] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const isAtStart = cursorIndex === 0;

  const [completedRequests, setCompletedRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = useMemo(
    () => [
      { key: "status", label: "STATUS" },
      { key: "room", label: "ROOM" },
      { key: "department", label: "DEPARTMENT" },
      { key: "icon", label: "", sortable: false },
      { key: "assignedStaff", label: "ASSIGNEE" },
      { key: "dates", label: "DATES" },
    ],
    [],
  );

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
        if (limit) qs.append("limit", String(limit));
        const qToken = serializeToken(tokenForThisPage);
        if (qToken) qs.append("nextToken", qToken);

        const res = await fetch(`/api/requests/inactive?${qs.toString()}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: { "cache-control": "no-store" },
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to fetch inactive requests");
        }

        const data = await res.json();

        setCompletedRequests(
          Array.isArray(data?.items)
            ? data?.items?.map((r) => ({
                dates: (
                  <Dates
                    requestedAt={r.createdAt}
                    estimatedTimeOfFulfillment={r.estimatedTimeOfFulfillment}
                    timeOfFulfillment={r.timeOfFulfillment}
                  />
                ),
                requestId: <ID ulid={r.requestId} />,
                status: (
                  <RequestStatus status={r.status} requestId={r.requestId} />
                ),
                room: <Room room={r.room || {}} />,
                details: <Details details={r.details} />,
                department: (
                  <Department
                    department={r.department}
                    reqType={r.requestType}
                    size="md"
                  />
                ),
                icon: (
                  <div className="flex flex-col">
                    {r.conversation && (
                      <div className="group relative inline-block">
                        <ChatBubbleLeftRightIcon
                          className="size-6 cursor-pointer text-gray-600 hover:text-gray-400 dark:text-white dark:hover:text-gray-400"
                          onClick={() => {
                            setConversation(r.conversation);
                            setShowConversationModal(true);
                          }}
                        />

                        {/* Tooltip */}
                        <span className="absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow transition-opacity duration-200 group-hover:block group-hover:opacity-100">
                          View Conversation
                        </span>
                      </div>
                    )}
                    <Details details={r.details} />
                  </div>
                ),

                assignedStaff: r.assignedStaff ? (
                  <User
                    user={r.assignedStaff}
                    showRoles={true}
                    showDepartment={true}
                  />
                ) : (
                  <div className="font-bold text-gray-600">Unassigned</div>
                ),
                conversation: r.conversation && (
                  <div className="group relative inline-block">
                    <ChatBubbleLeftRightIcon
                      className="size-6 cursor-pointer text-gray-600 hover:text-gray-400 dark:text-white dark:hover:text-gray-400"
                      onClick={() => {
                        setConversation(r.conversation);
                        setShowConversationModal(true);
                      }}
                    />

                    {/* Tooltip */}
                    <span className="absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow transition-opacity duration-200 group-hover:block group-hover:opacity-100">
                      View Conversation
                    </span>
                  </div>
                ),
              }))
            : [],
        );
        const next = data?.nextToken ?? null; // raw token for the *next* page
        setHasMore(Boolean(next));
        setCursorIndex(index);

        setCursorStack((prev) => {
          const copy = prev.slice(0, index + 1); // drop any forward history
          copy[index + 1] = next; // store cursor for the next page
          return copy;
        });
      } finally {
        setLoading(false);
      }
    },
    [cursorStack],
  );

  useLayoutEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" }); // or "smooth"
    });
  }, [cursorIndex]);

  const refreshRequests = useCallback(
    ({ limit } = {}) => {
      setCursorStack([null]);
      setCursorIndex(0);
      setHasMore(false);
      // Important: call fetch with index 0 explicitly
      fetchPageAt({ index: 0, limit: limit || LIMIT });
    },
    [fetchPageAt],
  );

  const nextPage = useCallback(() => {
    const tokenForNext = cursorStack[cursorIndex + 1];
    if (!tokenForNext) return; // no more pages
    fetchPageAt({ index: cursorIndex + 1, limit: LIMIT });
  }, [cursorIndex, cursorStack, fetchPageAt]);

  const previousPage = useCallback(() => {
    if (cursorIndex === 0) return;
    fetchPageAt({ index: cursorIndex - 1, limit: LIMIT });
  }, [cursorIndex, fetchPageAt]);

  // GUARANTEE an initial fetch after mount (and on route changes).
  useEffect(() => {
    refreshRequests({ limit: LIMIT });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Breadcrumb pageName="Completed Requests" parent="Requests" />

      <div className="w-fit rounded-[10px] bg-white p-6 dark:bg-gray-dark lg:w-full">
        <SortTable
          columns={columns}
          data={completedRequests}
          tableRowClassNames={[
            "text-base font-medium text-dark dark:text-white",
          ]}
          loading={loading}
          noDataMessage="No completed requests 🎉"
          onClickNextPage={nextPage}
          onClickPrevPage={previousPage}
          hasMore={hasMore}
          isAtStart={isAtStart}
          showPagination={true}
        />
      </div>

      <ConversationModal
        conversation={conversation}
        showModal={showConversationModal}
        onClose={() => {
          setConversation(null);
          setShowConversationModal(false);
        }}
      />
    </div>
  );
}
