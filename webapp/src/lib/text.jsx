export function stringToColor(str) {
  if (!str) return "#9CA3AF"; // default gray
  // Fast deterministic HSL
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  const s = 60; // keep readable
  const l = 70; // light bg
  return `hsl(${h} ${s}% ${l}%)`; // pastel-like color
}
