import { ID } from "@/components/ui/id";
import { cn, toTitleCaseFromSnake } from "@/lib/utils";

export default function Status({ status, ulid }) {
  const colorMap = {
    //Request Status
    new: "bg-orange-600/90 text-white",
    unacknowledged: "bg-red-600/90 text-white",
    delayed: "bg-red-600/90 text-white",
    in_progress: "bg-yellow-500 text-black",
    completed: "bg-green-600/90 text-white",

    //Order status
    pending: "bg-orange-600/90 text-white",
    // delayed: "bg-red-600/90 text-white",
    preparing: "bg-yellow-500 text-black",
    delivered: "bg-green-600/90 text-white",
    scheduled: "bg-sky-600/90 text-white",
    cancelled: "bg-gray-500/90 text-white",
  };

  const label = toTitleCaseFromSnake(status ?? "unknown");

  return (
    <div className="mt-3 grid h-10 grid-rows-[1fr_auto]">
      <div className="place-self-center">
        <span
          className={cn(
            "inline-flex select-none items-center justify-center whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium leading-none shadow-sm",
            colorMap[status] || "bg-gray-500 text-white",
          )}
        >
          {label}
        </span>
      </div>
      <div className="mx-auto self-start text-center">
        <ID ulid={ulid} size="xs" withLabel={true} />
      </div>
    </div>
  );
}
