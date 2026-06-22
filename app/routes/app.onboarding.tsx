/**
 * Onboarding wizard — guides a newly-installed merchant through
 * seven setup steps before they reach the dashboard.
 *
 * Steps:
 *   1. Welcome
 *   2. Location setup
 *   3. Import products
 *   4. Reorder defaults
 *   5. Team setup
 *   6. Notification preferences
 *   7. Done
 */

import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useLoaderData,
  useFetcher,
  useNavigate,
} from "@remix-run/react";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import { requirePermission } from "~/lib/auth/middleware";
import {
  Page,
  Layout,
  Card,
  Button,
  TextField,
  Checkbox,
  Select,
  Banner,
  Text,
} from "@shopify/polaris";
import { useState, useReducer, useCallback, useEffect } from "react";
import logger from "~/lib/logger";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOTAL_STEPS = 7;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StepState {
  step: number;
  selectedLocationId: string | null;
  productCount: number;
  defaultReorderPoint: number;
  safetyStockMultiplier: number;
  staffMembers: StaffMember[];
  selectedStaffRoles: Record<string, string>;
  emailAlerts: boolean;
  slackWebhookUrl: string;
}

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

type StepAction =
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "SET_LOCATION"; locationId: string }
  | { type: "SET_PRODUCT_COUNT"; count: number }
  | { type: "SET_REORDER_DEFAULTS"; reorderPoint: number; safetyStockMultiplier: number }
  | { type: "SET_STAFF_ROLES"; roles: Record<string, string> }
  | { type: "SET_NOTIFICATIONS"; emailAlerts: boolean; slackWebhookUrl: string };

const initialState: StepState = {
  step: 1,
  selectedLocationId: null,
  productCount: 0,
  defaultReorderPoint: 10,
  safetyStockMultiplier: 1.5,
  staffMembers: [],
  selectedStaffRoles: {},
  emailAlerts: true,
  slackWebhookUrl: "",
};

