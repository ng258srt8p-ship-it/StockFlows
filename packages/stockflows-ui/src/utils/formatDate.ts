/**
 * Format dates with various formats (relative, absolute).
 * Supports relative time display and configurable date formats.
 */

export type DateFormat = "relative" | "absolute" | "timeAgo" | "short" | "full";

export interface FormatDateOptions {
  format?: DateFormat;
  locale?: string;
  relativeThreshold?: number; // hours after which to switch from relative to absolute
}

const defaultOptions: Required<FormatDateOptions> = {
  format: "relative",
  locale: "en-US",
  relativeThreshold: 24, // 24 hours
};

export function formatDate(
  date: Date | string | number,
  options?: FormatDateOptions
): string {
  const mergedOptions = { ...defaultOptions, ...options };

  let dateObj: Date;
  try {
    dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }
  } catch (error) {
    return "Invalid Date";
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffHours = Math.abs(diffMs) / (1000 * 60 * 60);

  switch (mergedOptions.format) {
    case "relative":
      return formatRelative(dateObj, diffHours, mergedOptions.relativeThreshold);
    case "timeAgo":
      return formatTimeAgo(dateObj, diffHours);
    case "absolute":
      return dateObj.toLocaleDateString(mergedOptions.locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    case "short":
      return dateObj.toLocaleDateString(mergedOptions.locale, {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
      });
    case "full":
      return dateObj.toLocaleDateString(mergedOptions.locale, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    default:
      return formatRelative(dateObj, diffHours, mergedOptions.relativeThreshold);
  }
}

function formatRelative(
  date: Date,
  diffHours: number,
  threshold: number
): string {
  const isPast = date.getTime() < Date.now();

  if (diffHours < threshold) {
    return formatTimeAgo(date, diffHours);
  }

  if (isPast) {
    return "ago";
  }

  return "in the future";
}

function formatTimeAgo(date: Date, diffHours: number): string {
  const diffMinutes = Math.floor(diffHours * 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return "Just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}w ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months}mo ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years}y ago`;
  }
}

export default formatDate;