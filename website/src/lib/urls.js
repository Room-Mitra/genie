export function absoluteUrl(path = '') {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://roommitra.com';
  return new URL(path, base).toString();
}
