// @expo-router-ignore
import { isValid, parseISO } from "date-fns";

export interface DobValidationResult {
  ok: boolean;
  message: string;
}

/**
 * Validates registration DOB stored as Y-M-D (components may be unpadded while typing).
 */
export function validateDateOfBirth(dob: string | undefined | null): DobValidationResult {
  if (!dob || dob === "--" || /--$/.test(dob)) {
    return { ok: false, message: "Enter your full date of birth" };
  }

  const parts = dob.split("-");
  if (parts.length !== 3) {
    return { ok: false, message: "Enter your full date of birth" };
  }

  const [ys, ms, ds] = parts;
  if (!ys || !ms || !ds || ys.length !== 4) {
    return { ok: false, message: "Enter your full date of birth" };
  }

  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);

  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return { ok: false, message: "Use numbers only for day, month, and year" };
  }

  if (m < 1 || m > 12 || d < 1 || d > 31) {
    return { ok: false, message: "Enter a valid calendar date" };
  }

  const padded = `${ys}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const date = parseISO(padded);
  if (
    !isValid(date) ||
    date.getFullYear() !== y ||
    date.getMonth() + 1 !== m ||
    date.getDate() !== d
  ) {
    return { ok: false, message: "This date does not exist" };
  }

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  if (date > endOfToday) {
    return { ok: false, message: "Date of birth cannot be in the future" };
  }

  const oldest = new Date();
  oldest.setFullYear(oldest.getFullYear() - 120);
  if (date < oldest) {
    return { ok: false, message: "Please enter a realistic date of birth" };
  }

  const minAgeDate = new Date();
  minAgeDate.setFullYear(minAgeDate.getFullYear() - 13);
  if (date > minAgeDate) {
    return { ok: false, message: "You must be at least 13 years old" };
  }

  return { ok: true, message: "" };
}
