import {
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowLeftEndOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { DateTime } from "./datetime";

export function Dates({
  requestedAt,
  estimatedTimeOfFulfillment,
  timeOfFulfillment,
  checkInTime,
  checkOutTime,
}) {
  const requested = new Date(requestedAt);
  const fulfilled = timeOfFulfillment ? new Date(timeOfFulfillment) : null;

  // Compute duration between request and fulfillment
  let durationText = null;
  if (fulfilled && requested) {
    const diffMs = fulfilled - requested;
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 60) durationText = `${diffMins} min`;
    else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      durationText = `${hours}h${mins > 0 ? ` ${mins}m` : ""}`;
    }
  }

  return (
    <div className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
      {/* Requested */}
      {requestedAt && (
        <div className="flex items-center justify-start gap-1">
          <ClockIcon className="h-5 w-5 text-gray-500" />
          <span>Req:</span>
          <span className="font-medium text-gray-800 dark:text-gray-100">
            <DateTime dateTimeIso={requestedAt} />
          </span>
        </div>
      )}

      {/* Due */}
      {estimatedTimeOfFulfillment && (
        <div className="flex items-center gap-1">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>Due:</span>
          <span className="font-medium text-gray-800 dark:text-gray-100">
            <DateTime dateTimeIso={estimatedTimeOfFulfillment} />
          </span>
        </div>
      )}

      {/* Completed + Duration */}
      {fulfilled && (
        <>
          <div className="flex items-center gap-1">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <span>Fin:</span>
            <span className="font-medium text-gray-800 dark:text-gray-100">
              <DateTime dateTimeIso={timeOfFulfillment} />
            </span>
          </div>

          {durationText && (
            <div className="flex items-center gap-1">
              <span className="ml-2 inline-flex items-center rounded-full bg-indigo-500 px-2 py-0.5 text-xs font-medium text-white dark:bg-indigo-900">
                ⏱ {durationText}
              </span>
            </div>
          )}
        </>
      )}

      {/* Check-in */}
      {checkInTime && (
        <div className="flex items-center gap-1">
          <ArrowLeftEndOnRectangleIcon className="h-5 w-5 text-blue-500" />
          <span>Check-in:</span>
          <span className="font-medium text-gray-800 dark:text-gray-100">
            <DateTime dateTimeIso={checkInTime} />
          </span>
        </div>
      )}

      {/* Check-out */}
      {checkOutTime && (
        <div className="flex items-center gap-1">
          <ArrowRightStartOnRectangleIcon className="h-5 w-5 text-indigo-500" />
          <span>Check-out:</span>
          <span className="font-medium text-gray-800 dark:text-gray-100">
            <DateTime dateTimeIso={checkOutTime} />
          </span>
        </div>
      )}
    </div>
  );
}
