"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Department } from "@/components/ui/department";
import { ID } from "@/components/ui/id";
import SortTable from "@/components/ui/sort-table";
import User from "@/components/ui/user";
import Link from "next/link";
import { useState, useEffect, useMemo, useCallback } from "react";
import { DeleteButton } from "@/components/ui/delete-button";
import { ResetPasswordButton } from "../_components/resetPasswordButton";
import { DeleteModal } from "@/components/ui/delete-modal";
import { toast } from "react-toastify";
import { useUser } from "@/context/UserContext";
import { ResetPasswordModal } from "../_components/resetPasswordModal";
import { EmailIcon } from "@/assets/icons";
import { PhoneIcon } from "@heroicons/react/24/outline";
import { ShiftSummary } from "../_components/shiftSummary";

async function fetchStaff() {
  const res = await fetch("/api/staff", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch staff");
  return await res.json();
}

export default function Page() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [user, setUser] = useState(null);

  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  const { user: loggedInUser } = useUser();

  const columns = useMemo(
    () => [
      { key: "name", label: "NAME" },
      { key: "department", label: "DEPARTMENT" },
      { key: "contact", label: "CONTACT" },
      { key: "shift", label: "SHIFT" },
      { key: "reportingTo", label: "REPORTS TO" },
      { key: "icons", label: "", sortable: false },
    ],
    [],
  );

  const refreshStaff = useCallback(async () => {
    try {
      const staff = await fetchStaff();
      setData(
        staff?.items?.map((r) => ({
          name: <User user={r} onlyName={true} />,
          contact: (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-start gap-1">
                  <EmailIcon className="h-5 w-5 text-gray-500" />
                  <span>{r.email}</span>
                </div>
                <div className="flex items-center justify-start gap-1">
                  <PhoneIcon className="h-5 w-5 text-gray-500" />
                  <span>{r.mobileNumber || "-"}</span>
                </div>
              </div>
            </>
          ),
          shift: (
            <ShiftSummary timezone="Asia/Kolkata" weekly={r.weeklyShifts} />
          ),
          department: <Department department={r.department} roles={r.roles} />,
          reportingTo: r.reportingToUserId ? (
            <User
              user={
                staff?.items?.filter(
                  (s) => s.userId === r?.reportingToUserId,
                )?.[0]
              }
              showDepartment={true}
              showRoles={true}
            />
          ) : (
            "-"
          ),
          icons: (
            <div className="flex flex-col gap-2">
              {loggedInUser?.userId !== r.userId && (
                <DeleteButton
                  onClick={() => {
                    setUser(r);
                    setShowDeleteModal(true);
                  }}
                />
              )}

              <ResetPasswordButton
                onClick={() => {
                  setUser(r);
                  setShowResetPasswordModal(true);
                }}
              />
            </div>
          ),
        })),
      );
    } catch (err) {
      console.error("Error fetching staff:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStaff();
  }, []);

  async function deleteUser(userId) {
    const res = await fetch(`/api/staff/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });

    setShowDeleteModal(false);
    setUser(null);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(`Failed to delete user: ${err.error}`);
      return;
    }

    toast.success("User deleted");
    refreshStaff();
  }

  async function resetUserPassword({ userId, password }) {
    const res = await fetch(`/api/staff/password`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        password,
      }),
    });

    setShowResetPasswordModal(false);
    setUser(null);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(`Failed to reset user password: ${err.error}`);
      return;
    }

    toast.success("Password changed");
  }

  return (
    <div>
      <Breadcrumb pageName="All Staff" parent="Staff" />
      <div className="mb-5 mt-2 flex items-center justify-end gap-3">
        <Link
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          href="/staff/new"
        >
          + New Staff
        </Link>
      </div>
      <div className="w-fit rounded-[10px] bg-white p-6 dark:bg-gray-dark lg:w-full">
        <SortTable
          columns={columns}
          data={data}
          tableRowClassNames={[
            "text-base font-medium text-dark dark:text-white",
          ]}
          noDataMessage="No staff added"
          loading={loading}
        />

        <DeleteModal
          showModal={showDeleteModal}
          onClose={() => {
            setUser(null);
            setShowDeleteModal(false);
          }}
          message={
            <div className="px-6">
              <div className="pb-2 pt-6 font-bold">
                Are you sure you want to delete user?
              </div>
              <div className="mx-auto w-fit">
                <div className="rounded-lg bg-gray-200/75 pb-4 text-left dark:bg-gray-700">
                  <User
                    user={user}
                    showMobileNumber={true}
                    showEmail={true}
                    showDepartment={true}
                    showRoles={true}
                    width="w-60"
                  />
                </div>
              </div>
            </div>
          }
          header={"Delete user"}
          onConfirmDelete={async () => await deleteUser(user.userId)}
        />

        <ResetPasswordModal
          showModal={showResetPasswordModal}
          onConfirm={async (password) =>
            await resetUserPassword({ userId: user.userId, password })
          }
          onClose={() => {
            setShowResetPasswordModal(false);
            setUser(null);
          }}
          user={user}
        />
      </div>
    </div>
  );
}
