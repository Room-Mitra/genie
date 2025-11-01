import { cn } from "@/lib/utils";
import {
  SparklesIcon,
  BellAlertIcon,
  UserGroupIcon,
  BriefcaseIcon,
  WrenchScrewdriverIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { Roles } from "./roles";

export const DepartmentLabels = {
  house_keeping: "House Keeping",
  room_service: "Room Service",
  front_office: "Front Office",
  concierge: "Concierge",
  facilities: "Facilities",
};

const DepartmentIcons = {
  house_keeping: SparklesIcon,
  room_service: BellAlertIcon,
  front_office: UserGroupIcon,
  concierge: BriefcaseIcon,
  facilities: WrenchScrewdriverIcon,
};

const HotelRoleLabels = {
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

export function Department({ department, reqType, roles, size }) {
  if (!department) return <span>-</span>;

  const Label = DepartmentLabels[department] || department;
  const Icon = DepartmentIcons[department] || QuestionMarkCircleIcon;

  const sizeToText = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-md font-medium",
  };

  const sizeToImage = {
    xs: "h-4 w-4",
    sm: "h-5 w-5",
    md: "h-6 w-6",
  };

  return (
    <div className="flex w-45 items-start gap-2">
      <div>
        <Icon className={cn("text-gray-500", sizeToImage[size])} />
      </div>

      <div className="flex flex-col">
        <span
          className={cn("text-gray-800 dark:text-gray-100", sizeToText[size])}
        >
          {Label}
        </span>

        {reqType && (
          <span className="mt-0.5 inline-block w-fit rounded bg-gray-100 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            {reqType}
          </span>
        )}

        {roles && <Roles roles={roles} />}
      </div>
    </div>
  );
}
