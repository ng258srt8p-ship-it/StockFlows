/**
 * Email validation utility.
 * Uses a regex-based validator with optional deep checks.
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validate an email address.
 * 
 * @param email - The email string to validate
 * @returns ValidationResult with isValid flag and optional message
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== "string") {
    return { isValid: false, message: "Email is required" };
  }

  const trimmed = email.trim();

  if (trimmed.length === 0) {
    return { isValid: false, message: "Email is required" };
  }

  if (trimmed.length > 254) {
    return { isValid: false, message: "Email is too long" };
  }

  // Basic regex pattern for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, message: "Invalid email format" };
  }

  // Check for consecutive dots
  if (/\.\./.test(trimmed)) {
    return { isValid: false, message: "Email contains consecutive dots" };
  }

  // Check for dots at start/end of local part
  const localPart = trimmed.split("@")[0];
  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    return { isValid: false, message: "Email has invalid dot placement" };
  }

  // Check for valid TLD (at least 2 characters)
  const tld = trimmed.split("@")[1].split(".").pop();
  if (!tld || tld.length < 2) {
    return { isValid: false, message: "Invalid domain" };
  }

  return { isValid: true };
}

export default validateEmail;