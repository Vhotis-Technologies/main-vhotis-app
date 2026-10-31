// @expo-router-ignore
import type { Country, IntlDirectDialingCode } from "world-countries";
import countriesData from "world-countries";

export interface CountryDialOption {
  iso2: string;
  name: string;
  dialCode: string;
}

/**
 * Derive a single international dial prefix from world-countries `idd`.
 * NANP (+1) lists many 3-digit area codes as suffixes — the country code is still +1.
 */
export function dialCodeFromIdd(idd: IntlDirectDialingCode): string | null {
  if (!idd?.root) return null;
  const { root, suffixes } = idd;
  if (!suffixes?.length) return root;
  if (root === "+1" && suffixes.every((s) => /^\d{3}$/.test(s))) {
    return "+1";
  }
  return `${root}${suffixes.join("")}`;
}

function buildOptions(): CountryDialOption[] {
  const map = new Map<string, CountryDialOption>();

  (countriesData as Country[]).forEach((c) => {
    const dialCode = dialCodeFromIdd(c.idd);
    if (!dialCode) return;
    const name = c.name?.common || c.cca2;
    const key = `${dialCode}-${c.cca2}`;
    if (!map.has(key)) {
      map.set(key, { iso2: c.cca2, name, dialCode });
    }
  });

  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}

let cached: CountryDialOption[] | null = null;

export function getCountryDialOptions(): CountryDialOption[] {
  if (!cached) cached = buildOptions();
  return cached;
}

export function getDialCodeForRegion(iso2: string | undefined): string {
  if (!iso2) return "+1";
  const upper = iso2.toUpperCase();
  const match = (countriesData as Country[]).find((c) => c.cca2 === upper);
  if (!match) return "+1";
  return dialCodeFromIdd(match.idd) || "+1";
}
