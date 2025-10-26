export function Room({ room }) {
  return (
    <div className="inline-block rounded-full bg-cyan-600 px-3 py-2">
      <span className="text-md text-white">
        #{room.number} · {room.type} · {room.floor}F
      </span>
    </div>
  );
}
