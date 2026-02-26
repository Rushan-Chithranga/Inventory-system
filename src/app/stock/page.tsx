"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { Card, CardHeader, StatCard, Button, Modal, Input, Badge, Table, Th, Td, EmptyState, StockBar } from "@/components/ui";
import { useApiRequest } from "@/lib/auth-context";
import { ProductType } from "@/types";
import { DollarCircleIcon, Package, Package03Icon, PackageIcon, PackageOutOfStockIcon } from "@hugeicons/core-free-icons";

export default function StockPage() {
  const apiFetch = useApiRequest();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [adjustModal, setAdjustModal] = useState<ProductType | null>(null);
  const [adjQty, setAdjQty] = useState("");
  const [adjType, setAdjType] = useState<"add" | "remove">("add");
  const [saving, setSaving] = useState(false);

  const fetchProducts = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filter !== "all") params.set("status", filter === "low" ? "low" : filter === "out" ? "out" : "ok");
    setLoading(true);
    apiFetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((d) => { setProducts(d.products || []); setLoading(false); });
  };

  useEffect(() => { fetchProducts(); }, [search, filter]);

  const applyAdjust = async () => {
    if (!adjustModal || !adjQty) return;
    setSaving(true);
    await apiFetch(`/api/products/${adjustModal.id}/adjust`, {
      method: "POST",
      body: JSON.stringify({ action: adjType, quantity: parseInt(adjQty) }),
    });
    setSaving(false);
    setAdjustModal(null);
    fetchProducts();
  };

  const lowCount = products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const outCount = products.filter(p => p.stock === 0).length;
  const totalValue = products.reduce((t, p) => t + p.stock * Number(p.price), 0);

  return (
    <AppShell title="Stock Report">
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Products" value={products.length} icon={Package03Icon} />
        <StatCard label="Low Stock" value={lowCount} icon={PackageIcon} changeType="warn" change={lowCount > 0 ? "Needs restocking" : ""} />
        <StatCard label="Out of Stock" value={outCount} icon={PackageOutOfStockIcon} changeType={outCount > 0 ? "down" : undefined} change={outCount > 0 ? "Urgent reorder!" : ""} />
        <StatCard label="Inventory Value" value={`$${totalValue.toFixed(0)}`} icon={DollarCircleIcon} changeType="up" />
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">🔍</span>
          <input
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-orange-500 placeholder:text-gray-700"
          />
        </div>
        {[
          ["all", "All Products"],
          ["low", "⚠ Low / Out"],
          ["ok", "✓ In Stock"],
        ].map(([v, l]) => (
          <Button key={v} variant={filter === v ? "primary" : "secondary"} size="sm" onClick={() => setFilter(v)}>
            {l}
          </Button>
        ))}
        <div className="ml-auto">
          <Button variant="secondary" size="sm">⬇ Export</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <div className="font-bold text-white text-sm">Stock Levels</div>
            <div className="text-xs text-gray-600 mt-0.5">Monitor and adjust inventory</div>
          </div>
        </CardHeader>
        {loading ? (
          <div className="py-16 text-center text-gray-600 animate-pulse">Loading…</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Product</Th><Th>Category</Th><Th>Price</Th>
                <Th>Stock</Th><Th>Threshold</Th><Th>Value</Th><Th>Status</Th><Th>Adjust</Th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon={PackageIcon} message="No products match your filter" /></td></tr>
              ) : products.map((p) => {
                const status = p.stock === 0 ? "out" : p.stock <= p.lowStockThreshold ? "low" : "ok";
                return (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <Td><span className="font-semibold text-white">{p.name}</span></Td>
                    <Td><Badge>{p.category}</Badge></Td>
                    <Td>${Number(p.price).toFixed(2)}</Td>
                    <Td><StockBar stock={p.stock} threshold={p.lowStockThreshold} /></Td>
                    <Td><span className="text-gray-600">{p.lowStockThreshold}</span></Td>
                    <Td><span className="text-orange-400 font-semibold">${(p.stock * Number(p.price)).toFixed(2)}</span></Td>
                    <Td>
                      <Badge variant={status === "ok" ? "green" : status === "low" ? "orange" : "red"}>
                        {status === "ok" ? "In Stock" : status === "low" ? "Low Stock" : "Out of Stock"}
                      </Badge>
                    </Td>
                    <Td>
                      <Button variant="secondary" size="sm" onClick={() => { setAdjustModal(p); setAdjQty(""); setAdjType("add"); }}>
                        Adjust
                      </Button>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal
        open={!!adjustModal}
        onClose={() => setAdjustModal(null)}
        title={`Adjust Stock — ${adjustModal?.name}`}
        maxWidth="max-w-sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdjustModal(null)}>Cancel</Button>
            <Button onClick={applyAdjust} disabled={saving || !adjQty}>{saving ? "Saving…" : "Apply"}</Button>
          </>
        }
      >
        <div className="flex gap-2 mb-4">
          {(["add", "remove"] as const).map((v) => (
            <Button
              key={v}
              variant={adjType === v ? "primary" : "secondary"}
              className="flex-1"
              onClick={() => setAdjType(v)}
            >
              {v === "add" ? "➕ Add Stock" : "➖ Remove Stock"}
            </Button>
          ))}
        </div>
        <Input label="Quantity" type="number" min={1} value={adjQty} onChange={(e) => setAdjQty(e.target.value)} placeholder="Enter quantity" />
        {adjustModal && (
          <div className="mt-3 bg-[#0d0d0d] rounded-lg px-4 py-3 text-sm text-gray-500">
            Current: <span className="text-white font-bold">{adjustModal.stock}</span>
            {adjQty && (
              <> → New: <span className="text-orange-400 font-bold">
                {adjType === "add" ? adjustModal.stock + parseInt(adjQty || "0") : Math.max(0, adjustModal.stock - parseInt(adjQty || "0"))}
              </span></>
            )}
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
