import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared building blocks (from existing inventory schema)
// ---------------------------------------------------------------------------

/**
 * Accepts a numeric string from form data or a raw number.
 * Used because Remix formData always delivers strings.
 */
const numericString = z.union([z.string(), z.number()]);

/** A positive integer (quantity, reorder point, etc.) */
const positiveInt = z.coerce
  .number()
  .int("Must be a whole number.")
  .nonnegative("Must be zero or a positive integer.");

/** A strictly positive integer */
const strictPositiveInt = z.coerce
  .number()
  .int("Must be a whole number.")
  .positive("Must be a positive integer.");

/** A monetary amount (two decimal places, non-negative) */
const money = z.coerce
  .number()
  .nonnegative("Must be a non-negative amount.")
  .multipleOf(0.01, "Amount can have at most two decimal places.");

/** A non-negative integer */
const nonnegativeInt = z.coerce
  .number()
  .int("Must be a whole number.")
  .nonnegative("Quantity cannot be negative.");

/** A valid UUID */
const uuid = z.string().uuid("Must be a valid UUID.");

/** Phone number validation */
const phoneNumber = z
  .string()
  .regex(
    /^\+?[1-9]\d{1,14}$/,
    "Phone number must be in E.164 format (e.g., +1555xxxxxx).",
  )
  .or(z.string().min(10, "Phone number must be at least 10 characters.").max(20, "Phone number must be 20 characters or less."));

/** URL validation */
const webhookUrl = z
  .string()
  .url("Must be a valid URL.")
  .regex(
    /^https?:\/\//,
    "URL must be HTTP or HTTPS.",
  )
  .max(500, "URL must be 500 characters or less.");

// ---------------------------------------------------------------------------
// Settings validation schemas
// ---------------------------------------------------------------------------

export const PhoneNumbersSchema = z
  .string()
  .transform((val, ctx) => {
    if (!val || typeof val !== "string") return null;
    
    const numbers = val
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    
    // Validate each phone number
    const validNumbers = numbers.filter((n) => phoneNumber.safeParse(n).success);
    
    if (validNumbers.length === 0 && numbers.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "All phone numbers must be valid. Use E.164 format (e.g., +1555xxxxxx).",
      });
      return z.NEVER;
    }
    
    return validNumbers;
  })
  .pipe(
    z.array(phoneNumber).max(10, "You can specify up to 10 phone numbers.")
  )
  .nullish()
  .default(null);

export const SettingsFormSchema = z
  .object({
    lowStockThreshold: positiveInt
      .min(0, "Low stock threshold must be 0 or greater.")
      .max(100, "Low stock threshold cannot exceed 100."),
    
    criticalStockThreshold: positiveInt
      .min(0, "Critical stock threshold must be 0 or greater.")
      .max(50, "Critical stock threshold cannot exceed 50."),
    
    safetyStockMultiplier: z.coerce
      .number()
      .min(0.1, "Safety stock multiplier must be at least 0.1")
      .max(10, "Safety stock multiplier cannot exceed 10")
      .multipleOf(0.1, "Safety stock multiplier must be in increments of 0.1"),
    
    forecastHorizonDays: positiveInt
      .min(1, "Forecast horizon must be at least 1 day.")
      .max(365, "Forecast horizon cannot exceed 365 days."),
    
    emailAlerts: z.boolean(),
    
    slackWebhookUrl: webhookUrl
      .optional()
      .nullable()
      .transform((val) => val || null),
    
    smsPhoneNumbers: PhoneNumbersSchema,
    
    currency: z
      .enum(["USD", "EUR", "GBP", "CAD", "AUD"] as const)
      .default("USD"),
    
    enableAiInsights: z.boolean(),
    
    enableForecastExplanations: z.boolean(),
  })
  .strict()
  .refine(
    (data) => data.criticalStockThreshold < data.lowStockThreshold,
    {
      message: "Critical stock threshold must be lower than low stock threshold.",
      path: ["criticalStockThreshold"],
    }
  );

// Type exports for TypeScript
export type SettingsFormInput = z.output<typeof SettingsFormSchema>;
export type PhoneNumbersInput = NonNullable<z.output<typeof PhoneNumbersSchema>>;