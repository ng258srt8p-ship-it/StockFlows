import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const AdjustmentSchema = z.object({
  barcode: z.string().min(1, "Barcode is required"),
  locationId: z.string().optional(),
  quantityChange: z.number().int("Quantity must be an integer"),
  reason: z.string().optional(),
  reference: z.string().optional(),
});

type AdjustmentInput = z.infer<typeof AdjustmentSchema>;

// ---------------------------------------------------------------------------
// GET /app/api/inventory — List inventory items
// ---------------------------------------------------------------------------

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = (await authenticate.admin(request)) as any;
  const shopDomain: string = session.shop;

  const log = logger.child({
    shopDomain,
    endpoint: "app.api.inventory",
    method: "GET",
  });

  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";
  const locationId = url.searchParams.get("locationId") ?? "";
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "50"), 200);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? "0"), 0);

  log.debug("Listing inventory items", { search, locationId, limit, offset });

  // Resolve shop
  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: shopDomain },
    select: { id: true },
  });

  if (!shop) {
    return json({ error: "Shop not found" }, { status: 404 });
  }

  const where: any = { shopId: shop.id };

  if (locationId) {
    where.locationId = locationId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { barcode: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.inventoryItem.findMany({
      where,
      include: { location: { select: { id: true, name: true } } },
      orderBy: { updatedAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.inventoryItem.count({ where }),
  ]);

  return json({
    items,
    total,
    limit,
    offset,
  });
};

// ---------------------------------------------------------------------------
// POST /app/api/inventory — Quick stock adjustment (barcode scanner)
// ---------------------------------------------------------------------------

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const { session } = (await authenticate.admin(request)) as any;
  const shopDomain: string = session.shop;

  const log = logger.child({
    shopDomain,
    endpoint: "app.api.inventory",
    method: "POST",
  });

  // Validate request body
  const body = await request.json();
  const parsed = AdjustmentSchema.safeParse(body);

  if (!parsed.success) {
    log.warn({ errors: parsed.error.flatten() }, "Validation failed");
    return json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { barcode, locationId, quantityChange, reason, reference } =
    parsed.data as AdjustmentInput;

  // Resolve shop
  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: shopDomain },
    select: { id: true },
  });

  if (!shop) {
    return json({ error: "Shop not found" }, { status: 404 });
  }

  // Find the inventory item by barcode
  const where: any = {
    shopId: shop.id,
    barcode,
  };

  if (locationId) {
    where.locationId = locationId;
  }

  const inventoryItem = await prisma.inventoryItem.findFirst({
    where,
    include: { location: { select: { id: true, name: true } } },
  });

  if (!inventoryItem) {
    log.warn({ barcode, locationId }, "Inventory item not found");
    return json(
      { error: "Inventory item not found for barcode", barcode },
      { status: 404 }
    );
  }

  // Calculate new quantity
  const newQuantity = inventoryItem.quantity + quantityChange;

  if (newQuantity < 0) {
    log.warn(
      { barcode, currentQuantity: inventoryItem.quantity, quantityChange },
      "Adjustment would result in negative stock"
    );
    return json(
      {
        error: "Adjustment would result in negative stock",
        currentQuantity: inventoryItem.quantity,
        requestedChange: quantityChange,
      },
      { status: 422 }
    );
  }

  const newAvailable = newQuantity - inventoryItem.reserved;

  // Apply adjustment and create stock movement in a transaction
  const [updatedItem, movement] = await prisma.$transaction([
    prisma.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: {
        quantity: newQuantity,
        available: Math.max(0, newAvailable),
      },
    }),
    prisma.stockMovement.create({
      data: {
        inventoryItemId: inventoryItem.id,
        locationId: inventoryItem.locationId,
        type: "ADJUSTMENT",
        quantityChange,
        reference: reference ?? null,
        notes: reason ?? null,
      },
    }),
  ]);

  log.info(
    {
      barcode,
      previousQuantity: inventoryItem.quantity,
      newQuantity: updatedItem.quantity,
      quantityChange,
      movementId: movement.id,
    },
    "Stock adjustment applied"
  );

  return json({
    success: true,
    item: {
      id: updatedItem.id,
      title: updatedItem.title,
      sku: updatedItem.sku,
      barcode: updatedItem.barcode,
      location: inventoryItem.location.name,
      previousQuantity: inventoryItem.quantity,
      newQuantity: updatedItem.quantity,
      available: updatedItem.available,
    },
    movementId: movement.id,
  });
};
