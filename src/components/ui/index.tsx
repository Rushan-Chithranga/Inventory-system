import { SecurityWarningIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import clsx from "clsx";
import { ReactNode } from "react";

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  children: ReactNode;
}

type IconType = React.ComponentProps<typeof HugeiconsIcon>["icon"];

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: BtnProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center gap-1.5 font-semibold rounded-lg transition-all cursor-pointer border-0",
        size === "sm" ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2.5",
        variant === "primary" && "bg-orange-500 text-black hover:bg-orange-600",
        variant === "secondary" &&
          "bg-[#1e1e1e] text-gray-300 border border-[#2a2a2a] hover:border-gray-500 hover:text-white",
        variant === "danger" &&
          "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
        variant === "ghost" &&
          "text-gray-500 hover:text-white hover:bg-white/5",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "px-5 py-4 border-b border-[#1e1e1e] flex items-center justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: IconType;
  change?: string;
  changeType?: "up" | "down" | "warn";
}

export function StatCard({
  label,
  value,
  icon,
  change,
  changeType,
}: StatCardProps) {
  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5 relative overflow-hidden hover:border-[#333] transition-colors">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-radial from-orange-500/8 to-transparent rounded-full translate-x-5 -translate-y-5" />
      <div className="w-10 h-10 bg-orange-500/12 rounded-xl flex items-center justify-center text-lg mb-3.5">
        <HugeiconsIcon
          icon={icon}
          size={24}
          color="currentColor"
          strokeWidth={1.5}
        />
      </div>
      <div className="text-[11px] text-gray-600 uppercase tracking-widest font-semibold">
        {label}
      </div>
      <div className="text-3xl font-bold text-white mt-1 leading-none">
        {value}
      </div>
      {change && (
        <div
          className={clsx(
            "text-xs mt-1.5",
            changeType === "up" && "text-green-400",
            changeType === "down" && "text-red-400",
            changeType === "warn" && "text-orange-400",
            !changeType && "text-gray-500",
          )}
        >
          {change}
        </div>
      )}
    </div>
  );
}

type BadgeVariant = "green" | "red" | "orange" | "blue" | "gray";

export function Badge({
  children,
  variant = "gray",
}: {
  children: ReactNode;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold",
        variant === "green" && "bg-green-500/10 text-green-400",
        variant === "red" && "bg-red-500/10 text-red-400",
        variant === "orange" && "bg-orange-500/10 text-orange-400",
        variant === "blue" && "bg-blue-500/10 text-blue-400",
        variant === "gray" && "bg-white/6 text-gray-500",
      )}
    >
      {children}
    </span>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className={clsx(
          "bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-gray-100",
          "focus:outline-none focus:border-orange-500 transition-colors placeholder:text-gray-700",
          className,
        )}
        {...props}
      />
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        className={clsx(
          "bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-gray-100",
          "focus:outline-none focus:border-orange-500 transition-colors appearance-none cursor-pointer",
          className,
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#1a1a1a]">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        className={clsx(
          "bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-gray-100",
          "focus:outline-none focus:border-orange-500 transition-colors resize-y min-h-[80px]",
          className,
        )}
        {...props}
      />
    </div>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-lg",
}: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={clsx(
          "bg-[#111] border border-[#2a2a2a] rounded-2xl w-full max-h-[90vh] overflow-y-auto",
          "animate-[slideUp_0.2s_ease]",
          maxWidth,
        )}
        style={{ animation: "slideUp 0.2s ease" }}
      >
        <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }`}</style>
        <div className="px-6 py-5 border-b border-[#1e1e1e] flex items-center justify-between">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-white text-lg transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-[#1e1e1e] flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function StockBar({
  stock,
  threshold,
}: {
  stock: number;
  threshold: number;
}) {
  const status = stock === 0 ? "out" : stock <= threshold ? "low" : "ok";
  const pct = Math.min((stock / (threshold * 3)) * 100, 100);
  const color =
    status === "ok" ? "#22c55e" : status === "low" ? "#f97316" : "#ef4444";
  return (
    <div>
      <div className="font-bold text-sm" style={{ color }}>
        {stock}
      </div>
      <div className="w-16 h-1 bg-[#1e1e1e] rounded-full mt-1">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  message,
}: {
  icon: string;
  message: string;
}) {
  return (
    <div className="text-center py-16 text-gray-600">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function AlertBar({ children }: { children: ReactNode }) {
  return (
    <div className="bg-orange-500/8 border border-orange-500/25 rounded-xl px-4 py-3 flex items-center gap-2.5 mb-5 text-sm text-orange-400">
      <HugeiconsIcon
        icon={SecurityWarningIcon}
        size={24}
        color="currentColor"
        strokeWidth={1.8}
      />{" "}
      {children}
    </div>
  );
}
export function Table({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className={clsx("w-full border-collapse", className)}>
        {children}
      </table>
    </div>
  );
}

export function Th({ children }: { children: ReactNode }) {
  return (
    <th className="text-left px-4 py-3 text-[11px] uppercase tracking-widest text-gray-600 bg-[#0d0d0d] border-b border-[#1e1e1e] font-semibold">
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={clsx(
        "px-4 py-3.5 text-sm text-gray-400 border-b border-[#141414]",
        className,
      )}
    >
      {children}
    </td>
  );
}
