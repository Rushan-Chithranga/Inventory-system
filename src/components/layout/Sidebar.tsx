"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import clsx from "clsx";
import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home02Icon,
  PackageIcon,
  Chart01Icon,
  ArchiveIcon,
  User02Icon,
} from "@hugeicons/core-free-icons";
type IconType = React.ComponentProps<typeof HugeiconsIcon>["icon"];

interface NavItem {
  href: string;
  label: string;
  icon: IconType;
  adminOnly?: boolean;
  badge?: number;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home02Icon },
  { href: "/products", label: "Products", icon: PackageIcon },
  // { href: "/barcode", label: "Barcode Scanner", icon: BarcodeScanIcon },
];

const REPORTS: NavItem[] = [
  { href: "/sales", label: "Sales Report", icon: Chart01Icon },
  { href: "/stock", label: "Stock Report", icon: ArchiveIcon },
  // { href: "/reports", label: "All Reports", icon: Analytics01Icon },
];

const ADMIN: NavItem[] = [
  { href: "/users", label: "Users & Roles", icon: User02Icon, adminOnly: true },
];

interface SidebarProps {
  lowStockCount?: number;
}

export default function Sidebar({ lowStockCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials =
    user?.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "??";

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-60 bg-[#111] border-r border-[#1e1e1e] flex flex-col z-50">
      <div className="px-5 py-6 border-b border-[#1e1e1e] flex items-center gap-3">
        <div className="w-9 h-9 border p-2 border-gray-500 flex items-center justify-center text-lg flex-shrink-0 backdrop-blur-[6px] rounded-[8px]">
          <HugeiconsIcon
            icon={PackageIcon}
            size={24}
            color="currentColor"
            strokeWidth={1.5}
          />
        </div>
        <div>
          <div className="font-display text-xl tracking-wide text-white leading-none">
            STOCKWISE
          </div>
          <div className="text-[10px] text-gray-600 tracking-widest uppercase mt-0.5">
            Inventory Pro
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto flex flex-col gap-0.5">
        <p className="text-[10px] uppercase tracking-widest text-gray-600 px-2 py-3 font-semibold">
          Main
        </p>
        {NAV.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={pathname === item.href}
          />
        ))}

        <p className="text-[10px] uppercase tracking-widest text-gray-600 px-2 py-3 mt-2 font-semibold">
          Reports
        </p>
        {REPORTS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={pathname === item.href}
            badge={
              item.href === "/stock" && lowStockCount > 0
                ? lowStockCount
                : undefined
            }
          />
        ))}

        {user?.role === "Admin" && (
          <>
            <p className="text-[10px] uppercase tracking-widest text-gray-600 px-2 py-3 mt-2 font-semibold">
              Admin
            </p>
            {ADMIN.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={pathname === item.href}
              />
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-[#1e1e1e]">
        <div className="flex items-center gap-2.5 bg-[#1a1a1a] rounded-xl p-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-100 truncate">
              {user?.name}
            </div>
            <div className="text-[11px] text-orange-500">{user?.role}</div>
          </div>
          <button
            onClick={logout}
            className="text-gray-600 hover:text-orange-500 text-sm transition-colors"
            title="Logout"
          >
            →
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavLink({
  item,
  active,
  badge,
}: {
  item: NavItem;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={item.href}
      className={clsx(
        "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
        active
          ? "bg-orange-500/15 text-orange-500"
          : "text-gray-500 hover:text-gray-300 hover:bg-white/5",
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-orange-500 rounded-r" />
      )}
      <span className="text-sm">
        <HugeiconsIcon
          icon={item.icon}
          className="text-primary-light-secondary"
        />
      </span>
      <span>{item.label}</span>
      {badge !== undefined && (
        <span className="ml-auto bg-orange-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}
