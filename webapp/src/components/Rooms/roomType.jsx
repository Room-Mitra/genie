import { stringToColor } from "@/lib/text";
import { cn } from "@/lib/utils";
import { TagIcon } from "@heroicons/react/24/outline";

export function RoomNumberType({ number, type }) {
  const textColor = stringToColor(type || "Unknown");

  return (
    <div className="flex min-w-0 flex-col">
      <div
        className={cn("truncate font-semibold tracking-tight ...", "text-lg")}
        style={{ color: textColor }}
      >
        #{number}
      </div>

      <div
        className="flex items-center gap-1 text-xs font-semibold"
        style={{ color: textColor }}
      >
        <TagIcon className="size-4" />
        <span className="truncate">{type}</span>
      </div>
    </div>
  );
}
