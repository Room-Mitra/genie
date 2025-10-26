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
      <div className={cn("inline-block rounded-full px-3 py-2", color[status])}>
        <span className="text-md text-white">
          {toTitleCaseFromSnake(status)}
        </span>
      </div>
    </>
  );
}
