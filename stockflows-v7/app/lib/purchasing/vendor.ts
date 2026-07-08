import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CreateVendorData {
  name: string;
  email?: string;
  phone?: string;
  contactPerson?: string;
  leadTimeDays?: number;
  paymentTerms?: string;
  defaultCurrency?: string;
  notes?: string;
}

type UpdateVendorData = Partial<CreateVendorData>;

// ---------------------------------------------------------------------------
// Vendor management
// ---------------------------------------------------------------------------

/**
 * Create a new vendor for a shop.
 *
 * @param shopId - Shop that owns the vendor
 * @param data   - Vendor fields
 * @returns The newly created Vendor record
 */
export async function createVendor(shopId: string, data: CreateVendorData) {
  logger.info({ shopId, vendorName: data.name }, "createVendor: starting");

  const vendor = await prisma.vendor.create({
    data: {
      shopId,
      name: data.name,
      email: data.email ?? null,
      phone: data.phone ?? null,
      contactPerson: data.contactPerson ?? null,
      leadTimeDays: data.leadTimeDays ?? 7,
      paymentTerms: data.paymentTerms ?? null,
      defaultCurrency: data.defaultCurrency ?? "USD",
      notes: data.notes ?? null,
    },
  });

  logger.info({ vendorId: vendor.id }, "createVendor: done");
  return vendor;
}

/**
 * Update an existing vendor.
 *
 * Only provided fields are updated (undefined fields are left unchanged).
 *
 * @param vendorId - ID of the vendor to update
 * @param data     - Fields to update
 * @returns The updated Vendor record
 */
export async function updateVendor(vendorId: string, data: UpdateVendorData) {
  logger.info({ vendorId }, "updateVendor: starting");

  const existing = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!existing) {
    throw new Error(`Vendor ${vendorId} not found`);
  }

  const updateData: Record<string, any> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.contactPerson !== undefined) updateData.contactPerson = data.contactPerson;
  if (data.leadTimeDays !== undefined) updateData.leadTimeDays = data.leadTimeDays;
  if (data.paymentTerms !== undefined) updateData.paymentTerms = data.paymentTerms;
  if (data.defaultCurrency !== undefined) updateData.defaultCurrency = data.defaultCurrency;
  if (data.notes !== undefined) updateData.notes = data.notes;

  const updated = await prisma.vendor.update({
    where: { id: vendorId },
    data: updateData,
  });

  logger.info({ vendorId }, "updateVendor: done");
  return updated;
}

/**
 * Fetch a vendor with their recent purchase orders.
 *
 * Returns the 10 most recent POs, ordered by creation date descending.
 *
 * @param vendorId - ID of the vendor
 * @returns The vendor with recent POs, or null if not found
 */
export async function getVendorWithPOs(vendorId: string) {
  logger.info({ vendorId }, "getVendorWithPOs: starting");

  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: {
      purchaseOrders: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          location: { select: { id: true, name: true } },
        },
      },
    },
  });

  logger.info({ vendorId, found: !!vendor }, "getVendorWithPOs: done");
  return vendor;
}

/**
 * List vendors for a shop with optional search filter.
 *
 * Searches against vendor name and contact person fields.
 *
 * @param shopId - Shop that owns the vendors
 * @param search - Optional free-text search term
 * @returns Filtered array of vendors
 */
export async function listVendors(shopId: string, search?: string) {
  logger.info({ shopId, search }, "listVendors: starting");

  const where: any = { shopId, isActive: true };

  if (search) {
    const searchTerm = search.trim();
    where.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { contactPerson: { contains: searchTerm, mode: "insensitive" } },
      { email: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  const vendors = await prisma.vendor.findMany({
    where,
    orderBy: { name: "asc" },
  });

  logger.info({ shopId, count: vendors.length }, "listVendors: done");
  return vendors;
}
