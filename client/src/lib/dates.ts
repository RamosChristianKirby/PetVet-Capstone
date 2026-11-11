export function formatDate(value: string, withTime = false) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Date unavailable";
  // Birth and vaccination dates are calendar dates, independent of the viewer's timezone.
  const display = withTime ? date : new Date(value.slice(0, 10) + "T12:00:00");
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" as const } : {}),
  }).format(display);
}
export function localDateTime(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
export const today = () => localDateTime().slice(0, 10);
