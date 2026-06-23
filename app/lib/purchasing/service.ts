import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface POLineItemDraft {
  inventoryItemId: string;
  quantity: number;
  unitCost: number;
  notes?: string;
}

type POStatus =
  | "DRAFT"
  | "SENT"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "CLOSED"
  | "CANCELLED";

interface CreatePOParams {
  shopId: string;
  vendorId: string;
  locationId: string;
  poNumber: string;
  lineItems: POLineItemDraft[];
  expectedDate?: string;
  notes?: string;
  createdBy: string;
}

// ---------------------------------------------------------------------------
// PO operations
// ---------------------------------------------------------------------------

/**
 * Create a new purchase order with its line items.
 *
 * @param params.shopId      - Shop that owns the PO
 * @param params.vendorId    - Vendor for this order
 * @param params.locationId  - Destination location
 * @param params.poNumber    - Unique PO number for this shop
 * @param params.lineItems   - Items being ordered
 * @param params.expectedDate - Optional expected delivery date (ISO string)
 * @param params.notes       - Optional free-form notes
 * @param params.createdBy   - User ID of the PO creator
 * @returns The newly created PurchaseOrder with line items
 */
export async function createPO({
  shopId,
  vendorId,
  locationId,
  poNumber,
  lineItems,
  expectedDate,
  notes,
  createdBy,
}: CreatePOParams) {
  logger.info({ shopId, poNumber, lineItemCount: lineItems.length }, "createPO: starting");

  if (lineItems.length === 0) {
    throw new Error("At least one line item is required");
  }

  const po = await prisma.$transaction(async (tx) => {
    const order = await tx.purchaseOrder.create({
      data: {
        shopId,
        vendorId,
        locationId,
        poNumber,
        status: "DRAFT",
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        notes: notes ?? null,
        createdBy,
      },
    });

    await tx.pOLineItem.createMany({
      data: lineItems.map((li) => ({
        poId: order.id,
        inventoryItemId: li.inventoryItemId,
        quantity: li.quantity,
        unitCost: li.unitCost,
        notes: li.notes ?? null,
      })),
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        shopId,
        userId: createdBy,
        action: "purchasing.create",
        entityType: "PurchaseOrder",
        entityId: order.id,
        newValue: {
          poNumber,
          vendorId,
          locationId,
          lineItemCount: lineItems.length,
        },
      },
    });

    return order;
  });

  logger.info({ poId: po.id, poNumber }, "createPO: done");

  // Return PO with line items
  return prisma.purchaseOrder.findUnique({
    where: { id: po.id },
    include: { lineItems: true },
  });
}

/**
 * Update the status of a purchase order.
 *
 * @param poId   - ID of the PO to update
 * @param status - New status value
 * @returns The updated PurchaseOrder record
 */
export async function updatePOStatus(poId: string, status: POStatus) {
  logger.info({ poId, status }, "updatePOStatus: starting");

  const po = await prisma.purchaseOrder.findUnique({ where: { id: poId } });

  if (!po) {
    throw new Error(`Purchase order ${poId} not found`);
  }

  const data: any = { status };

  // Set receivedDate when transitioning to RECEIVED
  if (status === "RECEIVED") {
    data.receivedDate = new Date();
  }

  const updated = await prisma.purchaseOrder.update({
    where: { id: poId },
    data,
  });

  logger.info({ poId, oldStatus: po.status, newStatus: status }, "updatePOStatus: done");
  return updated;
}

/**
 * Fetch a purchase order with all related data: vendor, location, line
 * items (with inventory item details), and receiving events.
 *
 * @param poId - ID of the purchase order
 * @returns The PO with all relations, or null if not found
 */
export async function getPOWithDetails(poId: string) {
  logger.info({ poId }, "getPOWithDetails: starting");

  const po = await prisma.purchaseOrder.findUnique({
    where: { id: poId },
    include: {
      vendor: true,
      location: true,
      lineItems: {
        include: {
          inventoryItem: {
            select: {
              id: true,
              title: true,
              sku: true,
              quantity: true,
              locationId: true,
            },
          },
        },
      },
      receivingEvents: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  logger.info({ poId, found: !!po }, "getPOWithDetails: done");
  return po;
}
