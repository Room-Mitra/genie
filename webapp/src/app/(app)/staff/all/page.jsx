"use client";

import { Department } from "@/components/ui/department";
import { ID } from "@/components/ui/id";
import { Roles } from "@/components/ui/roles";
import SortTable from "@/components/ui/sort-table";
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
      { key: "roles", label: "ROLE" },
      { key: "department", label: "DEPARTMENT" },
      { key: "mobileNumber", label: "MOBILE" },
      { key: "email", label: "EMAIL" },
      { key: "reportingTo", label: "REPORTS TO" },
    ],
    [],
  );

  const getStaffName = (s) =>
    s ? (
      <span>
        {s?.firstName} {s?.lastName}{" "}
        {s?.department ? (
          <span>
            (<Department department={s.department} />)
          </span>
        ) : (
          ``
        )}
      </span>
    ) : (
      <>-</>
    );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const staff = await fetchStaff();
        if (!cancelled)
          setData(
            staff?.items?.map((r) => ({
              userId: <ID ulid={r.userId} />,
              name: (
                <span>
                  {r.firstName} {r.lastName}
                </span>
              ),
              email: r.email,
              mobileNumber: r.mobileNumber || "-",
              department: <Department department={r.department} />,
              roles: <Roles roles={r.roles} />,
              reportingTo: getStaffName(
                staff?.items?.filter(
                  (s) => s.userId === r?.reportingToUserId,
                )?.[0],
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
    <div className="bg-white p-6 dark:bg-gray-dark">
      <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
        Staff
      </h2>

      <SortTable
        columns={columns}
        data={data}
        tableRowClassNames={["text-base font-medium text-dark dark:text-white"]}
        noDataMessage="No staff available"
        loading={loading}
      />
    </div>
  );
}
