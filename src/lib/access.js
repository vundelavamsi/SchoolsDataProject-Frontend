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

export function getAccessScopeLabel(access) {
  const blockIds = Array.isArray(access?.blockIds) ? access.blockIds.filter(Boolean) : [];
  if (access?.scope === "blocks" && blockIds.length > 0) {
    return `${blockIds.length} block${blockIds.length === 1 ? "" : "s"} scope`;
  }
  return "global scope";
}

export function describeAccessState({ phone, access, error }) {
  const normalizedPhone = normalizePhone(phone || access?.phone || "");

  if (error) {
    return {
      kind: "error",
      headline: "Access check unavailable right now.",
      detail: "Please continue browsing schools and retry from Profile.",
    };
  }

  if (!normalizedPhone) {
    return {
      kind: "info",
      headline: "Guest access active.",
      detail: "School browsing is available. Enter your registered 10-digit phone number to check edit or review access.",
    };
  }

  if (!access?.authenticated) {
    return {
      kind: "warning",
      headline: "This phone number does not have access yet.",
      detail: `${normalizedPhone} is not registered for edit or review permissions. Please contact your administrator or continue browsing schools.`,
    };
  }

  const roleLabel = access.role === "review" ? "review" : "edit";
  const scopeLabel = getAccessScopeLabel(access);
  return {
    kind: "success",
    headline: `${normalizedPhone} verified for ${roleLabel} access.`,
    detail: `Role: ${roleLabel}. Scope: ${scopeLabel}.`,
  };
}
