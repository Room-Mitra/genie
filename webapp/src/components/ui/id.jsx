export function ID({ ulid }) {
  return <span className="text-md text-gray-500">{ulid.slice(0, 8)}</span>;
}
