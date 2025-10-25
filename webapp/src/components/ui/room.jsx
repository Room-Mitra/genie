import { isNumber } from "util";

export function Room({ room }) {
  const getFloorDesc = (fl) => {
    const floor = Number(fl);
    if (floor % 10 === 1) return `${floor}st floor`;
    else if (floor % 10 === 2) return `${floor}nd floor`;
    else if (floor % 10 === 3) return `${floor}rd floor`;
    else if (floor > 3) return `${floor}th floor`;
    else return `${floor} floor`;
  };
  return (
    <>
      <div className="grid grid-cols-1 items-center gap-2 md:flex-row">
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-xs text-white dark:bg-indigo-600/20 dark:text-indigo-300">
            #{room.number}
          </span>
          <span className="text-dark dark:text-gray-200">{room.type}</span>
        </div>
        <div className="text-md align-middle text-dark dark:text-gray-200">
          {getFloorDesc(room.floor)}
        </div>
      </div>
    </>
  );
}
