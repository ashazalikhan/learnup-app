const IST_TIME_ZONE = "Asia/Kolkata";

export function formatInIst(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatTimeInIst(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    timeStyle: "medium",
  }).format(date);
}

/** Treat datetime-local value as clock time in Asia/Kolkata. */
export function istLocalInputToIso(local: string): string | null {
  const trimmed = local.trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    return null;
  }
  return `${trimmed}:00+05:30`;
}
