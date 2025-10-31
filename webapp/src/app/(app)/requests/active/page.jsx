"use client";

import SortTable from "@/components/ui/sort-table";
import RequestStatus from "../_components/requestStatus";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ID } from "@/components/ui/id";
import { Room } from "@/components/ui/room";
import { ActionButton } from "../_components/actionButton";
import User from "@/components/ui/user";
import { Dates } from "@/components/ui/dates";
import { Department } from "@/components/ui/department";
import { Details } from "@/components/ui/details";
import {
  Dialog,
  DialogBackdrop,
  DialogTitle,
  DialogPanel,
} from "@headlessui/react";

import { cn, toTitleCaseFromSnake } from "@/lib/utils";
import { Autocomplete } from "@/components/Autocomplete";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { toast } from "react-toastify";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { useRequests } from "@/context/RequestsContext";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { ConversationModal } from "../_components/conversationModal";

async function fetchStaff() {
  const res = await fetch("/api/staff", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch staff");
  return await res.json();
}

async function stateTransition(data) {
  const res = await fetch(`/api/requests/state-transition`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => {});
    throw new Error(err.error || "failed to transition state");
  }

  return await res.json();
}

export default function Page() {
  const [data, setData] = useState([]);
  const [staff, setStaff] = useState([]);

  const [showStateTransitionModal, setShowStateTransitionModal] =
    useState(false);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [requireAssignedStaffUser, setRequireAssignedStaffUser] =
    useState(false);

  const [request, setRequest] = useState(null);
  const [assignedStaffUser, setAssignedStaffUser] = useState(null);
  const [toStatus, setToStatus] = useState("");
  const [note, setNote] = useState("");

  const {
    activeRequests,
    loading,
    hasMore,
    isAtStart,
    nextPage,
    previousPage,
    refreshRequests,
  } = useRequests();

  const canChangeStatus = useMemo(() => {
    return (
      ((requireAssignedStaffUser && !!assignedStaffUser) ||
        !requireAssignedStaffUser) &&
      !!request &&
      !!toStatus &&
      !isChangingStatus
    );
  }, [
    requireAssignedStaffUser,
    assignedStaffUser,
    request,
    toStatus,
    isChangingStatus,
  ]);

  const columns = useMemo(
    () => [
      { key: "requestId", label: "REQUEST ID" },
      { key: "status", label: "STATUS" },
      { key: "room", label: "ROOM" },
      { key: "department", label: "DEPARTMENT" },
      { key: "details", label: "", sortable: false },
      { key: "conversation", label: "", sortable: false },
      { key: "assignedStaff", label: "ASSIGNEE" },
      { key: "dates", label: "DATES" },
      { key: "acknowledge", label: "", sortable: false },
    ],
    [],
  );

  const searchStaff = async (q) => {
    await new Promise((r) => setTimeout(r, 250));
    const s = String(q || "").toLowerCase();
    return staff
      .filter(
        (r) =>
          r.firstName.toLowerCase().includes(s) ||
          r.lastName.toLowerCase().includes(s) ||
          r.email.toLowerCase().includes(s) ||
          r.mobileNumber?.toLowerCase().includes(s),
      )
      .slice(0, 8);
  };

  const refreshStaff = async () => {
    try {
      const staff = await fetchStaff();
      setStaff(staff?.items);
    } catch (err) {
      console.error("Error fetching staff:", err);
    }
  };

  const reinitializeData = useCallback(() => {
    try {
      setData(
        activeRequests?.map((r) => ({
          dates: (
            <Dates
              requestedAt={r.createdAt}
              estimatedTimeOfFulfillment={r.estimatedTimeOfFulfillment}
            />
          ),
          requestId: <ID ulid={r.requestId} />,
          status: <RequestStatus status={r.status} />,
          room: <Room room={r.room || {}} />,
          details: <Details details={r.details} />,
          department: (
            <Department department={r.department} reqType={r.requestType} />
          ),

          acknowledge: (
            <ActionButton
              status={r.status}
              onStart={() => {
                setShowStateTransitionModal(true);
                setAssignedStaffUser(r.assignedStaff);
                setRequireAssignedStaffUser(true);
                setRequest(r);
                setToStatus("in_progress");
              }}
              onComplete={() => {
                setShowStateTransitionModal(true);
                setRequireAssignedStaffUser(false);
                setRequest(r);
                setToStatus("completed");
              }}
            />
          ),
          assignedStaff: r.assignedStaff ? (
            <User
              user={r.assignedStaff}
              showRoles={true}
              showDepartment={true}
            />
          ) : (
            <div className="text-center">
              <div className="font-bold text-red-600">Unassigned</div>
              <div className="text-xs text-gray-600">Click Start to assign</div>
            </div>
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
    }
  }, [activeRequests]);

  useEffect(() => {
    refreshStaff();
  }, []);

  useEffect(() => {
    reinitializeData();
  }, [activeRequests, reinitializeData]);

  function resetForm() {
    setShowStateTransitionModal(false);
    setAssignedStaffUser(null);
    setRequireAssignedStaffUser(false);
    setRequest(null);
    setNote("");
    setToStatus("");
  }

  async function handleStateTransition(e) {
    e.preventDefault();
    setIsChangingStatus(true);

    try {
      const data = {
        requestId: request.requestId,
        toStatus: toStatus,
        assignedStaffUserId: assignedStaffUser?.userId,
        note: note,
      };

      const result = await stateTransition(data);

      toast.success(
        `Request ${result.requestId.slice(0, 8)} changed status to ${toTitleCaseFromSnake(result.toStatus)}`,
      );
      resetForm();
      refreshRequests({});
    } catch (err) {
      toast.error(err?.message || "Failed to change status");
    } finally {
      setIsChangingStatus(false);
      resetForm();
    }
  }

  return (
    <div>
      <Breadcrumb pageName="Active Requests" parent="Requests" />
      <div className="w-fit rounded-[10px] bg-white p-6 dark:bg-gray-dark sm:w-full">
        <SortTable
          columns={columns}
          data={data}
          tableRowClassNames={[
            "text-base font-medium text-dark dark:text-white",
          ]}
          loading={loading}
          noDataMessage="No active requests 🎉"
          onClickNextPage={nextPage}
          onClickPrevPage={previousPage}
          hasMore={hasMore}
          isAtStart={isAtStart}
          showPagination={true}
        />

        {/* Note and user assignment modal */}
        <div>
          <Dialog
            open={showStateTransitionModal}
            onClose={() => resetForm()}
            className="relative z-40"
          >
            <DialogBackdrop
              transition
              className="data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in fixed inset-0 bg-gray-900/50 transition-opacity"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <DialogPanel
                  transition
                  className="data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in data-closed:sm:translate-y-0 data-closed:sm:scale-95 relative transform overflow-hidden rounded-lg bg-gray-800 text-left shadow-xl outline -outline-offset-1 outline-white/10 transition-all sm:my-8 sm:w-full sm:max-w-lg"
                >
                  <div className="bg-gray-200 text-dark dark:bg-gray-900 sm:p-5">
                    <DialogTitle
                      as="h3"
                      className="text-base font-semibold text-dark dark:text-white"
                    >
                      <div className="mx-auto flex w-fit flex-row items-center gap-3">
                        <span>Change Request </span>
                        <ID ulid={request?.requestId} /> <span>to </span>
                        <RequestStatus status={toStatus} />
                      </div>
                    </DialogTitle>
                  </div>

                  <div className="bg-white dark:bg-gray-800 sm:p-6 sm:pb-4">
                    <div className="mt-4">
                      <form
                        onSubmit={handleStateTransition}
                        className="grid gap-4"
                      >
                        {requireAssignedStaffUser && (
                          <Autocomplete
                            required
                            label="Assign to"
                            placeholder="Search staff by name, email or mobile"
                            value={assignedStaffUser}
                            onSelect={(st) => setAssignedStaffUser(st)}
                            fetcher={searchStaff}
                            getDisplayValue={(st) => {
                              const name =
                                `${st.firstName} ${st.lastName}`.trim();

                              const roles = [st.department, ...(st.roles || [])]
                                .filter(Boolean)
                                .map(toTitleCaseFromSnake)
                                .join(", ");

                              return [name, roles].filter(Boolean).join(" || ");
                            }}
                            renderItem={(st) => (
                              <User
                                user={st}
                                showEmail={true}
                                showDepartment={true}
                                showRoles={true}
                                width="w-[100%]"
                              />
                            )}
                            noResultsContent={
                              <div className="flex items-center justify-between">
                                <span>Staff not found</span>
                              </div>
                            }
                          />
                        )}

                        <TextAreaGroup
                          label="Note"
                          placeholder="Note about the request"
                          handleChange={(e) => setNote(e.target.value)}
                        />

                        <div className="mt-2 flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              resetForm();
                            }}
                            className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-dark hover:bg-gray-300 dark:text-white dark:hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!canChangeStatus}
                            className={cn(
                              "rounded-xl px-4 py-2 text-sm font-medium",
                              !canChangeStatus
                                ? "bg-gray-700 text-gray-400"
                                : "bg-indigo-600 text-white hover:bg-indigo-500",
                            )}
                          >
                            {isChangingStatus ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </DialogPanel>
              </div>
            </div>
          </Dialog>
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
    </div>
  );
}
