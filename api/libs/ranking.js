// utils/ranking.ts
export function keywordScore(q, item) {
  if (!q?.trim()) return 0;
  const query = q.toLowerCase();
  const hay = [
    item.name?.toLowerCase() || '',
    item.description?.toLowerCase() || '',
    (item.tags || []).join(' ').toLowerCase(),
  ].join(' ');
  // naive token hits
  return query.split(/\s+/).reduce((s, tok) => s + (hay.includes(tok) ? 1 : 0), 0);
}

export function cosineSim(a, b) {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

export function decodeBase64F32(b64) {
  const bin = Buffer.from(b64, 'base64');
  // Stored as little-endian Float32 array
  return new Float32Array(bin.buffer, bin.byteOffset, bin.byteLength / 4);
}
