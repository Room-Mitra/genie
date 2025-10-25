export function Room({ room }) {
  return (
    <div className="inline-block rounded-md bg-cyan-600 p-2">
      <span className="text-md text-white dark:bg-cyan-600/20 dark:text-white">
        #{room.number} · {room.type} · {room.floor}F
      </span>
    </div>
  );
}
