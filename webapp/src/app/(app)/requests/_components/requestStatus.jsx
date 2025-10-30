import { cn, toTitleCaseFromSnake } from "@/lib/utils";

export default function RequestStatus({ status }) {
  const colorMap = {
    unacknowledged: "bg-orange-600/90 text-white",
    delayed: "bg-red-600/90 text-white",
    in_progress: "bg-yellow-500 text-black",
    completed: "bg-green-600/90 text-white",
  };

  const label = toTitleCaseFromSnake(status ?? "unknown");

  return (
    <span
      className={cn(
        "inline-flex select-none items-center justify-center whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium leading-none shadow-sm",
        colorMap[status] || "bg-gray-500 text-white",
      )}
    >
      {label}
    </span>
  );
}
