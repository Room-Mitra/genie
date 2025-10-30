import {
  SparklesIcon,
  BellAlertIcon,
  UserGroupIcon,
  BriefcaseIcon,
  WrenchScrewdriverIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

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

export function Department({ department, reqType }) {
  if (!department) return <span>-</span>;

  const Label = DepartmentLabels[department] || department;
  const Icon = DepartmentIcons[department] || QuestionMarkCircleIcon;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <Icon className="h-6 w-6 text-gray-500" />

        <span className="font-medium text-gray-800 dark:text-gray-100">
          {Label}
        </span>
      </div>

      {reqType && (
        <span className="ml-6 mt-0.5 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          {reqType}
        </span>
      )}
    </div>
  );
}
