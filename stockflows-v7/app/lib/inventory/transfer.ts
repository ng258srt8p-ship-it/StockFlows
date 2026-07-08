import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TransferLineItem {
  inventoryItemId: string;
  quantity: number;
}

interface CreateTransferParams {
  shopId: string;
  fromLocationId: string;
  toLocationId: string;
  items: TransferLineItem[];
  requestedBy: string;
  notes?: string;
}

/**
 * Transfers under this many total units are auto-approved.
 */
const TRANSFER_AUTO_APPROVE_THRESHOLD = 50;

// ---------------------------------------------------------------------------
// Transfer workflows
// ---------------------------------------------------------------------------

/**
 * Create a new stock transfer between two locations.
 *
 * Small transfers (below {@link TRANSFER_AUTO_APPROVE_THRESHOLD} units) are
 * automatically approved on creation.
 *
 * @param params.shopId         - Shop that owns both locations
 * @param params.fromLocationId - Source location
 * @param params.toLocationId   - Destination location
 * @param params.items          - Items and quantities to transfer
 * @param params.requestedBy    - Shopify user ID of the requester
 * @param params.notes          - Optional free-form notes
 * @returns The newly created StockTransfer record
 */
export async function createTransfer({
  shopId,
  fromLocationId,
  toLocationId,
  items,
  requestedBy,
  notes,
}: CreateTransferParams) {
  logger.info(
    { shopId, fromLocationId, toLocationId, itemCount: items.length },
    "createTransfer: starting",
  );

  if (fromLocationId === toLocationId) {
    throw new Error("Source and destination locations must be different");
  }

  if (items.length === 0) {
    throw new Error("At least one line item is required");
  }

  // Validate that source has enough stock for each item
  for (const item of items) {
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { id: item.inventoryItemId },
      select: { quantity: true, locationId: true },
    });

    if (!inventoryItem) {
      throw new Error(`Inventory item ${item.inventoryItemId} not found`);
    }

    if (inventoryItem.locationId !== fromLocationId) {
      throw new Error(
        `Item ${item.inventoryItemId} is not at the source location`,
      );
    }

    if (inventoryItem.quantity < item.quantity) {
      throw new Error(
        `Insufficient stock for item ${item.inventoryItemId}: ` +
          `available=${inventoryItem.quantity}, requested=${item.quantity}`,
      );
    }
  }

  const totalUnits = items.reduce((sum, li) => sum + li.quantity, 0);
  const status =
    totalUnits < TRANSFER_AUTO_APPROVE_THRESHOLD ? "APPROVED" : "PENDING";

  const transfer = await prisma.stockTransfer.create({
    data: {
      shopId,
      fromLocationId,
      toLocationId,
      status: status as any,
      lineItems: items as any,
      notes: notes ?? null,
      requestedBy,
      approvedBy: status === "APPROVED" ? requestedBy : null,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      shopId,
      userId: null,
      action: "inventory.transfer.create",
      entityType: "StockTransfer",
      entityId: transfer.id,
      newValue: {
        fromLocationId,
        toLocationId,
        totalUnits,
        status,
        lineItemCount: items.length,
      },
    },
  });

  logger.info(
    { transferId: transfer.id, status, totalUnits },
    "createTransfer: done",
  );
  return transfer;
}

/**
 * Approve a pending stock transfer.
 *
 * @param transferId - ID of the transfer to approve
 * @param approvedBy - Shopify user ID of the approver
 * @returns The updated StockTransfer record
 */
export async function approveTransfer(
  transferId: string,
  approvedBy: string,
) {
  logger.info({ transferId }, "approveTransfer: starting");

  const transfer = await prisma.stockTransfer.findUnique({
    where: { id: transferId },
  });

  if (!transfer) {
    throw new Error(`Transfer ${transferId} not found`);
  }

  if (transfer.status !== "PENDING") {
    throw new Error(
      `Cannot approve transfer in ${transfer.status} status (expected PENDING)`,
    );
  }

  const updated = await prisma.stockTransfer.update({
    where: { id: transferId },
    data: {
      status: "APPROVED",
      approvedBy,
    },
  });

  logger.info({ transferId }, "approveTransfer: done");
  return updated;
}

