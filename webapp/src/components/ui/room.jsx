export function Room({ room }) {
  return (
    <>
      <div className="flex flex-col items-center gap-2 md:flex-row">
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-xs text-white dark:bg-indigo-600/20 dark:text-indigo-300">
            #{room.number}
          </span>
          <span className="text-dark dark:text-gray-200">{room.type}</span>
        </div>
        <div className="text-md align-middle text-dark dark:text-gray-200">
          Floor: {room.floor}
        </div>
      </div>
    </>
  );
}
