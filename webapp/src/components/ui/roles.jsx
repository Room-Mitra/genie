import { cn } from "@/lib/utils";

export const HotelRoleLabels = {
  hotel_admin: "Admin",
  hotel_manager: "Manager",
  hotel_associate: "Associate",
  hotel_trainee: "Trainee",
  hotel_supervisor: "Supervisor",
};

const RoleColors = {
  hotel_admin: "bg-indigo-500 text-white",
  hotel_manager: "bg-emerald-500 text-white",
  hotel_supervisor: "bg-amber-400 text-white/90",
  hotel_associate: "bg-sky-500 text-white",
  hotel_trainee: "bg-gray-400 text-white",
};

export function Roles({ roles }) {
  return roles?.length ? (
    <span>
      {roles &&
        roles.map((role) => (
          <div
            key={role}
            className={cn(
              "mt-0.5 inline-block w-fit rounded px-2 py-0.5 text-xs",
              RoleColors[role],
            )}
          >
            {HotelRoleLabels[role]}
          </div>
        ))}
    </span>
  ) : (
    <span>-</span>
  );
}
