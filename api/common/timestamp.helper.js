/** Normalize to ISO string for lexicographic sort (helper if needed) */
export function toIsoString(input) {
  if (!input) return new Date().toISOString();
  if (typeof input === 'number') return new Date(input).toISOString();
  if (input instanceof Date) return input.toISOString();
  return new Date(input).toISOString();
}
