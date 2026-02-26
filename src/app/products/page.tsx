"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import {
  Card,
  CardHeader,
  Button,
  Modal,
  Input,
  Select,
  Textarea,
  Badge,
  Table,
  Th,
  Td,
  EmptyState,
  StockBar,
} from "@/components/ui";
import { useApiRequest } from "@/lib/auth-context";
import { ProductType } from "@/types";
import { Delete02Icon, Edit04Icon, Package } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "Electronics", label: "Electronics" },
  { value: "Furniture", label: "Furniture" },
  { value: "Stationery", label: "Stationery" },
  { value: "Clothing", label: "Clothing" },
  { value: "Food & Beverage", label: "Food & Beverage" },
  { value: "Tools", label: "Tools" },
  { value: "Other", label: "Other" },
];

const CAT_OPTIONS = CATEGORIES.slice(1);

export default function ProductsPage() {
  const apiFetch = useApiRequest();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ProductType | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ProductType | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Electronics",
    price: "",
    stock: "",
    barcode: "",
    lowStockThreshold: "10",
  });

  const fetchProducts = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    apiFetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category]);

  const openAdd = () => {
    setForm({
      name: "",
      description: "",
      category: "Electronics",
      price: "",
      stock: "",
      barcode: "",
      lowStockThreshold: "10",
    });
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (p: ProductType) => {
    setForm({
      name: p.name,
      description: p.description || "",
      category: p.category,
      price: String(p.price),
      stock: String(p.stock),
      barcode: p.barcode || "",
      lowStockThreshold: String(p.lowStockThreshold),
    });
    setEditing(p);
    setShowModal(true);
  };

  const save = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    const url = editing ? `/api/products/${editing.id}` : "/api/products";
    const method = editing ? "PUT" : "POST";
    await apiFetch(url, { method, body: JSON.stringify(form) });
    setSaving(false);
    setShowModal(false);
    fetchProducts();
  };

  const deleteProduct = async () => {
    if (!confirmDelete) return;
    await apiFetch(`/api/products/${confirmDelete.id}`, { method: "DELETE" });
    setConfirmDelete(null);
    fetchProducts();
  };

  const stockBadge = (p: ProductType) => {
    if (p.stock === 0) return <Badge variant="red">Out of Stock</Badge>;
    if (p.stock <= p.lowStockThreshold)
      return <Badge variant="orange">Low Stock</Badge>;
    return <Badge variant="green">In Stock</Badge>;
  };

  return (
    <AppShell title="Product Management">
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">
            🔍
          </span>
          <input
            placeholder="Search products or barcode…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-orange-500 transition-colors placeholder:text-gray-700"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-orange-500 w-44 cursor-pointer"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value} className="bg-[#1a1a1a]">
              {c.label}
            </option>
          ))}
        </select>
        <div className="ml-auto">
          <Button onClick={openAdd}>+ Add Product</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <div className="font-bold text-white text-sm">
              Product Inventory
            </div>
            <div className="text-xs text-gray-600 mt-0.5">
              {products.length} products
            </div>
          </div>
          <Button variant="secondary" size="sm">
            ⬇ Export CSV
          </Button>
        </CardHeader>
        {loading ? (
          <div className="py-16 text-center text-gray-600 animate-pulse">
            Loading products…
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Product</Th>
                <Th>Category</Th>
                <Th>Price</Th>
                <Th>Stock</Th>
                <Th>Barcode</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon={Package} message="No products found" />
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <Td>
                      <div className="font-semibold text-white">{p.name}</div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {p.description}
                      </div>
                    </Td>
                    <Td>
                      <Badge>{p.category}</Badge>
                    </Td>
                    <Td>
                      <span className="text-orange-400 font-bold">
                        ${Number(p.price).toFixed(2)}
                      </span>
                    </Td>
                    <Td>
                      <StockBar
                        stock={p.stock}
                        threshold={p.lowStockThreshold}
                      />
                    </Td>
                    <Td>
                      <span className="font-mono text-xs text-gray-600">
                        {p.barcode}
                      </span>
                    </Td>
                    <Td>{stockBadge(p)}</Td>
                    <Td>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openEdit(p)}
                        >
                          {" "}
                          <HugeiconsIcon
                            icon={Edit04Icon}
                            size={24}
                            color="currentColor"
                            strokeWidth={1.5}
                          />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setConfirmDelete(p)}
                        >
                          <HugeiconsIcon
                            icon={Delete02Icon}
                            size={24}
                            color="currentColor"
                            strokeWidth={1.5}
                          />
                        </Button>
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Product" : "Add New Product"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Add Product"}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input
              label="Product Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Wireless Headphones"
            />
          </div>
          <div className="col-span-2">
            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Brief product description"
            />
          </div>
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={CAT_OPTIONS}
          />
          <Input
            label="Price *"
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="0.00"
          />
          <Input
            label="Stock Quantity"
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            placeholder="0"
          />
          <Input
            label="Low Stock Threshold"
            type="number"
            value={form.lowStockThreshold}
            onChange={(e) =>
              setForm({ ...form, lowStockThreshold: e.target.value })
            }
            placeholder="10"
          />
          <div className="col-span-2">
            <Input
              label="Barcode"
              value={form.barcode}
              onChange={(e) => setForm({ ...form, barcode: e.target.value })}
              placeholder="Scan or enter barcode"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Product"
        maxWidth="max-w-sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={deleteProduct}>
              Delete Product
            </Button>
          </>
        }
      >
        <p className="text-gray-400 text-sm">
          Are you sure you want to delete{" "}
          <strong className="text-white">{confirmDelete?.name}</strong>? This
          action cannot be undone.
        </p>
      </Modal>
    </AppShell>
  );
}
