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

/** Strict week 1–16 (no parseInt trailing garbage). */
export function parseStrictWeek(weekRaw: string): number | null {
  const trimmed = weekRaw.trim();
  if (!/^\d{1,2}$/.test(trimmed)) return null;
  const weekNo = Number(trimmed);
  if (!Number.isInteger(weekNo) || weekNo < 1 || weekNo > 16) return null;
  return weekNo;
}

function istPartsFromLocal(local: string): {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
} | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local.trim());
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  const monthNum = Number(month);
  const dayNum = Number(day);
  const hourNum = Number(hour);
  const minuteNum = Number(minute);
  if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) return null;
  if (hourNum > 23 || minuteNum > 59) return null;
  return { year, month, day, hour, minute };
}

/** Treat datetime-local value as clock time in Asia/Kolkata; reject invalid calendar dates. */
export function istLocalInputToIso(local: string): string | null {
  const parts = istPartsFromLocal(local);
  if (!parts) return null;

  const iso = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:00+05:30`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const formatted = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const pick = (type: string) => formatted.find((p) => p.type === type)?.value ?? "";
  const fYear = pick("year");
  const fMonth = pick("month");
  const fDay = pick("day");
  const fHour = pick("hour");
  const fMinute = pick("minute");

  if (
    fYear !== parts.year ||
    fMonth !== parts.month ||
    fDay !== parts.day ||
    fHour !== parts.hour ||
    fMinute !== parts.minute
  ) {
    return null;
  }

  return iso;
}
