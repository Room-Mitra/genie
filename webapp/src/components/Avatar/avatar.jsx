import { stringToColor } from "@/lib/text";

function pickTextColor(hsl) {
  // Quick contrast check on lightness
  const m = /hsl\(\s*[\d.]+\s+([\d.]+)%\s+([\d.]+)%\s*\)/i.exec(hsl);
  const l = m ? Number(m[2]) : 70;
  return l > 60 ? "#1f2937" : "white"; // gray-800 or white
}

export function Avatar({ name, url, fallback, size = 32 }) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : fallback;

  const bg = stringToColor(name || fallback || "User");
  const text = pickTextColor(bg);

  return (
    <div
      className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full font-semibold"
      style={{
        backgroundColor: url ? "transparent" : bg,
        color: text,
      }}
    >
      {url ? (
        <img
          src={url}
          alt={name ? `${name} avatar` : "avatar"}
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
