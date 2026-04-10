export const ACCESS_PHONE_STORAGE_KEY = "schools_access_phone";

export function normalizePhone(input) {
  const digits = String(input || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length < 10) return "";
  return digits.slice(-10);
}

export function buildAccessHeaders(phone) {
  if (!phone) return {};
  return { "x-user-phone": phone };
}