/**
 * Mark a transfer as shipped and deduct stock from the source location.
 *
 * Creates a TRANSFER_OUT StockMovement for each line item.
 *
 * @param transferId - ID of the transfer to ship
 * @returns The updated StockTransfer record
 */
export async function shipTransfer(transferId: string) {
  logger.info({ transferId }, "shipTransfer: starting");

  const transfer = await prisma.stockTransfer.findUnique({
    where: { id: transferId },
  });

  if (!transfer) {
    throw new Error(`Transfer ${transferId} not found`);
  }

  if (transfer.status !== "APPROVED") {
    throw new Error(
      `Cannot ship transfer in ${transfer.status} status (expected APPROVED)`,
    );
  }

  const lineItems = transfer.lineItems as unknown as TransferLineItem[];

  await prisma.$transaction(async (tx) => {
    for (const item of lineItems) {
      const inventoryItem = await tx.inventoryItem.findUnique({
        where: { id: item.inventoryItemId },
      });

      if (!inventoryItem) {
        throw new Error(`Inventory item ${item.inventoryItemId} not found`);
      }

      const newQty = inventoryItem.quantity - item.quantity;
      if (newQty < 0) {
        throw new Error(
          `Insufficient stock for item ${item.inventoryItemId}: ` +
            `available=${inventoryItem.quantity}, shipping=${item.quantity}`,
        );
      }

      await tx.inventoryItem.update({
        where: { id: item.inventoryItemId },
        data: {
          quantity: newQty,
          available: Math.max(0, newQty - inventoryItem.reserved),
        },
      });

      await tx.stockMovement.create({
        data: {
          inventoryItemId: item.inventoryItemId,
          locationId: transfer.fromLocationId,
          type: "TRANSFER_OUT",
          quantityChange: -item.quantity,
          reference: `transfer-${transferId}`,
          notes: `Shipped to location ${transfer.toLocationId}`,
          createdBy: transfer.requestedBy,
        },
      });
    }

    await tx.stockTransfer.update({
      where: { id: transferId },
      data: {
        status: "SHIPPED",
        shippedAt: new Date(),
      },
    });
  });

  logger.info({ transferId }, "shipTransfer: done");

  // Return refreshed record
  return prisma.stockTransfer.findUnique({ where: { id: transferId } });
}

/**
 * Mark a transfer as received and add stock to the destination location.
 *
 * Creates a TRANSFER_IN StockMovement for each line item.
 *
 * @param transferId - ID of the transfer to receive
 * @returns The updated StockTransfer record
 */
export async function receiveTransfer(transferId: string) {
  logger.info({ transferId }, "receiveTransfer: starting");

  const transfer = await prisma.stockTransfer.findUnique({
    where: { id: transferId },
  });

  if (!transfer) {
    throw new Error(`Transfer ${transferId} not found`);
  }

  if (transfer.status !== "SHIPPED") {
    throw new Error(
      `Cannot receive transfer in ${transfer.status} status (expected SHIPPED)`,
    );
  }

  const lineItems = transfer.lineItems as unknown as TransferLineItem[];

  await prisma.$transaction(async (tx) => {
    for (const item of lineItems) {
      const inventoryItem = await tx.inventoryItem.findFirst({
        where: {
          shopifyVariantId: (
            await tx.inventoryItem.findUnique({
              where: { id: item.inventoryItemId },
              select: { shopifyVariantId: true },
            })
          )?.shopifyVariantId ?? "",
          locationId: transfer.toLocationId,
        },
      });

      if (!inventoryItem) {
        throw new Error(
          `No matching inventory item at destination for ${item.inventoryItemId}`,
        );
      }

      const newQty = inventoryItem.quantity + item.quantity;

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
          locationId: transfer.toLocationId,
          type: "TRANSFER_IN",
          quantityChange: item.quantity,
          reference: `transfer-${transferId}`,
          notes: `Received from location ${transfer.fromLocationId}`,
          createdBy: transfer.requestedBy,
        },
      });
    }

    await tx.stockTransfer.update({
      where: { id: transferId },
      data: {
        status: "COMPLETED",
        receivedAt: new Date(),
      },
    });
  });

  logger.info({ transferId }, "receiveTransfer: done");

  // Return refreshed record
  return prisma.stockTransfer.findUnique({ where: { id: transferId } });
}
