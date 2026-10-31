/** Query param key on PasswordAndSecurity route */
export const PASSWORD_SECURITY_FLOW_PARAM = "flow" as const;

export const PASSWORD_SECURITY_FLOWS = {
  PASSWORD: "password",
  WALLET: "wallet",
  BOTH: "both",
} as const;

export type PasswordSecurityFlow =
  (typeof PASSWORD_SECURITY_FLOWS)[keyof typeof PASSWORD_SECURITY_FLOWS];

export function parsePasswordSecurityFlow(
  raw: string | string[] | undefined
): PasswordSecurityFlow {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === PASSWORD_SECURITY_FLOWS.PASSWORD) {
    return PASSWORD_SECURITY_FLOWS.PASSWORD;
  }
  if (v === PASSWORD_SECURITY_FLOWS.WALLET) {
    return PASSWORD_SECURITY_FLOWS.WALLET;
  }
  return PASSWORD_SECURITY_FLOWS.BOTH;
}

export const PASSWORD_SECURITY_SCREEN_TITLES: Record<
  PasswordSecurityFlow,
  string
> = {
  [PASSWORD_SECURITY_FLOWS.PASSWORD]: "Account password",
  [PASSWORD_SECURITY_FLOWS.WALLET]: "Wallet code",
  [PASSWORD_SECURITY_FLOWS.BOTH]: "Password & wallet",
};
