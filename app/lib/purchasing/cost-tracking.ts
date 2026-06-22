import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LandedCostParams {
  shippingCost: number;
  customsDuties: number;
  otherCosts: number;
}

interface POCostSummary {
  subtotal: number;
  shippingCost: number;
  customsDuties: number;
  otherCosts: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Landed cost
// ---------------------------------------------------------------------------

/**
 * Calculate and allocate landed costs across all line items of a PO.
 *
 * The extra costs (shipping, customs duties, other) are distributed
 * proportionally based on each line item's share of the PO subtotal
 * (quantity * unitCost).
 *
 * The allocated landed cost is persisted on each POLineItem record.
 *
 * @param poId   - ID of the purchase order
 * @param params - Additional costs to allocate
 * @returns The updated PO with landed costs applied to each line item
 */
export async function calculateLandedCost(
  poId: string,
  { shippingCost, customsDuties, otherCosts }: LandedCostParams,
) {
  logger.info(
    { poId, shippingCost, customsDuties, otherCosts },
    "calculateLandedCost: starting",
  );

  const po = await prisma.purchaseOrder.findUnique({
    where: { id: poId },
    include: { POLineItem: true },
  });

  if (!po) {
    throw new Error(`Purchase order ${poId} not found`);
  }

  const lineItems = po.POLineItem;

  if (lineItems.length === 0) {
    throw new Error(`Purchase order ${poId} has no line items`);
  }

  // Calculate subtotal for each line item and the overall subtotal
  const lineItemSubtotals = lineItems.map((li) => ({
    id: li.id,
    subtotal: Number(li.unitCost) * li.quantity,
  }));

  const totalSubtotal = lineItemSubtotals.reduce(
    (sum, li) => sum + li.subtotal,
    0,
  );

  const totalExtraCosts = shippingCost + customsDuties + otherCosts;

  if (totalSubtotal === 0) {
    throw new Error("Cannot allocate landed costs: PO subtotal is zero");
  }

  // Allocate proportionally and update each line item
  await prisma.$transaction(async (tx) => {
    for (const liSubtotal of lineItemSubtotals) {
      const proportion = liSubtotal.subtotal / totalSubtotal;
      const allocatedExtra = totalExtraCosts * proportion;
      const landedCost = liSubtotal.subtotal + allocatedExtra;

      await tx.pOLineItem.update({
        where: { id: liSubtotal.id },
        data: {
          landedCost: Math.round(landedCost * 100) / 100, // round to 2 dp
        },
      });
    }

    // Persist the extra costs on the PO itself
    await tx.purchaseOrder.update({
      where: { id: poId },
      data: {
        shippingCost,
        customsDuties,
        otherCosts,
      },
    });
  });

  logger.info({ poId }, "calculateLandedCost: done");

  // Return refreshed PO
  return prisma.purchaseOrder.findUnique({
    where: { id: poId },
    include: { POLineItem: true },
  });
}

/**
 * Calculate the total cost of a purchase order.
 *
 * Sums all line item costs (quantity * unitCost) plus any shipping,
 * customs duties, and other costs stored on the PO.
 *
 * @param poId - ID of the purchase order
 * @returns Breakdown of costs with the total
 */
export async function getTotalPOCost(poId: string): Promise<POCostSummary> {
  logger.info({ poId }, "getTotalPOCost: starting");

  const po = await prisma.purchaseOrder.findUnique({
    where: { id: poId },
    include: {
      POLineItem: {
        select: { quantity: true, unitCost: true },
      },
    },
  });

  if (!po) {
    throw new Error(`Purchase order ${poId} not found`);
  }

  const subtotal = po.POLineItem.reduce(
    (sum, li) => sum + Number(li.unitCost) * li.quantity,
    0,
  );

  const shippingCost = Number(po.shippingCost ?? 0);
  const customsDuties = Number(po.customsDuties ?? 0);
  const otherCosts = Number(po.otherCosts ?? 0);

  const total = subtotal + shippingCost + customsDuties + otherCosts;

  const summary: POCostSummary = {
    subtotal,
    shippingCost,
    customsDuties,
    otherCosts,
    total,
  };

  logger.info({ poId, ...summary }, "getTotalPOCost: done");
  return summary;
}
