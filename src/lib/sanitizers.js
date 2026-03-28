export function sanitizeText(value, { max = 500, preserveLines = false } = {}) {
  if (typeof value !== "string") {
    return "";
  }

  const normalized = preserveLines
    ? value.replace(/\r\n/g, "\n").replace(/[<>]/g, "").trim()
    : value.replace(/\s+/g, " ").replace(/[<>]/g, "").trim();

  return normalized.slice(0, max);
}

export function normalizeEmail(value) {
  return sanitizeText(value, { max: 120 }).toLowerCase();
}
