import { useEffect, useRef, useState, useCallback } from "react";
import { Card, Text, Button, Badge } from "@shopify/polaris";
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isActive: boolean;
  format?: string[];
}

/**
 * Barcode scanner component supporting:
 * 1. USB HID scanners (keyboard input pattern)
 * 2. Camera scanning via html5-qrcode
 * 3. Manual entry fallback
 */
export function BarcodeScanner({ onScan, isActive, format }: BarcodeScannerProps) {
  const [mode, setMode] = useState<"hid" | "camera" | "manual">("hid");
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bufferRef = useRef("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

  // USB HID Scanner detection via rapid keyboard input
  useEffect(() => {
    if (mode !== "hid" || !isActive) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const barcode = bufferRef.current.trim();
        if (barcode.length >= 3) {
          setLastScan(barcode);
          setScanCount((c) => c + 1);
          onScan(barcode);
        }
        bufferRef.current = "";
        return;
      }

      if (e.key.length === 1) {
        bufferRef.current += e.key;
        clearTimeout(timeoutRef.current!);
        timeoutRef.current = setTimeout(() => {
          bufferRef.current = "";
        }, 100); // HID scanners type fast — 100ms gap means input ended
      }
    };

    window.addEventListener("keypress", handler);
    return () => {
      window.removeEventListener("keypress", handler);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [mode, isActive, onScan]);

  // Focus input for manual entry mode
  useEffect(() => {
    if (mode === "manual" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode]);

  // Camera-based barcode scanning via html5-qrcode
  useEffect(() => {
    if (mode !== "camera" || !isActive) return;

    setCameraError(null);

    const scanner = new Html5Qrcode("barcode-camera-reader", {
      verbose: false,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.QR_CODE,
      ],
    });
    html5QrcodeRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setLastScan(decodedText);
          setScanCount((c) => c + 1);
          onScan(decodedText);
        },
        () => {
          // Ignore scan errors (no barcode in frame, etc.)
        }
      )
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : String(err);
        if (
          message.toLowerCase().includes("permission") ||
          message.toLowerCase().includes("denied") ||
          message.toLowerCase().includes("not allowed")
        ) {
          setCameraError(
            "Camera permission denied. Please allow camera access in your browser settings and try again."
          );
        } else {
          setCameraError(
            `Unable to start camera: ${message}`
          );
        }
      });

    return () => {
      if (html5QrcodeRef.current) {
        html5QrcodeRef.current
          .stop()
          .catch(() => {
            // Ignore stop errors on cleanup
          })
          .finally(() => {
            html5QrcodeRef.current = null;
          });
      }
    };
  }, [mode, isActive, onScan]);

  const handleManualSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = new FormData(e.currentTarget);
      const barcode = (form.get("barcode") as string)?.trim();
      if (barcode) {
        setLastScan(barcode);
        setScanCount((c) => c + 1);
        onScan(barcode);
        e.currentTarget.reset();
      }
    },
    [onScan]
  );

  if (!isActive) return null;

  return (
    <Card>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Text variant="headingMd" as="h3">
            Barcode Scanner
          </Text>
          <Badge tone={scanCount > 0 ? "success" : "info"}>
            {`${scanCount} scans`}
          </Badge>
        </div>

        <div className="flex gap-2 mb-4">
          <Button
            size="slim"
            pressed={mode === "hid"}
            onClick={() => setMode("hid")}
          >
            USB Scanner
          </Button>
          <Button
            size="slim"
            pressed={mode === "camera"}
            onClick={() => setMode("camera")}
          >
            Camera
          </Button>
          <Button
            size="slim"
            pressed={mode === "manual"}
            onClick={() => setMode("manual")}
          >
            Manual Entry
          </Button>
        </div>

        {mode === "hid" && (
          <div className="p-4 bg-blue-50 rounded text-center">
            <Text variant="bodyMd" as="p">
              Point your barcode scanner at a barcode. Scanned values will appear
              automatically.
            </Text>
            <div className="mt-2 p-2 bg-white rounded border">
              <input
                type="text"
                className="w-full text-center text-lg font-mono"
                placeholder="Waiting for scan..."
                readOnly
                tabIndex={-1}
                value={lastScan || ""}
              />
            </div>
          </div>
        )}

        {mode === "camera" && (
          <div className="p-4 bg-blue-50 rounded">
            {cameraError ? (
              <Text variant="bodyMd" as="p" className="text-red-600">
                {cameraError}
              </Text>
            ) : (
              <>
                <Text variant="bodyMd" as="p" className="mb-2">
                  Position a barcode within the frame below. Scanning happens
                  automatically.
                </Text>
                <div
                  id="barcode-camera-reader"
                  className="rounded overflow-hidden"
                />
              </>
            )}
          </div>
        )}

        {mode === "manual" && (
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              name="barcode"
              type="text"
              placeholder="Type or scan barcode..."
              className="flex-1 p-2 border rounded"
              autoComplete="off"
              autoFocus
            />
            <Button submit>Submit</Button>
          </form>
        )}

        {lastScan && (
          <div className="mt-3 p-2 bg-green-50 rounded">
            <Text variant="bodySm" as="p" className="text-green-600">
              Last scan: <strong className="font-mono">{lastScan}</strong>
            </Text>
          </div>
        )}
      </div>
    </Card>
  );
}
