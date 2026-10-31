// @expo-router-ignore
import type { RegistrationFormData } from "@/app/interfaces/others/OnboardingInterfaces";

const stripNonDigits = (s: string) => s.replace(/\D/g, "");

function parseApiCoordinate(
  value: string | undefined
): number | undefined {
  if (value === undefined || value === null) return undefined;
  const t = String(value).trim();
  if (t === "") return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Builds the international phone string expected by the API (e.g. +353851234567).
 * If the user already entered a leading + in `phone`, it is used as-is (seller flow).
 */
export function toInternationalPhone(data: RegistrationFormData): string {
  const raw = (data.phone || "").trim();
  if (raw.startsWith("+")) {
    return raw.replace(/\s/g, "");
  }
  const dial = (data.phoneCountryCode || "").trim() || "+1";
  let digits = stripNonDigits(raw);
  if ((dial === "+44" || dial === "+353") && digits.startsWith("0")) {
    digits = digits.replace(/^0+/, "");
  }
  return `${dial}${digits}`;
}

export function validateNationalPhoneInput(
  phone: string | undefined,
  dialCode: string | undefined
): { ok: boolean; message: string } {
  const raw = (phone || "").trim();
  if (raw.startsWith("+")) {
    const digits = stripNonDigits(raw.slice(1));
    if (digits.length < 8) {
      return { ok: false, message: "Enter a complete phone number with country code" };
    }
    return { ok: true, message: "" };
  }
  if (!(dialCode || "").trim()) {
    return { ok: false, message: "Select a country code for your phone number" };
  }
  const digits = stripNonDigits(raw);
  if (digits.length < 6) {
    return { ok: false, message: "Enter a valid phone number" };
  }
  return { ok: true, message: "" };
}

export type RegistrationApiPayload = Omit<
  RegistrationFormData,
  "phoneCountryCode" | "latitude" | "longitude"
> & {
  phone: string;
  latitude?: number;
  longitude?: number;
};

/** Body for onboarding APIs: E.164 `phone` without `phoneCountryCode`; numeric lat/lng when set. */
export function toRegistrationApiBody(
  data: RegistrationFormData
): RegistrationApiPayload {
  const { phoneCountryCode, latitude, longitude, ...rest } = data;
  void phoneCountryCode;
  const lat = parseApiCoordinate(latitude);
  const lng = parseApiCoordinate(longitude);
  const out: RegistrationApiPayload = {
    ...rest,
    phone: toInternationalPhone(data),
  };
  if (lat !== undefined && lng !== undefined) {
    out.latitude = lat;
    out.longitude = lng;
  }
  return out;
}
