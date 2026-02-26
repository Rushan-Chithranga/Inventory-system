"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import {
  Card,
  CardHeader,
  StatCard,
  Button,
  Modal,
  Input,
  Select,
  Badge,
  Table,
  Th,
  Td,
  EmptyState,
} from "@/components/ui";
import { useApiRequest, useAuth } from "@/lib/auth-context";
import { UserType } from "@/types";
import {
  Delete02Icon,
  Edit01Icon,
  Edit04Icon,
  EditIcon,
  Remove01Icon,
  User03Icon,
  UserCheck01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function UsersPage() {
  const apiFetch = useApiRequest();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Store Manager",
  });
  const [error, setError] = useState("");

  const fetchUsers = () => {
    apiFetch("/api/users")
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const save = async () => {
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }
    setSaving(true);
    const res = await apiFetch("/api/users", {
      method: "POST",
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Failed to create user");
      return;
    }
    setShowModal(false);
    setForm({ name: "", email: "", password: "", role: "Store Manager" });
    fetchUsers();
  };

  const adminCount = users.filter((u) => u.role === "Admin").length;
  const activeCount = users.filter((u) => u.isActive).length;

  const PERMISSIONS = [
    ["View Dashboard", true, true],
    ["Manage Products (CRUD)", true, true],
    ["Adjust Stock", true, true],
    ["View Sales Reports", true, true],
    ["Generate Reports", true, true],
    ["Manage Users", true, false],
    ["System Settings", true, false],
    ["Delete Any Record", true, false],
  ];

  return (
    <AppShell title="Users & Roles">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Users"
          value={users.length}
          icon={UserMultiple02Icon}
        />
        <StatCard label="Admins" value={adminCount} icon={User03Icon} />
        <StatCard
          label="Active Users"
          value={activeCount}
          icon={UserCheck01Icon}
        />
      </div>

      <div className="flex items-center justify-end mb-5">
        <Button
          onClick={() => {
            setShowModal(true);
            setError("");
          }}
        >
          + Invite User
        </Button>
      </div>

      <Card className="mb-5">
        <CardHeader>
          <div className="font-bold text-white text-sm">
            Users & Access Control
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
                <Th>User</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Last Login</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={UserMultiple02Icon}
                      message="No users found"
                    />
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const initials = u.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase();
                  const isMe = currentUser?.email === u.email;
                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02]">
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{
                              background:
                                u.role === "Admin"
                                  ? "linear-gradient(135deg,#f97316,#ea580c)"
                                  : "linear-gradient(135deg,#3b82f6,#2563eb)",
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              {u.name}
                            </div>
                            {isMe && (
                              <div className="text-[10px] text-orange-500">
                                (You)
                              </div>
                            )}
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <span className="text-gray-500">{u.email}</span>
                      </Td>
                      <Td>
                        <span
                          className={
                            u.role === "Admin"
                              ? "text-orange-500 font-semibold"
                              : "text-blue-400 font-semibold"
                          }
                        >
                          {u.role === "Admin" ? "🔑 Admin" : "🏪 Store Manager"}
                        </span>
                      </Td>
                      <Td>
                        <Badge variant={u.isActive ? "green" : "gray"}>
                          {u.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </Td>
                      <Td>
                        <span className="text-xs text-gray-600">
                          {u.lastLogin
                            ? new Date(u.lastLogin).toLocaleDateString()
                            : "Never"}
                        </span>
                      </Td>
                      <Td>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm">
                            <HugeiconsIcon
                              icon={Edit04Icon}
                              size={24}
                              color="currentColor"
                              strokeWidth={1.5}
                            />{" "}
                            Edit
                          </Button>
                          {!isMe && (
                            <Button variant="danger" size="sm">
                              <HugeiconsIcon
                                icon={Delete02Icon}
                                size={24}
                                color="currentColor"
                                strokeWidth={1.5}
                              />{" "}
                              Remove
                            </Button>
                          )}
                        </div>
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader>
          <div>
            <div className="font-bold text-white text-sm">Role Permissions</div>
            <div className="text-xs text-gray-600 mt-0.5">
              Access control matrix
            </div>
          </div>
        </CardHeader>
        <Table>
          <thead>
            <tr>
              <Th>Feature</Th>
              <Th>Admin</Th>
              <Th>Store Manager</Th>
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map(([feat, admin, mgr]) => (
              <tr key={feat as string} className="hover:bg-white/[0.02]">
                <Td>
                  <span className="text-gray-300">{feat as string}</span>
                </Td>
                <Td>
                  <span
                    className={
                      admin
                        ? "text-green-400 font-bold"
                        : "text-red-400 font-bold"
                    }
                  >
                    {admin ? "✓ Yes" : "✕ No"}
                  </span>
                </Td>
                <Td>
                  <span
                    className={
                      mgr
                        ? "text-green-400 font-bold"
                        : "text-red-400 font-bold"
                    }
                  >
                    {mgr ? "✓ Yes" : "✕ No"}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Invite New User"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Creating…" : "Create User"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Full Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="John Doe"
          />
          <Input
            label="Email *"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="john@company.com"
          />
          <Input
            label="Password *"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Min. 8 characters"
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={[
              { value: "Store Manager", label: "Store Manager" },
              { value: "Admin", label: "Admin" },
            ]}
          />
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      </Modal>
    </AppShell>
  );
}
