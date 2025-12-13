/**
 * Date utilities
 */

export function formatDate(date: Date | string, format: "short" | "long" | "iso" = "short"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (format === "iso") {
    return dateObj.toISOString();
  }

  if (format === "long") {
    return dateObj.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return dateObj.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

export function isPast(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj < new Date();
}

export function isFuture(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj > new Date();
}

export function addDays(date: Date | string, days: number): Date {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const result = new Date(dateObj);
  result.setDate(result.getDate() + days);
  return result;
}

export function getDaysDifference(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get current time in HH:mm format (24-hour)
 * @returns Current time as string in HH:mm format
 */
export function getCurrentTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Get current date in YYYY-MM-DD format
 * @returns Current date as string in ISO date format
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get minimum time for a date picker (current time if today, undefined for future dates)
 * @param selectedDate - Date string in YYYY-MM-DD format
 * @returns Minimum time string in HH:mm format or undefined
 */
export function getMinTime(selectedDate: string): string | undefined {
  if (isToday(selectedDate)) {
    return getCurrentTime();
  }
  return undefined; // No restriction for future dates
}

/**
 * Format 24-hour time string to 12-hour format with AM/PM
 * @param time24 - Time string in HH:mm format (24-hour)
 * @returns Formatted time string in hh:mm AM/PM format
 */
export function formatTime24(time24: string): string {
  const [hours, minutes] = time24.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Convert 12-hour time string with AM/PM to 24-hour format (HH:mm)
 * @param time12 - Time string in hh:mm AM/PM format (12-hour)
 * @returns Time string in HH:mm format (24-hour)
 */
export function parseTime12To24(time12: string): string {
  if (!time12) return "";
  
  // If already in 24-hour format (HH:mm), return as is
  if (/^\d{2}:\d{2}$/.test(time12.trim())) {
    return time12.trim();
  }
  
  // Parse 12-hour format (hh:mm AM/PM)
  const match = time12.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) {
    // If format doesn't match, try to return as is or return empty
    return "";
  }
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = match[3].toUpperCase();
  
  if (ampm === "PM" && hours !== 12) {
    hours += 12;
  } else if (ampm === "AM" && hours === 12) {
    hours = 0;
  }
  
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

