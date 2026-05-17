/**
 * Detects if any of the given patterns exist in the text (case-insensitive)
 *
 * @param text - Text to search in
 * @param patterns - Array of patterns to look for
 * @returns true if any pattern is found in the text
 */
export function detectKeyword(text: string, patterns: string[]): boolean {
  const lowerText = text.toLowerCase();
  return patterns.some(pattern => lowerText.includes(pattern.toLowerCase()));
}

/**
 * Detects a single keyword from a list of patterns, returning the first match
 *
 * @param text - Text to search in
 * @param patterns - Array of pattern tuples [pattern, value] to look for
 * @returns The value of the first matching pattern, or null if no match
 */
export function detectFirstKeyword<T>(text: string, patterns: [string, T][]): T | null {
  const lowerText = text.toLowerCase();
  for (const [pattern, value] of patterns) {
    if (lowerText.includes(pattern.toLowerCase())) {
      return value;
    }
  }
  return null;
}
