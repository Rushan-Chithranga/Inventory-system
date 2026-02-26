"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { Card, CardHeader, Button, EmptyState, Badge, Table, Th, Td } from "@/components/ui";
import { useApiRequest } from "@/lib/auth-context";
import { ProductType } from "@/types";

interface ScanEntry {
  id: number;
  product: string;
  action: "add" | "remove";
  qty: number;
  newStock: number;
  barcode: string;
  time: string;
}

export default function BarcodePage() {
  const apiFetch = useApiRequest();
  const [code, setCode] = useState("");
  const [action, setAction] = useState<"add" | "remove">("add");
  const [qty, setQty] = useState(1);
  const [scanning, setScanning] = useState(false);
  const [found, setFound] = useState<ProductType | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [history, setHistory] = useState<ScanEntry[]>([]);
  const [processing, setProcessing] = useState(false);

  const lookupBarcode = async (barcode: string) => {
    if (!barcode) return;
    const res = await apiFetch(`/api/products/barcode?code=${encodeURIComponent(barcode)}`);
    if (res.ok) {
      const d = await res.json();
      setFound(d.product);
      setResult(null);
    } else {
      setFound(null);
      setResult({ success: false, message: `No product found for barcode: ${barcode}` });
    }
  };

  const simulateScan = () => {
    setScanning(true);
    const mockBarcodes = ["8901234567890", "8901234567891", "8901234567892", "8901234567893"];
    const picked = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
    setTimeout(() => {
      setCode(picked);
      setScanning(false);
      lookupBarcode(picked);
    }, 1500);
  };

  const processScan = async () => {
    if (!found) return;
    setProcessing(true);
    const res = await apiFetch(`/api/products/${found.id}/adjust`, {
      method: "POST",
      body: JSON.stringify({ action, quantity: qty }),
    });
    const data = await res.json();
    setProcessing(false);

    if (res.ok) {
      const entry: ScanEntry = {
        id: Date.now(),
        product: found.name,
        action,
        qty,
        newStock: data.newStock,
        barcode: code,
        time: new Date().toLocaleTimeString(),
      };
      setHistory((h) => [entry, ...h].slice(0, 30));
      setResult({
        success: true,
        message: `✓ ${found.name} — ${action === "add" ? "Added" : "Removed"} ×${qty}. New stock: ${data.newStock}`,
      });
      setFound(null);
      setCode("");
    } else {
      setResult({ success: false, message: data.error || "Operation failed" });
    }
  };

  return (
    <AppShell title="Barcode Scanner">
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="font-bold text-white text-sm">📷 Scanner</div>
            </CardHeader>
            <div className="p-6">
              <div
                className={`border-2 border-dashed rounded-2xl p-10 text-center mb-5 cursor-pointer transition-all ${
                  scanning ? "border-orange-500 animate-pulse" : "border-[#2a2a2a] hover:border-[#444]"
                }`}
                onClick={simulateScan}
              >
                <div className="text-5xl mb-3">{scanning ? "⏳" : "📷"}</div>
                <div className={`text-base font-bold mb-1.5 ${scanning ? "text-orange-400" : "text-gray-600"}`}>
                  {scanning ? "Scanning…" : "Click to Simulate Scan"}
                </div>
                <div className="text-xs text-gray-700">
                  Connect a USB barcode scanner or use camera scan
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Barcode (manual entry)
                </label>
                <div className="flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && lookupBarcode(code)}
                    placeholder="Enter barcode and press Enter…"
                    className="flex-1 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-orange-500 placeholder:text-gray-700 font-mono"
                  />
                  <Button variant="secondary" onClick={() => lookupBarcode(code)}>Lookup</Button>
                </div>
              </div>

              {found && (
                <div className="bg-green-500/8 border border-green-500/20 rounded-xl p-4 mb-4">
                  <div className="text-xs text-green-500 uppercase tracking-widest font-semibold mb-2">Product Found</div>
                  <div className="font-bold text-white">{found.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{found.category} · ${Number(found.price).toFixed(2)} · Stock: {found.stock}</div>
                </div>
              )}

              <div className="flex gap-2 mb-4">
                {(["add", "remove"] as const).map((v) => (
                  <Button
                    key={v}
                    variant={action === v ? "primary" : "secondary"}
                    className="flex-1"
                    onClick={() => setAction(v)}
                  >
                    {v === "add" ? "➕ Add to Stock" : "➖ Remove from Stock"}
                  </Button>
                ))}
              </div>

              <div className="flex flex-col gap-1.5 mb-5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                  className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <Button
                className="w-full justify-center"
                onClick={processScan}
                disabled={!found || processing}
              >
                {processing ? "Processing…" : "Process Scan"}
              </Button>

              {result && (
                <div
                  className={`mt-4 rounded-xl px-4 py-3 text-sm border ${
                    result.success
                      ? "bg-green-500/8 border-green-500/20 text-green-400"
                      : "bg-red-500/8 border-red-500/20 text-red-400"
                  }`}
                >
                  {result.message}
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="font-bold text-white text-sm">Scan History</div>
            {history.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setHistory([])}>Clear</Button>
            )}
          </CardHeader>
          {history.length === 0 ? (
            <EmptyState icon="📋" message="No scans yet. Start scanning to see history." />
          ) : (
            <Table>
              <thead>
                <tr><Th>Time</Th><Th>Product</Th><Th>Action</Th><Th>Qty</Th><Th>New Stock</Th></tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-white/[0.02]">
                    <Td><span className="font-mono text-xs text-gray-600">{h.time}</span></Td>
                    <Td><span className="font-semibold text-white text-xs">{h.product}</span></Td>
                    <Td>
                      <Badge variant={h.action === "add" ? "green" : "red"}>
                        {h.action === "add" ? "➕ Added" : "➖ Removed"}
                      </Badge>
                    </Td>
                    <Td>×{h.qty}</Td>
                    <Td><span className="text-orange-400 font-bold">{h.newStock}</span></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
