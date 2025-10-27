"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Autocomplete } from "./_components/autocomplete";
import { cn, toTitleCaseFromSnake } from "@/lib/utils.ts";

import { Select } from "@/components/FormElements/select";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

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

  const canSubmit = useMemo(() => {
    return (
      reportingTo &&
      firstName &&
      lastName &&
      mobileNumber &&
      role &&
      department &&
      !creating
    );
  }, [
    reportingTo,
    firstName,
    lastName,
    mobileNumber,
    department,
    role,
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
      };

      const staff = await addStaff(data);
      console.log(staff);

      resetForm();
      toast.success(`Staff ${staff?.userId?.slice(0, 6)} created`);
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
    <div className="mx-auto max-w-3xl">
      <Breadcrumb pageName="New Staff" parent="Staff" />
      <div className="rounded-[10px] bg-white p-6 dark:bg-gray-dark">
        <form onSubmit={handleAddStaff} className="grid grid-cols-1 gap-5">
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
                setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
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

          {/* Staff autocomplete */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Department"
              items={[
                { label: "House Keeping", value: "house_keeping" },
                { label: "Room Service", value: "room_service" },
                { label: "Front Office", value: "front_office" },
                { label: "Concierge", value: "concierge" },
                { label: "Facilities", value: "facilities" },
              ]}
              defaultValue="room_service"
              handleChange={(e) => setDepartment(e.target.value)}
              required
            />

            <Select
              label="Role"
              items={[
                { label: "Admin", value: "hotel_admin" },
                { label: "Manager", value: "hotel_manager" },
                { label: "Supervisor", value: "hotel_supervisor" },
                { label: "Associate", value: "hotel_associate" },
                { label: "Trainee", value: "hotel_trainee" },
              ]}
              defaultValue="hotel_associate"
              handleChange={(e) => setRole(e.target.value)}
              required
            />
          </div>

          <Autocomplete
            required
            label="Reporting to"
            placeholder="Search staff by name, email or mobile"
            value={reportingTo}
            onSelect={(st) => setReportingTo(st)}
            fetcher={searchStaff}
            getDisplayValue={(st) => {
              const name = `${st.firstName} ${st.lastName}`.trim();

              const contact = [st.mobileNumber, st.email]
                .filter(Boolean)
                .join(" | ");

              const roles = [st.department, ...(st.roles || [])]
                .filter(Boolean)
                .map(toTitleCaseFromSnake)
                .join(", ");

              return [name, contact, roles].filter(Boolean).join(" || ");
            }}
            renderItem={(st) => (
              <div className="flex items-center gap-2">
                <span className="w-[30%] font-bold text-dark dark:text-gray-200">
                  {st.firstName} {st.lastName}
                </span>
                <span className="w-[40%] text-dark dark:text-gray-200">
                  {[st.mobileNumber, st.email].filter((t) => t).join(" | ")}
                </span>
                <span className="text-sm font-semibold text-dark dark:text-gray-200">
                  {[st.department, ...(st.roles || [])]
                    .filter(Boolean)
                    .map(toTitleCaseFromSnake)
                    .join(", ")}
                </span>
              </div>
            )}
            noResultsContent={
              <div className="flex items-center justify-between">
                <span>Staff not found</span>
              </div>
            }
          />

          <hr className="my-2" />

          {/* Summary */}
          <div className="rounded-2xl border border-gray-700 p-4 text-dark dark:text-white">
            <h3 className="text-md mb-3 font-semibold">Summary</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="text-md">
                <div>
                  <span>Name:</span>{" "}
                  <span className="font-semibold">
                    {[firstName, lastName]
                      .filter((n) => n)
                      .join(" ")
                      .trim() || "-"}
                  </span>
                </div>

                <div>
                  <span>Mobile:</span>{" "}
                  <span className="font-semibold">{mobileNumber || "-"}</span>
                </div>
                <div>
                  <span>Email:</span>{" "}
                  <span className="font-semibold">{email || "-"}</span>
                </div>
              </div>

              <div className="text-md">
                <div>
                  <span>Department: </span>
                  <span className="font-semibold">
                    {toTitleCaseFromSnake(department) || "-"}
                  </span>
                </div>
                <div>
                  <span>Role: </span>
                  <span className="font-semibold">
                    {toTitleCaseFromSnake(role) || "-"}
                  </span>
                </div>
                <div>
                  <span>Reporting to: </span>
                  <span className="font-semibold">
                    {reportingTo
                      ? [
                          `${reportingTo?.firstName} ${reportingTo?.lastName}`,
                          [
                            reportingTo?.department,
                            ...(reportingTo?.roles || []),
                          ]
                            .filter((e) => e)
                            .map(toTitleCaseFromSnake)
                            .join(", "),
                        ].join(" || ")
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-end gap-3">
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
    </div>
  );
}
