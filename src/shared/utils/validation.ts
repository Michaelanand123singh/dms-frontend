/**
 * Validation utilities
 */

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
}

export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isRequired(value: unknown): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

export function minLength(value: string, min: number): boolean {
  return value.length >= min;
}

export function maxLength(value: string, max: number): boolean {
  return value.length <= max;
}

export function isNumeric(value: string): boolean {
  return /^\d+$/.test(value);
}

export function isAlphanumeric(value: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(value);
}

/**
 * Validate Indian phone number (10 digits, allows +91 prefix)
 * @param phone - Phone number string
 * @returns true if valid 10-digit Indian phone number
 */
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-+]/g, "").replace(/^91/, "");
  return cleaned.length === 10 && /^\d{10}$/.test(cleaned);
}

/**
 * Clean phone number by removing spaces, dashes, and +91 prefix
 * @param phone - Phone number string
 * @returns Cleaned phone number (10 digits)
 */
export function cleanPhone(phone: string): string {
  return phone.replace(/[\s-+]/g, "").replace(/^91/, "");
}

/**
 * Validate email address format
 * @param email - Email string to validate
 * @returns true if valid email format
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate VIN (Vehicle Identification Number) - 17 alphanumeric characters
 * Excludes I, O, Q to avoid confusion with 1, 0
 * @param vin - VIN string to validate
 * @returns true if valid VIN format
 */
export function validateVIN(vin: string): boolean {
  return vin.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin);
}

