-- AlterTable
ALTER TABLE "shop_settings" ADD COLUMN     "enableAiInsights" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enableForecastExplanations" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "stock_movements_inventoryItemId_type_createdAt_idx" ON "stock_movements"("inventoryItemId", "type", "createdAt");
