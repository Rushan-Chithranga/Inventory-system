"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { Card, CardHeader, StatCard, Button, Modal, Select, Badge, Table, Th, Td, EmptyState } from "@/components/ui";
import { useApiRequest } from "@/lib/auth-context";
import { ReportType } from "@/types";
import { DollarCircleIcon } from "@hugeicons/core-free-icons";

const REPORT_TYPES = [
  { value: "Stock Level", label: "Stock Level" },
  { value: "Sales Summary", label: "Sales Summary" },
  { value: "Purchase Report", label: "Purchase Report" },
];

const TYPE_ICONS: Record<string, string> = {
  "Stock Level": "🗄️",
  "Sales Summary": "📊",
  "Purchase Report": "🧾",
};

export default function ReportsPage() {
  const apiFetch = useApiRequest();
  const [reports, setReports] = useState<ReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [genType, setGenType] = useState("Stock Level");
  const [generating, setGenerating] = useState(false);

  const fetchReports = () => {
    apiFetch("/api/reports")
      .then((r) => r.json())
      .then((d) => { setReports(d.reports || []); setLoading(false); });
  };

  useEffect(() => { fetchReports(); }, []);

  const generateReport = async () => {
    setGenerating(true);
    await apiFetch("/api/reports", { method: "POST", body: JSON.stringify({ type: genType }) });
    setGenerating(false);
    setShowModal(false);
    fetchReports();
  };

  const statusVariant = (s: string) => {
    if (s === "Good") return "green";
    if (s === "Warning") return "orange";
    if (s === "High") return "blue";
    return "gray";
  };

  const warningCount = reports.filter((r) => r.status === "Warning").length;

  return (
    <AppShell title="All Reports">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Reports" value={reports.length} icon={DollarCircleIcon} />
        <StatCard label="This Month" value={reports.filter(r => new Date(r.generatedAt).getMonth() === new Date().getMonth()).length} icon={DollarCircleIcon} />
        <StatCard label="Warnings" value={warningCount} icon={DollarCircleIcon} changeType={warningCount > 0 ? "warn" : undefined} />
      </div>

      <div className="flex items-center justify-end mb-5">
        <Button onClick={() => setShowModal(true)}>+ Generate Report</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="font-bold text-white text-sm">Report History</div>
        </CardHeader>
        {loading ? (
          <div className="py-16 text-center text-gray-600 animate-pulse">Loading…</div>
        ) : (
          <Table>
            <thead>
              <tr><Th>Report Type</Th><Th>Summary</Th><Th>Generated</Th><Th>Status</Th><Th>Actions</Th></tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr><td colSpan={5}><EmptyState icon="📋" message="No reports generated yet" /></td></tr>
              ) : reports.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.02]">
                  <Td>
                    <div className="flex items-center gap-2">
                      <span>{TYPE_ICONS[r.type] || "📋"}</span>
                      <span className="font-semibold text-white">{r.type}</span>
                    </div>
                  </Td>
                  <Td><span className="text-xs text-gray-500 line-clamp-2 max-w-xs">{r.summary}</span></Td>
                  <Td>{new Date(r.generatedAt).toLocaleDateString()}</Td>
                  <Td><Badge variant={statusVariant(r.status) as "green" | "orange" | "blue" | "gray"}>{r.status}</Badge></Td>
                  <Td>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm">👁 View</Button>
                      <Button variant="secondary" size="sm">⬇ Export</Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Generate New Report"
        maxWidth="max-w-sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={generateReport} disabled={generating}>{generating ? "Generating…" : "Generate"}</Button>
          </>
        }
      >
        <Select
          label="Report Type"
          value={genType}
          onChange={(e) => setGenType(e.target.value)}
          options={REPORT_TYPES}
        />
        <p className="mt-4 text-xs text-gray-600">
          This will generate a snapshot report of current data and save it to the report history.
        </p>
      </Modal>
    </AppShell>
  );
}
