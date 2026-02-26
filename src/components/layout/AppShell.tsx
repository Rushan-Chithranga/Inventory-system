"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Sidebar from "./Sidebar";
import { useApiRequest } from "@/lib/auth-context";

interface AppShellProps {
  children: React.ReactNode;
  title: string;
}

export default function AppShell({ children, title }: AppShellProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const apiFetch = useApiRequest();
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      apiFetch("/api/dashboard")
        .then((r) => r.json())
        .then((d) => setLowStockCount(d.lowStockCount || 0))
        .catch(() => {});
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-orange-500 text-2xl animate-pulse font-display tracking-widest">
          LOADING...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar lowStockCount={lowStockCount} />
      <div className="ml-60 flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-[#0f0f0f] border-b border-[#1e1e1e] px-7 h-16 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">{title}</h1>
          <div className="flex items-center gap-3">
            {lowStockCount > 0 && (
              <span className="text-xs text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                ⚠️ {lowStockCount} low stock
              </span>
            )}
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short", month: "short", day: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-7">{children}</main>
      </div>
    </div>
  );
}
