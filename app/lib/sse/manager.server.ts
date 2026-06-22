type SSEClient = {
  controller: ReadableStreamDefaultController;
  shopDomain: string;
};

const connections = new Map<string, Set<SSEClient>>();

export function broadcastSSE(shopDomain: string, event: string, data: unknown) {
  const clients = connections.get(shopDomain);
  if (!clients || clients.size === 0) return;

  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  const encoder = new TextEncoder();
  const encoded = encoder.encode(message);

  for (const client of clients) {
    try {
      client.controller.enqueue(encoded);
    } catch {
      clients.delete(client);
    }
  }
}

export function addSSEConnection(
  shopDomain: string,
  controller: ReadableStreamDefaultController
): SSEClient {
  const client: SSEClient = { controller, shopDomain };

  if (!connections.has(shopDomain)) {
    connections.set(shopDomain, new Set());
  }
  connections.get(shopDomain)!.add(client);

  return client;
}

export function removeSSEConnection(client: SSEClient) {
  const clients = connections.get(client.shopDomain);
  if (clients) {
    clients.delete(client);
    if (clients.size === 0) {
      connections.delete(client.shopDomain);
    }
  }
}

export function getConnectionCount(shopDomain: string): number {
  return connections.get(shopDomain)?.size ?? 0;
}
