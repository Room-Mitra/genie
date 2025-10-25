import { DateTime } from "./datetime";

export function Dates({ requestedAt, estimatedTimeOfFulfillment }) {
  return (
    <div className="flex flex-col gap-1">
      <div>
        <span className="text-sm">Due: </span>
        <span className="font-semibold">
          <DateTime dateTimeIso={estimatedTimeOfFulfillment} />
        </span>
      </div>
      <div>
        <span className="text-sm">Req: </span>
        <span className="font-semibold">
          <DateTime dateTimeIso={requestedAt} />
        </span>
      </div>
    </div>
  );
}
