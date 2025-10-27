export function Room({ room }) {
  return (
    <div className="inline-flex max-w-[180px] items-center gap-1 rounded-full bg-cyan-600 px-3 py-2 sm:max-w-[200px]">
      <span className="text-md text-white">#{room.number}</span>
      <span className="text-md text-white">·</span>

      {/* Only Type truncates */}
      <span
        className="text-md min-w-0 flex-1 truncate text-white"
        title={room.type} // shows full type on hover
      >
        {room.type}
      </span>

      <span className="text-md text-white">· {room.floor}F</span>
    </div>
  );
}
