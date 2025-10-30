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

export function pickTextColor(hsl) {
  // Quick contrast check on lightness
  const m = /hsl\(\s*[\d.]+\s+([\d.]+)%\s+([\d.]+)%\s*\)/i.exec(hsl);
  const l = m ? Number(m[2]) : 70;
  return l > 60 ? "#1f2937" : "white"; // gray-800 or white
}
