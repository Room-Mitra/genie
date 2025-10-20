/** Helpers for scan pagination tokens */
export function encodeToken(key) {
  return key ? Buffer.from(JSON.stringify(key)).toString('base64') : undefined;
}
export function decodeToken(token) {
  return token ? JSON.parse(Buffer.from(token, 'base64').toString('utf8')) : undefined;
}
