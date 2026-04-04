export function maskUdise(code) {
  if (!code) return "-";
  const s = String(code).trim();
  if (s.length <= 6) return "******";
  return "******" + s.slice(6);
}

export function buildUdise(blockCd, udiseschCode) {
  if (!udiseschCode) return "-";
  const s = String(udiseschCode).trim();
  const suffix = s.includes("******") ? s.replace("******", "") : (s.length > 6 ? s.slice(6) : s);
  const prefix = blockCd ? String(blockCd).trim() : "";
  if (prefix && suffix) return prefix + suffix;
  if (prefix) return prefix;
  return s;
}

export function formatClassRange(from, to) {
  if (!from && !to) return "-";
  if (from && to) return `${from} to ${to}`;
  return from || to;
}

export function displayValue(val, fallback = "—") {
  if (val === null || val === undefined || String(val).trim() === "") return fallback;
  return String(val).trim();
}
