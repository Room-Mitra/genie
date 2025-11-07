import { pickTextColor, stringToColor } from "@/lib/text";
import { cn } from "@/lib/utils";
import { TagIcon } from "@heroicons/react/24/outline";

export function Room({ room, wide }) {
  const bg = stringToColor(room?.type || "Unknown");
  const text = pickTextColor(bg);

  return room ? (
    <div
      className={cn(
        "inline-flex min-w-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-sm font-medium",
        !wide && "max-w-[180px] sm:max-w-[200px]",
      )}
      style={{
        backgroundColor: bg,
        color: text,
      }}
    >
      <span className="whitespace-nowrap">#{room.number}</span>
      <span>·</span>

      {/* Type section with truncation */}
      <div className="flex min-w-0 flex-shrink items-center gap-1 overflow-hidden">
        <TagIcon className="size-4 flex-shrink-0" />
        <span className="truncate">{room.type}</span>
      </div>

      <span className="whitespace-nowrap">· {room.floor}F</span>
    </div>
  ) : (
    <div>---</div>
  );
}
