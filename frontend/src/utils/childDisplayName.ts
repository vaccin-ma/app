import type { TFunction } from 'i18next'

/** Patterns for "Child N" in EN, FR, AR (Western and Arabic numerals). */
const NUMBERED_CHILD_PATTERNS = [
  /^Child\s*(\d+)$/i,
  /^Enfant\s*(\d+)$/i,
  /^طفل\s*([\d٠-٩]+)$/,
]

const ARABIC_NUMERAL_MAP: Record<string, string> = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
}

function parseNumber(s: string): number {
  const normalized = s.replace(/[٠-٩]/g, (c) => ARABIC_NUMERAL_MAP[c] ?? c)
  const n = parseInt(normalized, 10)
  return Number.isNaN(n) ? 0 : n
}

/**
 * Returns the child display name in the current language.
 * If the stored name is "Child 1", "Enfant 1", or "طفل 1" (any language), returns the translated label (e.g. "Enfant 1" when locale is FR).
 */
export function getChildDisplayName(storedName: string, t: TFunction): string {
  const trimmed = storedName.trim()
  for (const pattern of NUMBERED_CHILD_PATTERNS) {
    const m = trimmed.match(pattern)
    if (m) {
      const n = parseNumber(m[1])
      if (n >= 1) return t('addChildModal.childNumber', { n })
    }
  }
  return storedName
}
