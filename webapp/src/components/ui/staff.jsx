import React from "react";
import { HotelRoleLabels } from "./roles";
import { DepartmentLabels } from "./department";

export default function Staff({ user }) {
  if (!user) return null;

  const { firstName, lastName, department, roles = [] } = user;
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const roleLabels = roles.filter(Boolean).map((r) => HotelRoleLabels[r]);

  const departmentLabels = [department]
    .filter(Boolean)
    .map((d) => DepartmentLabels[department]);

  const combined = [...departmentLabels, ...roleLabels].join(", ");
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {fullName || "Unnamed User"}
      </div>
      {combined && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {combined}
        </div>
      )}
    </div>
  );
}
