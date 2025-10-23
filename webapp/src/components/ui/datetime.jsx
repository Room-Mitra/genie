import { formatDateTime } from "@/lib/format-message-time";

export function DateTime({ dateTimeIso }) {
  return <span>{formatDateTime(dateTimeIso)}</span>;
}
