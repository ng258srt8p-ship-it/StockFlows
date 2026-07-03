import { Worker, Job } from "bullmq";
import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";
import { createWorkerConnection } from "../redis-connection";

const connection = createWorkerConnection();

interface StaffSyncJobData {
  shopId: string;
  accessToken: string;
}

interface ShopifyStaffMember {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  accountType: string;
}

interface StaffMembersResponse {
  data: {
    staffMembers: {
      edges: Array<{
        node: ShopifyStaffMember;
      }>;
    };
  };
  errors?: Array<{ message: string }>;
}

const STAFF_MEMBERS_QUERY = `
  query StaffMembers {
    staffMembers(first: 250) {
      edges {
        node {
          id
          email
          firstName
          lastName
          accountType
        }
      }
    }
  }
`;

function mapAccountTypeToRole(
  accountType: string
): "OWNER" | "MANAGER" | "STAFF" {
  switch (accountType) {
    case "regular":
      return "MANAGER";
    case "collaborator":
      return "STAFF";
    case "restricted":
      return "STAFF";
    default:
      return "STAFF";
  }
}

function extractShopifyUserId(gid: string): string {
  const parts = gid.split("/");
  return parts[parts.length - 1];
}

let staffSyncWorker: Worker<StaffSyncJobData> | null = null;

if (connection) {
  staffSyncWorker = new Worker(
    "staff-sync",
    async (job: Job<StaffSyncJobData>) => {
      const { shopId, accessToken } = job.data;
      const log = logger.child({
        jobId: job.id,
        shopId,
        worker: "staff-sync",
      });

      log.info("Starting staff member sync");

      const response = await fetch(
        `https://admin/api/2024-01/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
          },
          body: JSON.stringify({ query: STAFF_MEMBERS_QUERY }),
        }
      );

      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          `Shopify GraphQL request failed (${response.status}): ${body}`
        );
      }

      const result: StaffMembersResponse = await response.json();

      if (result.errors && result.errors.length > 0) {
        throw new Error(
          `Shopify GraphQL errors: ${result.errors.map((e) => e.message).join(", ")}`
        );
      }

      const staffMembers = result.data.staffMembers.edges.map(
        (edge) => edge.node
      );

      log.info({ count: staffMembers.length }, "Fetched staff members from Shopify");

      let upserted = 0;

      for (const member of staffMembers) {
        try {
          const shopifyUserId = extractShopifyUserId(member.id);
          const role = mapAccountTypeToRole(member.accountType);

          await prisma.user.upsert({
            where: {
              shopId_shopifyUserId: {
                shopId,
                shopifyUserId,
              },
            },
            create: {
              shopId,
              shopifyUserId,
              email: member.email,
              role,
            },
            update: {
              email: member.email,
              role,
            },
          });

          upserted++;
        } catch (error) {
          log.error(
            { err: error, email: member.email },
            "Failed to upsert staff member"
          );
        }
      }

      log.info({ upserted, total: staffMembers.length }, "Staff sync complete");

      return { upserted, total: staffMembers.length };
    },
    {
      connection,
      concurrency: 3,
    }
  );

  staffSyncWorker.on("failed", (job, error) => {
    logger.error({ jobId: job?.id, err: error }, "Staff sync job failed");
  });

  staffSyncWorker.on("completed", (job, result) => {
    logger.info({ jobId: job.id, result }, "Staff sync job completed");
  });
} else {
  logger.info("Redis not configured — staff-sync worker disabled");
}

export { staffSyncWorker };