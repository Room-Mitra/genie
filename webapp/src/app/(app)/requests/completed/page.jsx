"use client";

import ConversationModal from "../_components/conversationModal";
import SortTable from "@/components/ui/sort-table";
import RequestStatus from "../_components/requestStatus";
import { useEffect, useMemo, useState } from "react";
import { ID } from "@/components/ui/id";
import { Room } from "@/components/ui/room";
import User from "@/components/ui/user";
import { Dates } from "@/components/ui/dates";
import { Department } from "@/components/ui/department";

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

  const [loading, setLoading] = useState(true);

  const columns = useMemo(
    () => [
      { key: "requestId", label: "REQUEST ID" },
      { key: "status", label: "STATUS" },
      { key: "dates", label: "DATES" },
      { key: "room", label: "ROOM" },
      { key: "department", label: "DEPARTMENT" },
      { key: "assignedStaff", label: "ASSIGNEE" },

      { key: "viewConversation", label: "", sortable: false },
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
    <div className="rounded-[10px] bg-white p-6 dark:bg-gray-dark">
      <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
        Completed Requests
      </h2>

      <SortTable
        columns={columns}
        data={data}
        tableRowClassNames={["text-base font-medium text-dark dark:text-white"]}
        loading={loading}
        noDataMessage="No completed requests 🎉"
      />
    </div>
  );
}
