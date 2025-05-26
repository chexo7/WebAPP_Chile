/**
 * Checks if a string is safe to use as a Firebase Realtime Database key.
 * Firebase keys cannot contain '.', '#', '$', '[', or ']'.
 * @param key The string to check.
 * @returns True if the key is safe, false otherwise.
 */
export const isFirebaseKeySafe = (key: string | undefined | null): boolean => {
  if (key === undefined || key === null || typeof key !== 'string') {
    return false; // Or true if an empty/null key is considered "safe" in your context
  }
  // Firebase keys cannot contain '.', '#', '$', '[', or ']'
  const forbiddenChars = /[.#$[\]]/;
  return !forbiddenChars.test(key);
};

/**
 * Sanitizes a string to be safe for use as a Firebase Realtime Database key.
 * Replaces forbidden characters ('.', '#', '$', '[', ']') with an underscore or removes them.
 * @param inputString The string to sanitize.
 * @param replacementChar The character to replace forbidden characters with. Defaults to '_'.
 * @returns A sanitized string safe for use as a Firebase key.
 */
export const sanitizeFirebaseKey = (inputString: string, replacementChar: string = '_'): string => {
  if (!inputString) return '';
  // Replace forbidden characters: '.', '#', '$', '[', ']'
  return inputString.replace(/[.#$[\]]/g, replacementChar);
};
