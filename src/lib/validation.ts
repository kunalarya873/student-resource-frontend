export function isEmail(value: string): boolean {
  // Pragmatic check — the backend does the authoritative validation.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export const MIN_PASSWORD_LENGTH = 8

export function passwordIssue(value: string): string | null {
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  return null
}
