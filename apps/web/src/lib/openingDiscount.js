const DISCOUNT_PREFIX = "[discount]"

const LEGACY_DISCOUNT_PATTERNS = [
  /%/,
  /\$\s*\d/,
  /\boff\b/i,
  /\bdiscount\b/i,
  /\bpromo\b/i,
  /\bsale\b/i,
  /\bsave\b/i,
]

export function serializeOpeningDiscount(discount) {
  const trimmed = typeof discount === "string" ? discount.trim() : ""
  return trimmed ? `${DISCOUNT_PREFIX} ${trimmed}` : null
}

export function parseOpeningDiscount(description) {
  const trimmed = typeof description === "string" ? description.trim() : ""
  if (!trimmed) return ""

  if (trimmed.toLowerCase().startsWith(DISCOUNT_PREFIX)) {
    return trimmed.slice(DISCOUNT_PREFIX.length).trim()
  }

  return LEGACY_DISCOUNT_PATTERNS.some((pattern) => pattern.test(trimmed))
    ? trimmed
    : ""
}
