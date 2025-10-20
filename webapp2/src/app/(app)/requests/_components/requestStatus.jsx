import { cn } from "@/lib/utils";

export default function RequestStatus({ status }) {
  const color = {
    Unacknowledged: "bg-orange-500",
    Delayed: "bg-red",
    "In progress": "bg-yellow-500",
    Completed: "bg-green-500",
  };

  return (
    <>
      <div
        className={cn(
          "rounded-full bg-orange-500 px-3 py-2 font-medium text-white w-fit",
          color[status],
        )}
      >
        {status}
      </div>
    </>
  );
}
