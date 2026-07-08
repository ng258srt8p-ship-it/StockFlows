/**
 * Convert strings to URL-friendly slugs.
 * Handles special characters, unicode, and edge cases.
 */

export interface SlugifyOptions {
  separator?: string;
  lowercase?: boolean;
  stripAccents?: boolean;
  maxLength?: number;
}

const defaultOptions: Required<SlugifyOptions> = {
  separator: "-",
  lowercase: true,
  stripAccents: true,
  maxLength: 0, // 0 means no limit
};

/**
 * Convert a string to a URL-friendly slug.
 * 
 * @param input - The string to convert
 * @param options - Optional configuration
 * @returns The slugified string
 */
export function slugify(
  input: string,
  options?: SlugifyOptions
): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  const mergedOptions = { ...defaultOptions, ...options };
  let slug = input;

  // Strip accents if requested
  if (mergedOptions.stripAccents) {
    slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // Convert to lowercase if requested
  if (mergedOptions.lowercase) {
    slug = slug.toLowerCase();
  }

  // Replace common special characters with the separator
  const specialChars = /[^\w\s-]/g;
  slug = slug.replace(specialChars, "");

  // Replace spaces and multiple separators with a single separator
  slug = slug.replace(/\s+/g, mergedOptions.separator);

  // Remove leading/trailing separators
  slug = slug.replace(new RegExp(`^${mergedOptions.separator}+|${mergedOptions.separator}+$`, "g"), "");

  // Remove consecutive separators
  const escapedSeparator = mergedOptions.separator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  slug = slug.replace(new RegExp(`(${escapedSeparator}){2,}`, "g"), mergedOptions.separator);

  // Truncate if maxLength is set
  if (mergedOptions.maxLength > 0 && slug.length > mergedOptions.maxLength) {
    slug = slug.substring(0, mergedOptions.maxLength).replace(/-$/, "");
  }

  return slug;
}

export default slugify;