"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@stockwise.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl text-3xl mb-4 shadow-lg shadow-orange-500/25">
            📦
          </div>
          <h1 className="font-display text-4xl tracking-widest text-white">STOCKWISE</h1>
          <p className="text-gray-600 text-sm mt-1 tracking-widest uppercase">Inventory Management Pro</p>
        </div>

        {/* Card */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-8">
          <h2 className="text-lg font-bold text-white mb-1">Welcome back</h2>
          <p className="text-gray-600 text-sm mb-7">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-3 text-sm text-gray-100 focus:outline-none focus:border-orange-500 transition-colors placeholder:text-gray-700"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-3 text-sm text-gray-100 focus:outline-none focus:border-orange-500 transition-colors placeholder:text-gray-700"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Demo creds */}
          <div className="mt-6 pt-5 border-t border-[#1e1e1e]">
            <p className="text-xs text-gray-600 mb-3 text-center uppercase tracking-wider">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { role: "Admin", email: "admin@stockwise.com", pass: "admin123" },
                { role: "Manager", email: "manager@stockwise.com", pass: "manager123" },
              ].map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => { setEmail(d.email); setPassword(d.pass); }}
                  className="bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-left transition-colors"
                >
                  <div className="text-xs font-bold text-orange-500">{d.role}</div>
                  <div className="text-[10px] text-gray-600 truncate mt-0.5">{d.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
