"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Department } from "@/components/ui/department";
import { ID } from "@/components/ui/id";
import { Roles } from "@/components/ui/roles";
import SortTable from "@/components/ui/sort-table";
import User from "@/components/ui/user";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";

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

  const columns = useMemo(
    () => [
      { key: "userId", label: "USER ID" },
      { key: "name", label: "NAME" },
      { key: "department", label: "DEPARTMENT" },
      { key: "mobileNumber", label: "MOBILE" },
      { key: "email", label: "EMAIL" },
      { key: "reportingTo", label: "REPORTS TO" },
    ],
    [],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const staff = await fetchStaff();
        if (!cancelled)
          setData(
            staff?.items?.map((r) => ({
              userId: <ID ulid={r.userId}  size="xs"/>,
              name: <User user={r} onlyName={true} />,
              email: r.email,
              mobileNumber: r.mobileNumber || "-",
              department: (
                <Department department={r.department} roles={r.roles} />
              ),
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
            })),
          );
      } catch (err) {
        console.error("Error fetching staff:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
      <div className="w-fit rounded-[10px] bg-white p-6 dark:bg-gray-dark sm:w-full">
        <SortTable
          columns={columns}
          data={data}
          tableRowClassNames={[
            "text-base font-medium text-dark dark:text-white",
          ]}
          noDataMessage="No staff added"
          loading={loading}
        />
      </div>
    </div>
  );
}
