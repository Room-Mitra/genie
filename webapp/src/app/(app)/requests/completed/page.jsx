"use client";

import SortTable from "@/components/ui/sort-table";
import RequestStatus from "../_components/requestStatus";
import { useEffect, useMemo, useState } from "react";
import { ID } from "@/components/ui/id";
import { Room } from "@/components/ui/room";
import User from "@/components/ui/user";
import { Dates } from "@/components/ui/dates";
import { Department } from "@/components/ui/department";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ConversationModal } from "../_components/conversationModal";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

async function fetchCompletedRequests() {
  const statuses = ["completed"];
  const query = new URLSearchParams();
  statuses.forEach((s) => query.append("statuses", s));

  const res = await fetch(`/api/requests?${query.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch completed requests");
  }

  return await res.json();
}

export default function Page() {
  const [data, setData] = useState([]);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [conversation, setConversation] = useState(null);

  const [nextTokens, setNextTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = useMemo(
    () => [
      { key: "requestId", label: "REQUEST ID" },
      { key: "status", label: "STATUS" },
      { key: "dates", label: "DATES" },
      { key: "room", label: "ROOM" },
      { key: "department", label: "DEPARTMENT" },
      { key: "assignedStaff", label: "ASSIGNEE" },
      { key: "conversation", label: "", sortable: false },
    ],
    [],
  );

  const refreshRequests = async () => {
    try {
      setLoading(true);
      const requests = await fetchCompletedRequests();
      setData(
        requests?.items?.map((r) => ({
          dates: (
            <Dates
              requestedAt={r.createdAt}
              estimatedTimeOfFulfillment={r.estimatedTimeOfFulfillment}
            />
          ),
          requestId: <ID ulid={r.requestId} />,
          status: <RequestStatus status={r.status} />,
          room: <Room room={r.room || {}} />,
          department: (
            <Department department={r.department} reqType={r.requestType} />
          ),
          viewConversation: r.conversationId ? (
            <ConversationModal roomId={r.roomId} />
          ) : (
            <></>
          ),

          assignedStaff: (
            <User
              user={r.assignedStaff}
              showRoles={true}
              showDepartment={true}
            />
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
        })),
      );
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshRequests();
  }, []);

  return (
    <div>
      <Breadcrumb pageName="Completed Requests" parent="Requests" />

      <div className="rounded-[10px] bg-white p-6 dark:bg-gray-dark">
        <SortTable
          columns={columns}
          data={data}
          tableRowClassNames={[
            "text-base font-medium text-dark dark:text-white",
          ]}
          loading={loading}
          noDataMessage="No completed requests 🎉"
          onClickNextPage={refreshRequests}
          onClickPrevPage={() => {
            if (nextTokens.pop() === "END") nextTokens.pop();
            refreshRequests();
          }}
          hasMore={
            nextTokens?.length > 0 &&
            nextTokens[nextTokens?.length - 1] !== "END"
          }
          isAtStart={(nextTokens?.length || 0) <= 1}
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
