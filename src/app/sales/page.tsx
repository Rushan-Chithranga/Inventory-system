"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import {
  Card,
  CardHeader,
  StatCard,
  Button,
  Badge,
  Table,
  Th,
  Td,
  EmptyState,
} from "@/components/ui";
import { useApiRequest } from "@/lib/auth-context";
import { SaleType } from "@/types";
import {
  Activity03Icon,
  CheckListIcon,
  DollarCircleIcon,
  Search02Icon,
  TransactionHistoryIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const CATEGORIES = [
  "",
  "Electronics",
  "Furniture",
  "Stationery",
  "Clothing",
  "Food & Beverage",
  "Tools",
  "Other",
];

export default function SalesPage() {
  const apiFetch = useApiRequest();
  const [sales, setSales] = useState<SaleType[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalQty, setTotalQty] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchSales = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    setLoading(true);
    apiFetch(`/api/sales?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setSales(d.sales || []);
        setTotalRevenue(d.totalRevenue || 0);
        setTotalQty(d.totalQty || 0);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSales();
  }, [search, category, dateFrom, dateTo]);

  const fmt = (n: number) => `$${Number(n).toFixed(2)}`;

  return (
    <AppShell title="Sales Report">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Revenue"
          value={fmt(totalRevenue)}
          icon={DollarCircleIcon}
        />
        <StatCard
          label="Transactions"
          value={sales.length}
          icon={TransactionHistoryIcon}
        />
        <StatCard label="Units Sold" value={totalQty} icon={CheckListIcon} />
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">
            {" "}
            <HugeiconsIcon
              icon={Search02Icon}
              size={24}
              color="currentColor"
              strokeWidth={1.5}
            />
          </span>
          <input
            placeholder="Search product…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-orange-500 placeholder:text-gray-700"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-orange-500 w-40 cursor-pointer"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="bg-[#1a1a1a]">
              {c || "All Categories"}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-orange-500 w-36"
        />
        <span className="text-gray-600 text-xs">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-orange-500 w-36"
        />
        {(search || category || dateFrom || dateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setCategory("");
              setDateFrom("");
              setDateTo("");
            }}
          >
            Reset
          </Button>
        )}
        <div className="ml-auto">
          <Button variant="secondary" size="sm">
            ⬇ Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <div className="font-bold text-white text-sm">
              Sales Transactions
            </div>
            <div className="text-xs text-gray-600 mt-0.5">
              {sales.length} records
            </div>
          </div>
        </CardHeader>
        {loading ? (
          <div className="py-16 text-center text-gray-600 animate-pulse">
            Loading…
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>#</Th>
                <Th>Product</Th>
                <Th>Category</Th>
                <Th>Qty</Th>
                <Th>Unit Price</Th>
                <Th>Total</Th>
                <Th>Date</Th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={Activity03Icon}
                      message="No sales data for selected filters"
                    />
                  </td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02]">
                    <Td>
                      <span className="font-mono text-xs text-gray-600">
                        #{String(s.id).padStart(4, "0")}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-semibold text-white">
                        {s.productName}
                      </span>
                    </Td>
                    <Td>
                      <Badge>{s.productCategory}</Badge>
                    </Td>
                    <Td>×{s.quantity}</Td>
                    <Td>{fmt(s.unitPrice)}</Td>
                    <Td>
                      <span className="text-orange-400 font-bold">
                        {fmt(s.totalPrice)}
                      </span>
                    </Td>
                    <Td>{new Date(s.saleDate).toLocaleDateString()}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </Card>
    </AppShell>
  );
}
