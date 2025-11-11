"use client";

import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { DepartmentSelect } from "./departmentSelect";
import { RoleSelect } from "./roleSelect";
import { StaffShiftEditor } from "./shiftEditor";
import { cn, toTitleCaseFromSnake } from "@/lib/utils";
import InputGroup from "@/components/FormElements/InputGroup";
import { toast } from "react-toastify";
import { Autocomplete } from "@/components/Autocomplete";
import User from "@/components/ui/user";

async function updateStaff(staffUserId, payload) {
  const res = await fetch(`/api/staff/${staffUserId}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to save staff changes");
  }

  return res.json();
}

export function EditStaffPanel({ open, staffUser, onClose, onSave, allStaff }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [reportingTo, setReportingTo] = useState(null);
  const [role, setRole] = useState("");
  const [weeklyShifts, setWeeklyShifts] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Sync local state when staff changes or panel opens
  useEffect(() => {
    if (!staffUser) return;
    setFirstName(staffUser.firstName || "");
    setLastName(staffUser.lastName || "");
    setMobileNumber(staffUser.mobileNumber || "");
    setDepartment(staffUser.department);
    setRole(staffUser.roles?.[0]); // assume single primary role
    setReportingTo(staffUser.reportingTo);
    setWeeklyShifts(staffUser.weeklyShifts || {});
  }, [staffUser, open]);

  if (!open || !staffUser) {
    return null;
  }

  async function handleSave(e) {
    e.preventDefault();
    setUpdating(true);

    const updated = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      mobileNumber: mobileNumber.trim(),
      department,
      roles: role ? [role] : [],
      weeklyShifts,
      reportingToUserId: reportingTo?.userId,
    };

    try {
      await updateStaff(staffUser.userId, updated);
      toast.success("Updated staff details");
      onSave?.();
      onClose?.();
    } catch (error) {
      toast.error(error.message || "Failed to update staff details");
    } finally {
      setUpdating(false);
    }
  }

  function handleOverlayClick() {
    onClose?.();
  }

  function handleOverlayKeyDown(e) {
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClose?.();
    }
  }

  function handlePanelClick(e) {
    // prevent closing when clicking inside the panel
    e.stopPropagation();
  }

  function handlePanelKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose?.();
    }
  }

  const searchStaff = async (q) => {
    await new Promise((r) => setTimeout(r, 250));
    const s = String(q || "").toLowerCase();
    return allStaff
      .filter(
        (r) =>
          r.userId != staffUser.userId &&
          (r.firstName.toLowerCase().includes(s) ||
            r.lastName.toLowerCase().includes(s) ||
            r.email.toLowerCase().includes(s) ||
            r.mobileNumber?.toLowerCase().includes(s)),
      )
      .slice(0, 8);
  };

  const titleId = "edit-staff-title";

  return (
    <div>
      <div
        className={cn(
          "fixed inset-0 z-[50] flex justify-end bg-black/40 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        role="presentation"
        tabIndex={-1}
        onClick={handleOverlayClick}
        onKeyDown={handleOverlayKeyDown}
      >
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <aside
          className={cn(
            "h-full w-full max-w-md transform bg-white shadow-xl transition-transform duration-300 ease-out dark:bg-gray-dark",
            open ? "translate-x-0" : "translate-x-full",
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={handlePanelClick}
          onKeyDown={handlePanelKeyDown}
        >
          <div className="flex items-center justify-between bg-gray-100 px-4 py-3 dark:bg-gray-800">
            <div>
              <span
                id={titleId}
                className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Edit staff
              </span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {staffUser.firstName} {staffUser.lastName}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <form
            onSubmit={handleSave}
            className="flex h-[calc(100%-48px)] flex-col"
          >
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <InputGroup
                  required
                  type="text"
                  name="firstName"
                  label="First Name"
                  placeholder="Kiran"
                  value={firstName}
                  handleChange={(e) => setFirstName(e.target.value)}
                />
                <InputGroup
                  required
                  type="text"
                  name="lastName"
                  label="Last Name"
                  placeholder="Kumar"
                  value={lastName}
                  handleChange={(e) => setLastName(e.target.value)}
                />
              </div>

              <div>
                <InputGroup
                  type="tel"
                  name="mobile"
                  label="Mobile"
                  placeholder="9910203040"
                  value={mobileNumber}
                  handleChange={(e) =>
                    setMobileNumber(
                      e.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pb-6">
                <DepartmentSelect
                  value={department}
                  onChange={(value) => setDepartment(value)}
                />

                <RoleSelect value={role} onChange={(value) => setRole(value)} />
              </div>

              <Autocomplete
                required={!!reportingTo}
                label="Reporting to"
                placeholder="Search staff by name, email or mobile"
                value={reportingTo}
                onSelect={(st) => setReportingTo(st)}
                fetcher={searchStaff}
                getDisplayValue={(st) => {
                  const name = `${st.firstName} ${st.lastName}`.trim();

                  const roles = [st.department, ...(st.roles || [])]
                    .filter(Boolean)
                    .map(toTitleCaseFromSnake)
                    .join(", ");

                  return [name, roles].filter(Boolean).join(" || ");
                }}
                renderItem={(st) => (
                  <User user={st} showDepartment={true} showRoles={true} />
                )}
                noResultsContent={
                  <div className="flex items-center justify-between">
                    <span>Staff not found</span>
                  </div>
                }
              />

              <StaffShiftEditor
                value={weeklyShifts}
                onChange={(value) => setWeeklyShifts(value)}
                timezone="Asia/Kolkata"
              />
            </div>

            <div className="sticky bottom-0 flex items-center justify-between border-t bg-white px-4 py-4 text-sm dark:border-zinc-800 dark:bg-gray-900">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-1.5 font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updating ? "Saving... " : "Save changes"}
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}
