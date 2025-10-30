import { cn, toTitleCaseFromSnake } from "@/lib/utils";

export default function RequestStatus({ status }) {
  const color = {
    unacknowledged: "bg-orange-600",
    delayed: "bg-red",
    in_progress: "bg-yellow-600",
    completed: "bg-green-600",
  };

  return (
    <>
      <div
        className={cn(
          "inline-block rounded-full px-3 py-2 text-center",
          color[status],
        )}
      >
        <span className="text-md text-white">
          {toTitleCaseFromSnake(status)}
        </span>
      </div>
    </>
  );
}
