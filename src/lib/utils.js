export function maskUdise(code) {
  if (!code) return "-";
  const s = String(code).trim();
  if (s.length <= 6) return "******";
  return "******" + s.slice(6);
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
