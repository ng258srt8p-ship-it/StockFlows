import { useEffect, useRef, useState, useCallback } from "react";
import { useInventoryStore } from "~/stores/inventory";

interface SSEHookResult {
  isConnected: boolean;
  reconnectCount: number;
}

const BASE_DELAY = 1000;
const MAX_DELAY = 30000;
const MAX_RECONNECT_ATTEMPTS = Infinity;

export function useSSE(): SSEHookResult {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUnmountedRef = useRef(false);

  const { updateItemQuantity, addAlert } = useInventoryStore.getState();

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (isUnmountedRef.current) return;

    cleanup();

    const eventSource = new EventSource("/app/api/sse");
    eventSourceRef.current = eventSource;

    eventSource.addEventListener("connected", () => {
      setIsConnected(true);
      setReconnectCount(0);
    });

    eventSource.addEventListener("inventory-update", (event) => {
      try {
        const data = JSON.parse(event.data) as {
          itemId: string;
          quantity: number;
        };
        updateItemQuantity(data.itemId, data.quantity);
      } catch {
        console.error("Failed to parse inventory-update event data");
      }
    });

    eventSource.addEventListener("reorder-alert", (event) => {
      try {
        const alert = JSON.parse(event.data) as Parameters<
          typeof addAlert
        >[0];
        addAlert(alert);
      } catch {
        console.error("Failed to parse reorder-alert event data");
      }
    });

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
      eventSourceRef.current = null;

      if (!isUnmountedRef.current) {
        setReconnectCount((prev) => {
          const nextCount = prev + 1;
          const delay = Math.min(
            BASE_DELAY * Math.pow(2, prev),
            MAX_DELAY,
          );
          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, delay);
          return nextCount;
        });
      }
    };
  }, [cleanup, updateItemQuantity, addAlert]);

  useEffect(() => {
    isUnmountedRef.current = false;
    connect();

    return () => {
      isUnmountedRef.current = true;
      cleanup();
    };
  }, [connect, cleanup]);

  return { isConnected, reconnectCount };
}
