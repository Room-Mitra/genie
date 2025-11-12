"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { cn, toTitleCaseFromSnake } from "@/lib/utils.ts";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { useRouter } from "next/navigation";
import { Autocomplete } from "@/components/Autocomplete";
import User from "@/components/ui/user";
import { StaffShiftEditor } from "../_components/shiftEditor";
import { DepartmentSelect } from "../_components/departmentSelect";
import { RoleSelect } from "../_components/roleSelect";

async function fetchStaff() {
  const res = await fetch("/api/staff", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch staff");
  return await res.json();
}

async function addStaff(staffData) {
  const res = await fetch(`/api/staff`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(staffData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create staff");
  }
  return await res.json();
}

export default function AddStaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");

  const [reportingTo, setReportingTo] = useState(null);

  const [creating, setCreating] = useState(false);
  const [weeklyShifts, setWeeklyShifts] = useState(null);

  const canSubmit = useMemo(() => {
    return (
      reportingTo &&
      firstName &&
      lastName &&
      mobileNumber &&
      role &&
      department &&
      weeklyShifts &&
      Object.keys(weeklyShifts).length > 0 &&
      !creating
    );
  }, [
    reportingTo,
    firstName,
    lastName,
    mobileNumber,
    department,
    role,
    weeklyShifts,
    creating,
  ]);

  function resetForm() {
    setReportingTo(null);
    setFirstName("");
    setLastName("");
    setMobileNumber("");
    setEmail("");
    setPassword("");
    setDepartment("");
    setRole("");
    setWeeklyShifts(null);
  }

  async function handleAddStaff(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setCreating(true);
    try {
      const data = {
        firstName,
        lastName,
        mobileNumber,
        email,
        password,
        department,
        role,
        reportingToUserId: reportingTo.userId,
        weeklyShifts,
      };

      const staff = await addStaff(data);

      resetForm();
      toast.success(`Staff ${staff?.userId?.slice(0, 6)} created`);
      router.push("/staff/all");
    } catch (err) {
      toast.error(err?.message || "Failed to create staff");
    } finally {
      setCreating(false);
    }
  }

  const refreshStaff = async () => {
    try {
      const staff = await fetchStaff();
      setStaff(staff?.items);
    } catch (err) {
      console.error("Error fetching staff:", err);
    }
  };

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

  useEffect(() => {
    refreshStaff();
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <Breadcrumb pageName="New Staff" parent="Staff" />
      <form onSubmit={handleAddStaff}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-[10px] bg-white p-6 dark:bg-gray-dark">
            <div className="grid grid-cols-1 gap-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                <InputGroup
                  type="email"
                  name="email"
                  label="Email"
                  placeholder="kiran@hotel.com"
                  value={email}
                  handleChange={(e) => setEmail(e.target.value)}
                  required
                />
                <InputGroup
                  type="password"
                  name="password"
                  label="Password"
                  placeholder="********"
                  value={password}
                  handleChange={(e) => setPassword(e.target.value)}
                  showPasswordToggle={true}
                  required
                />
              </div>

              <hr className="my-2" />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DepartmentSelect
                  value={department}
                  handleChange={(e) => setDepartment(e.target.value)}
                  required
                />

                <RoleSelect
                  value={role}
                  handleChange={(e) => setRole(e.target.value)}
                  required
                />
              </div>

              {/* Staff autocomplete */}
              <Autocomplete
                required
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
            </div>
          </div>

          <div className="rounded-[10px] bg-white p-6 dark:bg-gray-dark">
            <StaffShiftEditor
              value={weeklyShifts}
              onChange={setWeeklyShifts}
              timezone="Asia/Kolkata"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-dark hover:bg-gray-300 dark:text-gray-300"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium",
              canSubmit
                ? "bg-indigo-600 text-white hover:bg-indigo-500"
                : "cursor-not-allowed bg-gray-700 text-gray-400",
            )}
          >
            {creating ? "Saving..." : "Save staff"}
          </button>
        </div>
      </form>
    </div>
  );
}
