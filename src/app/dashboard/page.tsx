"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { StatCard, Card, CardHeader, Badge, AlertBar, Table, Th, Td, Button } from "@/components/ui";
import { useApiRequest } from "@/lib/auth-context";
import { DashboardStats } from "@/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useRouter } from "next/navigation";
import { AutoConversationsIcon, CorporateIcon, DollarCircleIcon, PackageIcon, SecurityWarningIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const COLORS = ["#f97316", "#ea580c", "#fb923c", "#fed7aa", "#fdba74"];

export default function DashboardPage() {
  const apiFetch = useApiRequest();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fmt = (n: number) => `$${Number(n).toFixed(2)}`;

  if (loading) return (
    <AppShell title="Dashboard">
      <div className="text-center py-20 text-gray-600 animate-pulse">Loading dashboard…</div>
    </AppShell>
  );

  return (
    <AppShell title="Dashboard">
      {stats && stats.lowStockCount > 0 && (
        <AlertBar>
          <strong>{stats.lowStockCount} product{stats.lowStockCount > 1 ? "s" : ""}</strong> are below the low stock threshold.
          <Button variant="secondary" size="sm" className="ml-auto" onClick={() => router.push("/stock")}>
            View Stock
          </Button>
        </AlertBar>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Revenue" value={fmt(stats?.totalRevenue || 0)} icon={DollarCircleIcon} change="↑ 12.4% this month" changeType="up" />
        <StatCard label="Total Products" value={stats?.totalProducts || 0} icon={PackageIcon} change={`${stats?.lowStockCount || 0} low stock`} changeType="warn" />
        <StatCard label="Items in Stock" value={(stats?.totalStock || 0).toLocaleString()} icon={AutoConversationsIcon} change="↑ 3.1% this week" changeType="up" />
        <StatCard label="Total Sales" value={stats?.totalSales || 0} icon={CorporateIcon} change="All time transactions" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <div>
              <div className="font-bold text-white text-sm">Monthly Revenue</div>
              <div className="text-xs text-gray-600 mt-0.5">Sales revenue per month</div>
            </div>
          </CardHeader>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats?.monthlySales || []}>
                <XAxis dataKey="month" tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8 }}
                  labelStyle={{ color: "#fff" }}
                  formatter={(v: number) => [`$${v.toFixed(0)}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <div className="font-bold text-white text-sm">Revenue by Category</div>
              <div className="text-xs text-gray-600 mt-0.5">Breakdown of sales</div>
            </div>
          </CardHeader>
          <div className="p-5 flex items-center gap-6">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={stats?.categoryRevenue || []} dataKey="revenue" cx={65} cy={65} innerRadius={40} outerRadius={65}>
                  {(stats?.categoryRevenue || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 flex-1">
              {(stats?.categoryRevenue || []).slice(0, 5).map((c, i) => (
                <div key={c.category} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                  <span className="text-gray-500 flex-1">{c.category}</span>
                  <span className="font-semibold text-gray-300">{fmt(c.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="font-bold text-white text-sm">Recent Sales</div>
            <Button variant="secondary" size="sm" onClick={() => router.push("/sales")}>View All</Button>
          </CardHeader>
          <Table>
            <thead><tr><Th>Product</Th><Th>Qty</Th><Th>Total</Th><Th>Date</Th></tr></thead>
            <tbody>
              {(stats?.recentSales || []).map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.02]">
                  <Td><span className="font-semibold text-white">{s.productName}</span></Td>
                  <Td>×{s.quantity}</Td>
                  <Td><span className="text-orange-400 font-bold">{fmt(s.totalPrice)}</span></Td>
                  <Td>{new Date(s.saleDate).toLocaleDateString()}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card>
          <CardHeader>
            <div className="font-bold text-white text-sm"><HugeiconsIcon
            icon={SecurityWarningIcon}
            size={24}
            color="currentColor"
            strokeWidth={1.5}
          /> Low Stock Alert</div>
            <Button variant="secondary" size="sm" onClick={() => router.push("/stock")}>Manage</Button>
          </CardHeader>
          <Table>
            <thead><tr><Th>Product</Th><Th>Stock</Th><Th>Status</Th></tr></thead>
            <tbody>
              {(stats?.lowStockProducts || []).length === 0 ? (
                <tr><td colSpan={3} className="text-center py-8 text-gray-600 text-sm">All products sufficiently stocked ✓</td></tr>
              ) : (
                (stats?.lowStockProducts || []).map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <Td><span className="font-semibold text-white">{p.name}</span></Td>
                    <Td><span className={p.stock === 0 ? "text-red-400" : "text-orange-400"} style={{ fontWeight: 700 }}>{p.stock}</span></Td>
                    <Td>
                      <Badge variant={p.stock === 0 ? "red" : "orange"}>
                        {p.stock === 0 ? "Out of Stock" : "Low Stock"}
                      </Badge>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card>
      </div>
    </AppShell>
  );
}
