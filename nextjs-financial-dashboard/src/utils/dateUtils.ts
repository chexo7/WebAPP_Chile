/**
 * Formats a backup key (timestamp string) into a human-readable date and time string.
 * Example: "20230715-103055" becomes "15/07/2023, 10:30:55"
 * @param backupKey The backup key string.
 * @returns A formatted date and time string, or "Invalid Date" if the key is malformed.
 */
export const formatBackupKey = (backupKey: string): string => {
  if (!backupKey || typeof backupKey !== 'string' || !backupKey.includes('-')) {
    return "Invalid Key";
  }

  const parts = backupKey.split('-');
  if (parts.length !== 2) {
    return "Invalid Key Format";
  }

  const datePart = parts[0];
  const timePart = parts[1];

  if (datePart.length !== 8 || timePart.length !== 6) {
    return "Invalid DateTime Length";
  }

  const year = datePart.substring(0, 4);
  const month = datePart.substring(4, 6);
  const day = datePart.substring(6, 8);

  const hours = timePart.substring(0, 2);
  const minutes = timePart.substring(2, 4);
  const seconds = timePart.substring(4, 6);

  // Basic validation for numeric parts (more robust validation could be added)
  if (isNaN(parseInt(year)) || isNaN(parseInt(month)) || isNaN(parseInt(day)) ||
      isNaN(parseInt(hours)) || isNaN(parseInt(minutes)) || isNaN(parseInt(seconds))) {
    return "Non-Numeric DateTime Parts";
  }
  
  const date = new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);
  
  if (isNaN(date.getTime())) {
    // Fallback for browsers that might not parse the above format directly, or if parts are invalid
    // This is a simplified attempt and might not cover all edge cases.
    // A more robust solution would involve a date library or more careful parsing.
    const numYear = parseInt(year);
    const numMonth = parseInt(month) - 1; // Month is 0-indexed in JS Date
    const numDay = parseInt(day);
    const numHours = parseInt(hours);
    const numMinutes = parseInt(minutes);
    const numSeconds = parseInt(seconds);

    const manualDate = new Date(numYear, numMonth, numDay, numHours, numMinutes, numSeconds);
    if (isNaN(manualDate.getTime())) {
        return "Invalid Date";
    }
    return manualDate.toLocaleString('es-CL', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
    });
  }

  return date.toLocaleString('es-CL', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  });
};

/**
 * Converts a Date object or a date string to an ISO date string (YYYY-MM-DD).
 * @param date The Date object or string to convert.
 * @returns An ISO date string, or an empty string if the input is invalid.
 */
export const getISODateString = (date: Date | string | undefined | null): string => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch (error) {
    console.error("Error converting date to ISO string:", error);
    return '';
  }
};
