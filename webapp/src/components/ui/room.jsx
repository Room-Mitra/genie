import { pickTextColor, stringToColor } from "@/lib/text";
import { cn } from "@/lib/utils";
import { TagIcon } from "@heroicons/react/24/outline";

export function Room({ room, wide }) {
  const bg = stringToColor(room?.type || "Unknown");
  const text = pickTextColor(bg);

  return room ? (
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
        className={cn(
          "flex-1 items-center text-center",
          wide ? "w-30" : "w-17",
        )}
      >
        <div className="flex items-center justify-center gap-1 text-center font-semibold">
          <TagIcon className="size-4" />
          <span className="truncate">{room.type}</span>
        </div>
      </span>

      <span>· {room.floor}F</span>
    </div>
  ) : (
    <div>---</div>
  );
}
