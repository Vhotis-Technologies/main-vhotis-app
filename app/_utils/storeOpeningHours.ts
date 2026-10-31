import { StoreOpeningHours } from "@/app/interfaces/main/StoreFrontInterface";

/** Matches seller settings placeholders when the store has not saved custom hours. */
export const DEFAULT_STORE_OPENING_HOURS: StoreOpeningHours = {
  weekday_open: "09:00",
  weekday_close: "18:00",
  weekend_open: "10:00",
  weekend_close: "16:00",
};

const formatTimeRange = (
  open: string | null | undefined,
  close: string | null | undefined
): string | null => {
  const o = open?.trim();
  const c = close?.trim();
  if (o && c) return `${o} – ${c}`;
  if (o) return `from ${o}`;
  if (c) return `until ${c}`;
  return null;
};

/** Human-readable opening hours for the storefront header. */
export const formatOpeningHoursLabel = (
  hours: StoreOpeningHours | null | undefined
): string | null => {
  if (!hours) return null;

  const parts: string[] = [];
  const weekday = formatTimeRange(hours.weekday_open, hours.weekday_close);
  const weekend = formatTimeRange(hours.weekend_open, hours.weekend_close);

  if (weekday) parts.push(`Mon–Fri ${weekday}`);
  if (weekend) parts.push(`Sat–Sun ${weekend}`);

  return parts.length > 0 ? parts.join(" · ") : null;
};
