import { pickTextColor, stringToColor } from "@/lib/text";
import { cn } from "@/lib/utils";

export function Room({ room, wide }) {
  const bg = stringToColor(room.type || "Unknown");
  const text = pickTextColor(bg);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-sm font-medium",
        !wide && "max-w-[180px] sm:max-w-[200px]",
      )}
      style={{
        backgroundColor: bg,
        color: text,
      }}
    >
      <span>#{room.number}</span>
      <span>·</span>

      {/* Only Type truncates */}
      <span
        className="min-w-0 flex-1 truncate"
        title={room.type} // shows full type on hover
      >
        {room.type}
      </span>

      <span>· {room.floor}F</span>
    </div>
  );
}
