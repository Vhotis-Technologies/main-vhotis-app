import { Seller } from "@/app/interfaces/main/Authentication";

/** Resolve store country from seller login payload. */
export const getStoreCountry = (
  user: Partial<Seller> | null | undefined
): string => {
  if (!user) return "";
  const country =
    user.business_country ||
    (typeof user.address === "object" && user.address?.country) ||
    "";
  return String(country).trim();
};

/** ISO currency code for Stripe / formatting (matches server get_currency). */
export const currencyCodeForCountry = (country?: string): "GBP" | "EUR" => {
  const normalized = (country || "").trim().toLowerCase();
  if (
    normalized === "united kingdom" ||
    normalized === "uk" ||
    normalized === "great britain"
  ) {
    return "GBP";
  }
  return "EUR";
};

/** Symbol for UI labels (not full formatted amounts). */
export const currencySymbolForCountry = (country?: string): string => {
  return currencyCodeForCountry(country) === "GBP" ? "£" : "€";
};

export const formatStoreMoney = (
  amount: number | string,
  country?: string
): string => {
  const value = typeof amount === "string" ? Number(amount) : amount;
  const code = currencyCodeForCountry(country);
  const locale = code === "GBP" ? "en-GB" : "en-IE";
  return value.toLocaleString(locale, {
    style: "currency",
    currency: code,
  });
};
