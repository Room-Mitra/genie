export function absoluteUrl(path = '') {
  console.log(process.env.NEXT_PUBLIC_SITE_URL);
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://roommitra.com';
  return new URL(path, base).toString();
}
