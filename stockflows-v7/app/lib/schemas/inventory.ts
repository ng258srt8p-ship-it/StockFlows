/**
 * Zod validation schemas for inventory operations.
 *
 * Reference: Research.md section 47.
 *
 * Three core operations:
 *   - AdjustInventorySchema   -- manual stock adjustments (damages, corrections)
 *   - CreatePurchaseOrderSchema -- creating a new PO with line items
 *   - CycleCountSchema        -- recording a physical cycle count
 *
 * These schemas are designed to be used with Remix action functions:
 *   const parsed = AdjustInventorySchema.safeParse(formData);
 *   if (!parsed.success) return json({ errors: parsed.error.flatten() }, 400);
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared building blocks
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

// ---------------------------------------------------------------------------
// AdjustInventorySchema
// ---------------------------------------------------------------------------

export const AdjustInventorySchema = z
  .object({
    /** The inventory item to adjust. */
    inventoryItemId: uuid,
    /** The location where the adjustment is happening. */
    locationId: uuid,
    /** Quantity change: positive for additions, negative for removals. */
    quantityChange: z.coerce
      .number()
      .int("Must be a whole number.")
      .refine((n) => n !== 0, "Quantity change cannot be zero."),
    /** Why the adjustment is being made. */
    reason: z.enum([
      "DAMAGE",
      "CYCLE_COUNT",
      "RECEIVING",
      "CORRECTION",
      "RETURN",
      "OTHER",
    ]),
    /** Free-text notes (optional). */
    notes: z
      .string()
      .max(500, "Notes must be 500 characters or fewer.")
      .optional()
      .default(""),
  })
  .strict();

export type AdjustInventoryInput = z.output<typeof AdjustInventorySchema>;

// ---------------------------------------------------------------------------
// CreatePurchaseOrderSchema
// ---------------------------------------------------------------------------

const POLineItemSchema = z
  .object({
    /** Which inventory item this line is for. */
    inventoryItemId: uuid,
    /** Quantity ordered. */
    quantity: strictPositiveInt,
    /** Cost per unit. */
    unitCost: money,
    /** Optional notes for this line item. */
    notes: z
      .string()
      .max(255, "Line notes must be 255 characters or fewer.")
      .optional()
      .default(""),
  })
  .strict();

export const CreatePurchaseOrderSchema = z
  .object({
    /** Vendor placing the order with. */
    vendorId: uuid,
    /** Destination location for the goods. */
    locationId: uuid,
    /** Human-readable PO number (must be unique per shop). */
    poNumber: z
      .string()
      .min(1, "PO number is required.")
      .max(50, "PO number must be 50 characters or fewer.")
      .regex(
        /^[A-Za-z0-9\-_]+$/,
        "PO number may only contain letters, numbers, hyphens, and underscores.",
      ),
    /** Expected delivery date. */
    expectedDate: z.coerce.date().optional(),
    /** Shipping cost. */
    shippingCost: money.optional().default(0),
    /** Customs duties. */
    customsDuties: money.optional().default(0),
    /** Other miscellaneous costs. */
    otherCosts: money.optional().default(0),
    /** Free-text notes. */
    notes: z
      .string()
      .max(1000, "Notes must be 1000 characters or fewer.")
      .optional()
      .default(""),
    /** At least one line item is required. */
    lineItems: z
      .array(POLineItemSchema)
      .min(1, "A purchase order must contain at least one line item.")
      .max(100, "A purchase order cannot contain more than 100 line items."),
  })
  .strict();

export type CreatePurchaseOrderInput = z.output<
  typeof CreatePurchaseOrderSchema
>;

// ---------------------------------------------------------------------------
// CycleCountSchema
// ---------------------------------------------------------------------------

const CycleCountItemSchema = z
  .object({
    /** The inventory item being counted. */
    inventoryItemId: uuid,
    /** The physically counted quantity. */
    countedQuantity: nonnegativeInt,
  })
  .strict();

export const CycleCountSchema = z
  .object({
    /** The location where the count is taking place. */
    locationId: uuid,
    /** Items counted and their quantities. */
    items: z
      .array(CycleCountItemSchema)
      .min(1, "A cycle count must include at least one item.")
      .max(500, "A cycle count cannot include more than 500 items."),
    /** Optional notes about the count. */
    notes: z
      .string()
      .max(1000, "Notes must be 1000 characters or fewer.")
      .optional()
      .default(""),
  })
  .strict();

export type CycleCountInput = z.output<typeof CycleCountSchema>;
