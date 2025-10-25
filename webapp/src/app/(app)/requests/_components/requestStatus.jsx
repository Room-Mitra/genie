import { cn, toTitleCaseFromSnake } from "@/lib/utils";

export default function RequestStatus({ status }) {
  const color = {
    unacknowledged: "bg-orange-500",
    delayed: "bg-red",
    in_progress: "bg-yellow-500",
    completed: "bg-green-500",
  };

  return (
    <>
      <div
        className={cn(
          "w-fit rounded-full bg-orange-500 px-3 py-2 font-medium text-white",
          color[status],
        )}
      >
        {toTitleCaseFromSnake(status)}
      </div>
    </>
  );
}
