import { Card, SkeletonBodyText, SkeletonDisplayText } from "@shopify/polaris";

export function DashboardSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <>
      {Array.from({ length: cards }).map((_, i) => (
        <Card key={i}>
          <div className="p-4">
            <SkeletonDisplayText size="small" />
            <div className="mt-2">
              <SkeletonDisplayText size="large" />
            </div>
          </div>
        </Card>
      ))}
    </>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <div className="p-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="mb-3">
            <SkeletonBodyText lines={1} />
          </div>
        ))}
      </div>
    </Card>
  );
}