function stepReducer(state: StepState, action: StepAction): StepState {
  switch (action.type) {
    case "NEXT":
      return { ...state, step: Math.min(state.step + 1, TOTAL_STEPS) };
    case "PREV":
      return { ...state, step: Math.max(state.step - 1, 1) };
    case "SET_LOCATION":
      return { ...state, selectedLocationId: action.locationId };
    case "SET_PRODUCT_COUNT":
      return { ...state, productCount: action.count };
    case "SET_REORDER_DEFAULTS":
      return {
        ...state,
        defaultReorderPoint: action.reorderPoint,
        safetyStockMultiplier: action.safetyStockMultiplier,
      };
    case "SET_STAFF_ROLES":
      return { ...state, selectedStaffRoles: action.roles };
    case "SET_NOTIFICATIONS":
      return {
        ...state,
        emailAlerts: action.emailAlerts,
        slackWebhookUrl: action.slackWebhookUrl,
      };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requirePermission(request, "settings:read");
  const { admin, session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: session.shop },
    include: { settings: true, locations: true },
  });

  if (!shop) {
    return json({ shopName: "", locations: [], staffMembers: [], error: "Shop not found" });
  }

  // Fetch Shopify locations via Admin GraphQL API
  let locations: { id: string; name: string }[] = [];
  try {
    const locationResponse = await admin.graphql(`
      {
        locations(first: 50) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `);
    const locationData = await locationResponse.json();
    locations =
      locationData?.data?.locations?.edges?.map((edge: any) => ({
        id: edge.node.id,
        name: edge.node.name,
      })) ?? [];
  } catch (error) {
    logger.error({ shopId: shop.id, error }, "Failed to fetch Shopify locations");
    // Fall back to Prisma-stored locations
    locations = shop.locations.map((loc) => ({
      id: loc.shopifyLocationId,
      name: loc.name,
    }));
  }

  // Fetch Shopify staff members
  let staffMembers: StaffMember[] = [];
  try {
    const staffResponse = await admin.graphql(`
      {
        shop {
          name
          primaryDomain {
            host
          }
        }
      }
    `);
    const staffData = await staffResponse.json();

    // Note: Shopify's Admin API does not expose a full staff list via GraphQL
    // in all plans. We use the Staff model from our database as a fallback.
    const dbUsers = await prisma.user.findMany({
      where: { shopId: shop.id },
    });

    staffMembers = dbUsers.map((u) => ({
      id: u.id,
      firstName: u.email.split("@")[0],
      lastName: "",
      email: u.email,
      role: u.role,
    }));
  } catch (error) {
    logger.error({ shopId: shop.id, error }, "Failed to fetch staff members");
  }

  // Default roles mapping
  const defaultRoles: Record<string, string> = {};
  for (const member of staffMembers) {
    defaultRoles[member.id] = member.role;
  }

  return json({
    shopName: shop.shopifyDomain.split(".")[0],
    locations,
    staffMembers,
    defaultRoles,
  });
};

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shopId } = await requirePermission(request, "settings:write");
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  try {
    if (intent === "save-location") {
      const locationId = formData.get("locationId") as string;
      const locationName = formData.get("locationName") as string;

      // Upsert location and mark it as the primary warehouse
      await prisma.location.upsert({
        where: { shopifyLocationId: locationId },
        update: { type: "WAREHOUSE", isActive: true },
        create: {
          shopId,
          shopifyLocationId: locationId,
          name: locationName,
          type: "WAREHOUSE",
          isActive: true,
        },
      });

      return json({ success: true });
    }

    if (intent === "save-reorder-defaults") {
      const reorderPoint = Number(formData.get("reorderPoint")) || 10;
      const safetyStockMultiplier =
        Number(formData.get("safetyStockMultiplier")) || 1.5;

      // Update or create shop settings with reorder defaults
      await prisma.shopSetting.upsert({
        where: { shopId },
        update: {
          lowStockThreshold: reorderPoint,
        },
        create: {
          shopId,
          lowStockThreshold: reorderPoint,
          criticalStockThreshold: Math.ceil(reorderPoint * 0.5),
          forecastHorizonDays: 30,
          emailAlerts: true,
          currency: "USD",
        },
      });

      return json({ success: true });
    }

    if (intent === "save-staff-roles") {
      const rolesJson = formData.get("roles") as string;
      const roles: Record<string, string> = JSON.parse(rolesJson);

      for (const [userId, role] of Object.entries(roles)) {
        await prisma.user.update({
          where: { id: userId },
          data: { role: role as any },
        });
      }

      return json({ success: true });
    }

    if (intent === "save-notifications") {
      const emailAlerts = formData.get("emailAlerts") === "on";
      const slackWebhookUrl = formData.get("slackWebhookUrl") as string || null;

      await prisma.shopSetting.upsert({
        where: { shopId },
        update: { emailAlerts, slackWebhookUrl },
        create: {
          shopId,
          emailAlerts,
          slackWebhookUrl,
          lowStockThreshold: 10,
          criticalStockThreshold: 3,
          forecastHorizonDays: 30,
          currency: "USD",
        },
      });

      return json({ success: true });
    }

    if (intent === "complete-onboarding") {
      // Mark onboarding as complete by updating the shop
      await prisma.shop.update({
        where: { id: shopId },
        data: { /* plan field can track onboarding state */ },
      });

      return json({ success: true });
    }

    return json({ error: "Unknown intent" }, { status: 400 });
  } catch (error) {
    logger.error({ shopId, intent, error }, "Onboarding action failed");
    return json({ error: "Failed to save. Please try again." }, { status: 500 });
  }
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Onboarding() {
  const { shopName, locations, staffMembers, defaultRoles } =
    useLoaderData<typeof loader>();

  const [state, dispatch] = useReducer(stepReducer, {
    ...initialState,
    staffMembers: staffMembers ?? [],
    selectedStaffRoles: defaultRoles ?? {},
  });

  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [selectedLocationIdx, setSelectedLocationIdx] = useState<string>("");
  const [reorderPoint, setReorderPoint] = useState("10");
  const [safetyStockMultiplier, setSafetyStockMultiplier] = useState("1.5");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [localRoles, setLocalRoles] = useState<Record<string, string>>(
    defaultRoles ?? {},
  );

  const isSubmitting = fetcher.state === "submitting";

  // Navigate to dashboard after onboarding is complete
  useEffect(() => {
    if (
      fetcher.data?.success &&
      state.step === TOTAL_STEPS
    ) {
      // Brief delay so the user can see the success state
      const timer = setTimeout(() => {
        navigate("/app");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [fetcher.data, state.step, navigate]);

  const handleNext = useCallback(() => {
    // Dispatch the save for the current step before advancing
    if (state.step === 2 && selectedLocationIdx) {
      const loc = locations.find((l: any) => l.id === selectedLocationIdx);
      if (loc) {
        fetcher.submit(
          {
            intent: "save-location",
            locationId: loc.id,
            locationName: loc.name,
          },
          { method: "post" },
        );
      }
    }

    if (state.step === 4) {
      fetcher.submit(
        {
          intent: "save-reorder-defaults",
          reorderPoint,
          safetyStockMultiplier,
        },
        { method: "post" },
      );
    }

    if (state.step === 5) {
      fetcher.submit(
        { intent: "save-staff-roles", roles: JSON.stringify(localRoles) },
        { method: "post" },
      );
    }

    if (state.step === 6) {
      fetcher.submit(
        { intent: "save-notifications", emailAlerts: emailAlerts ? "on" : "off", slackWebhookUrl },
        { method: "post" },
      );
    }

    dispatch({ type: "NEXT" });
  }, [
    state.step,
    selectedLocationIdx,
    locations,
    reorderPoint,
    safetyStockMultiplier,
    localRoles,
    emailAlerts,
    slackWebhookUrl,
    fetcher,
  ]);

  const handleBack = useCallback(() => {
    dispatch({ type: "PREV" });
  }, []);

  const handleComplete = useCallback(() => {
    fetcher.submit({ intent: "complete-onboarding" }, { method: "post" });
  }, [fetcher]);

  const handleSkipAll = useCallback(() => {
    fetcher.submit({ intent: "complete-onboarding" }, { method: "post" });
  }, [fetcher]);

  const progressPercentage = Math.round((state.step / TOTAL_STEPS) * 100);

  // -----------------------------------------------------------------------
  // Step renderers
  // -----------------------------------------------------------------------

  function renderStepContent() {
    switch (state.step) {
      case 1:
        return <WelcomeStep shopName={shopName} />;
      case 2:
        return (
          <LocationStep
            locations={locations}
            selectedLocationIdx={selectedLocationIdx}
            onSelect={setSelectedLocationIdx}
          />
        );
      case 3:
        return <ImportProductsStep productCount={state.productCount} />;
      case 4:
        return (
          <ReorderDefaultsStep
            reorderPoint={reorderPoint}
            safetyStockMultiplier={safetyStockMultiplier}
            onReorderPointChange={setReorderPoint}
            onSafetyStockMultiplierChange={setSafetyStockMultiplier}
          />
        );
      case 5:
        return (
          <TeamSetupStep
            staffMembers={state.staffMembers}
            localRoles={localRoles}
            onRoleChange={(id, role) =>
              setLocalRoles((prev) => ({ ...prev, [id]: role }))
            }
          />
        );
      case 6:
        return (
          <NotificationStep
            emailAlerts={emailAlerts}
            slackWebhookUrl={slackWebhookUrl}
            onEmailAlertsChange={setEmailAlerts}
            onSlackWebhookUrlChange={setSlackWebhookUrl}
          />
        );
      case 7:
        return <DoneStep />;
      default:
        return null;
    }
  }

  return (
    <Page
      title="Welcome to StockFlows"
      subtitle={`Step ${state.step} of ${TOTAL_STEPS}`}
      secondaryActions={[
        {
          content: "Skip setup",
          onAction: handleSkipAll,
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          {/* Progress indicator */}
          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Text variant="bodyMd" fontWeight="semibold">
                  Setup progress
                </Text>
                <Text variant="bodySm" tone="subdued">
                  {progressPercentage}% complete
                </Text>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                  <div
                    key={i}
                    className={`text-xs ${
                      i + 1 <= state.step ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div className="p-6">{renderStepContent()}</div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <div className="flex justify-between">
            {state.step > 1 && (
              <Button onClick={handleBack} disabled={isSubmitting}>
                Back
              </Button>
            )}
            <div className={state.step === 1 ? "ml-auto" : ""}>
              {state.step < TOTAL_STEPS ? (
                <Button
                  primary
                  onClick={handleNext}
                  loading={isSubmitting}
                  disabled={state.step === 2 && !selectedLocationIdx}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  primary
                  onClick={handleComplete}
                  loading={isSubmitting}
                >
                  Go to Dashboard
                </Button>
              )}
            </div>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Step sub-components
// ---------------------------------------------------------------------------

function WelcomeStep({ shopName }: { shopName: string }) {
  return (
    <div className="space-y-4">
      <Banner tone="info">
        <p>
          This quick setup will have StockFlows tracking your inventory in
          just a few minutes.
        </p>
      </Banner>

      <Text variant="headingLg" as="h2">
        Welcome, {shopName}!
      </Text>

      <Text variant="bodyMd" as="p">
        StockFlows helps you manage inventory across all your Shopify
        locations. You can track stock levels, set reorder points, forecast
        demand, and automate purchase orders.
      </Text>

      <Text variant="bodyMd" as="p">
        This setup wizard will walk you through:
      </Text>

      <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
        <li>Choosing your primary warehouse location</li>
        <li>Importing existing products to track</li>
        <li>Setting smart reorder defaults</li>
        <li>Inviting your team members</li>
        <li>Configuring alert notifications</li>
      </ul>
    </div>
  );
}

function LocationStep({
  locations,
  selectedLocationIdx,
  onSelect,
}: {
  locations: { id: string; name: string }[];
  selectedLocationIdx: string;
  onSelect: (val: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Text variant="headingLg" as="h2">
        Choose your primary warehouse
      </Text>
      <Text variant="bodyMd" as="p">
        Select which Shopify location StockFlows should use as your primary
        warehouse. This is where most of your stock will be managed.
      </Text>

      {locations.length === 0 ? (
        <Banner tone="warning">
          <p>
            No locations found. Please add a location in your Shopify admin
            under Settings &gt; Locations, then come back to continue setup.
          </p>
        </Banner>
      ) : (
        <Select
          label="Primary warehouse"
          options={locations.map((loc) => ({
            label: loc.name,
            value: loc.id,
          }))}
          value={selectedLocationIdx}
          onChange={onSelect}
          placeholder="Select a location"
        />
      )}

      {selectedLocationIdx && (
        <Banner tone="success">
          <p>
            {locations.find((l) => l.id === selectedLocationIdx)?.name} will be
            set as your primary warehouse.
          </p>
        </Banner>
      )}
    </div>
  );
}

function ImportProductsStep({
  productCount,
}: {
  productCount: number;
}) {
  return (
    <div className="space-y-4">
      <Text variant="headingLg" as="h2">
        Import products
      </Text>
      <Text variant="bodyMd" as="p">
        StockFlows will sync your Shopify products automatically. You can
        manage which products to track from the Inventory page after
        onboarding.
      </Text>

      <Banner tone="info">
        <p>
          Product data will be synced from your Shopify catalog. Each variant
          with a SKU will become a trackable inventory item.
        </p>
      </Banner>

      <Text variant="bodyMd" as="p">
        You can also import historical data from Stocky later via the
        Migration tool in Settings.
      </Text>
    </div>
  );
}

function ReorderDefaultsStep({
  reorderPoint,
  safetyStockMultiplier,
  onReorderPointChange,
  onSafetyStockMultiplierChange,
}: {
  reorderPoint: string;
  safetyStockMultiplier: string;
  onReorderPointChange: (val: string) => void;
  onSafetyStockMultiplierChange: (val: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Text variant="headingLg" as="h2">
        Set reorder defaults
      </Text>
      <Text variant="bodyMd" as="p">
        These defaults will be applied to all newly imported products. You
        can adjust them individually later.
      </Text>

      <TextField
        label="Default reorder point"
        type="number"
        value={reorderPoint}
        onChange={onReorderPointChange}
        helpText="When stock drops below this level, StockFlows will alert you to reorder."
      />

      <TextField
        label="Safety stock multiplier"
        type="number"
        value={safetyStockMultiplier}
        onChange={onSafetyStockMultiplierChange}
        helpText="Multiplied by your average daily sales to calculate how much extra stock to keep on hand."
      />

      <Banner tone="info">
        <p>
          Example: With a reorder point of 10 and a safety stock multiplier of
          1.5x, you will receive an alert when stock falls below 10 units and
          the system will recommend ordering 1.5x your average daily sales.
        </p>
      </Banner>
    </div>
  );
}

function TeamSetupStep({
  staffMembers,
  localRoles,
  onRoleChange,
}: {
  staffMembers: StaffMember[];
  localRoles: Record<string, string>;
  onRoleChange: (id: string, role: string) => void;
}) {
  const roleOptions = [
    { label: "Owner", value: "OWNER" },
    { label: "Manager", value: "MANAGER" },
    { label: "Staff", value: "STAFF" },
  ];

  return (
    <div className="space-y-4">
      <Text variant="headingLg" as="h2">
        Team setup
      </Text>
      <Text variant="bodyMd" as="p">
        StockFlows has synced your Shopify staff members. Assign a StockFlows
        role to each team member to control their access level.
      </Text>

      {staffMembers.length === 0 ? (
        <Banner tone="info">
          <p>
            No staff members found. You can invite team members from
            Shopify admin and they will appear here automatically.
          </p>
        </Banner>
      ) : (
        <div className="space-y-3">
          {staffMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div>
                <Text variant="bodyMd" fontWeight="semibold">
                  {member.email}
                </Text>
              </div>
              <Select
                label=""
                labelHidden
                options={roleOptions}
                value={localRoles[member.id] ?? "STAFF"}
                onChange={(val) => onRoleChange(member.id, val)}
              />
            </div>
          ))}
        </div>
      )}

      <Banner tone="info">
        <p>
          <strong>Owner</strong> has full access.{" "}
          <strong>Manager</strong> can manage inventory and purchases.{" "}
          <strong>Staff</strong> can view inventory and receive shipments.
        </p>
      </Banner>
    </div>
  );
}

function NotificationStep({
  emailAlerts,
  slackWebhookUrl,
  onEmailAlertsChange,
  onSlackWebhookUrlChange,
}: {
  emailAlerts: boolean;
  slackWebhookUrl: string;
  onEmailAlertsChange: (val: boolean) => void;
  onSlackWebhookUrlChange: (val: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Text variant="headingLg" as="h2">
        Notification preferences
      </Text>
      <Text variant="bodyMd" as="p">
        Choose how StockFlows should notify you and your team about low
        stock, pending purchase orders, and other inventory events.
      </Text>

      <Checkbox
        label="Enable email alerts"
        checked={emailAlerts}
        onChange={onEmailAlertsChange}
        helpText="Receive email notifications for low stock alerts and purchase order updates."
      />

      <TextField
        label="Slack webhook URL"
        value={slackWebhookUrl}
        onChange={onSlackWebhookUrlChange}
        placeholder="https://hooks.slack.com/services/..."
        helpText="Optionally send alerts to a Slack channel. Leave empty to disable."
      />

      <Banner tone="info">
        <p>
          You can configure more advanced notification rules after onboarding
          from the Settings page.
        </p>
      </Banner>
    </div>
  );
}

function DoneStep() {
  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Text variant="headingLg" as="span">
            &#10003;
          </Text>
        </div>
      </div>

      <Text variant="headingLg" as="h2">
        You&apos;re all set!
      </Text>

      <Text variant="bodyMd" as="p">
        StockFlows is configured and ready to help you manage your inventory.
        You can always adjust your settings later from the Settings page.
      </Text>

      <Banner tone="success">
        <p>
          What you can do next: check your inventory levels on the dashboard,
          set up custom reorder points for individual products, or run a
          Stocky migration to import historical data.
        </p>
      </Banner>
    </div>
  );
}
