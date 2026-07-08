import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReceivedItem {
  poLineItemId: string;
  quantityReceived: number;
}

interface POProgress {
  totalItems: number;
  receivedItems: number;
  percentComplete: number;
}

// ---------------------------------------------------------------------------
// Receiving workflows
// ---------------------------------------------------------------------------

/**
 * Receive items against a purchase order.
 *
 * Updates the `receivedQty` on each line item, creates a ReceivingEvent,
 * and auto-updates the PO status based on how much has been received
 * (PARTIALLY_RECEIVED when some remain, RECEIVED when all are in).
 *
 * Also creates stock movements and updates inventory quantities at the
 * PO's destination location.
 *
 * @param poId         - ID of the purchase order
 * @param receivedItems - Array of { poLineItemId, quantityReceived }
 * @param receivedBy   - Shopify user ID of the person receiving
 * @returns The updated PurchaseOrder record
 */
export async function receiveLineItems(
  poId: string,
  receivedItems: ReceivedItem[],
  receivedBy: string,
) {
  logger.info(
    { poId, itemCount: receivedItems.length },
    "receiveLineItems: starting",
  );

  if (receivedItems.length === 0) {
    throw new Error("At least one received item is required");
  }

  const po = await prisma.purchaseOrder.findUnique({
    where: { id: poId },
    include: { lineItems: true },
  });

  if (!po) {
    throw new Error(`Purchase order ${poId} not found`);
  }

  await prisma.$transaction(async (tx) => {
    for (const received of receivedItems) {
      const lineItem = po.lineItems.find(
        (li) => li.id === received.poLineItemId,
      );

      if (!lineItem) {
        throw new Error(
          `Line item ${received.poLineItemId} not found on PO ${poId}`,
        );
      }

      const newReceivedQty = lineItem.receivedQty + received.quantityReceived;

      if (newReceivedQty > lineItem.quantity) {
        throw new Error(
          `Cannot receive ${received.quantityReceived} for line item ${received.poLineItemId}: ` +
            `would exceed ordered quantity (${lineItem.quantity}, already received ${lineItem.receivedQty})`,
        );
      }

      // Update the line item's received quantity
      await tx.pOLineItem.update({
        where: { id: received.poLineItemId },
        data: { receivedQty: newReceivedQty },
      });

      // Update inventory at the PO's destination location
      const inventoryItem = await tx.inventoryItem.findFirst({
        where: {
          id: lineItem.inventoryItemId,
          locationId: po.locationId,
        },
      });

      if (inventoryItem) {
        const newQty = inventoryItem.quantity + received.quantityReceived;

        await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            quantity: newQty,
            available: Math.max(0, newQty - inventoryItem.reserved),
          },
        });

        await tx.stockMovement.create({
          data: {
            inventoryItemId: inventoryItem.id,
            locationId: po.locationId,
            type: "RECEIVING",
            quantityChange: received.quantityReceived,
            reference: `po-${po.poNumber}`,
            notes: `Received against PO ${po.poNumber}`,
            createdBy: receivedBy,
          },
        });
      }
    }

    // Create ReceivingEvent
    await tx.receivingEvent.create({
      data: {
        poId,
        lineItems: receivedItems as any,
        receivedBy,
        notes: null,
      },
    });
  });

  // Determine new PO status
  const updatedPO = await tx_getPOProgress(poId);

  let newStatus: string;
  if (updatedPO.percentComplete >= 100) {
    newStatus = "RECEIVED";
  } else {
    newStatus = "PARTIALLY_RECEIVED";
  }

  await prisma.purchaseOrder.update({
    where: { id: poId },
    data: {
      status: newStatus as any,
      receivedDate: newStatus === "RECEIVED" ? new Date() : null,
    },
  });

  logger.info(
    { poId, newStatus, percentComplete: updatedPO.percentComplete },
    "receiveLineItems: done",
  );

  return prisma.purchaseOrder.findUnique({
    where: { id: poId },
    include: { lineItems: true },
  });
}

/**
 * Calculate the receiving progress for a purchase order.
 *
 * @param poId - ID of the purchase order
 * @returns Progress summary with total line items, how many are fully
 *   received, and the overall percent complete
 */
export async function calculatePOProgress(poId: string): Promise<POProgress> {
  logger.info({ poId }, "calculatePOProgress: starting");

  const lineItems = await prisma.pOLineItem.findMany({
    where: { poId },
    select: { quantity: true, receivedQty: true },
  });

  const totalItems = lineItems.length;
  const receivedItems = lineItems.filter(
    (li) => li.receivedQty >= li.quantity,
  ).length;

  const totalQuantity = lineItems.reduce((sum, li) => sum + li.quantity, 0);
  const receivedQuantity = lineItems.reduce(
    (sum, li) => sum + li.receivedQty,
    0,
  );

  const percentComplete =
    totalQuantity > 0
      ? Math.round((receivedQuantity / totalQuantity) * 100)
      : 0;

  const progress: POProgress = {
    totalItems,
    receivedItems,
    percentComplete,
  };

  logger.info({ poId, ...progress }, "calculatePOProgress: done");
  return progress;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Internal helper to fetch PO progress. Used within transactions where we
 * need fresh data but cannot call the public function (which uses a
 * separate prisma client call outside the tx).
 */
async function tx_getPOProgress(poId: string): Promise<POProgress> {
  const lineItems = await prisma.pOLineItem.findMany({
    where: { poId },
    select: { quantity: true, receivedQty: true },
  });

  const totalItems = lineItems.length;
  const receivedItems = lineItems.filter(
    (li) => li.receivedQty >= li.quantity,
  ).length;

  const totalQuantity = lineItems.reduce((sum, li) => sum + li.quantity, 0);
  const receivedQuantity = lineItems.reduce(
    (sum, li) => sum + li.receivedQty,
    0,
  );

  const percentComplete =
    totalQuantity > 0
      ? Math.round((receivedQuantity / totalQuantity) * 100)
      : 0;

  return { totalItems, receivedItems, percentComplete };
}
