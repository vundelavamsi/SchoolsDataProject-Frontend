import { useState, useEffect, useCallback } from "react";
import { displayValue, maskUdise } from "../lib/utils";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";
const TABS = ["all", "pending", "approved", "rejected"];
const TAB_LABELS = { all: "All", pending: "Pending", approved: "Approved", rejected: "Rejected" };

function StatusBadge({ status }) {
  const cls =
    status === "approved"
      ? "badge badge--operational"
      : status === "rejected"
      ? "badge badge--closed"
      : "badge badge--other";
  return <span className={cls}>{status}</span>;
}

export function ReviewEditsPage({ onBack }) {
  const [activeTab, setActiveTab] = useState("all");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowErrors, setRowErrors] = useState({}); // id → error string
  const [inFlight, setInFlight] = useState({}); // id → true while request pending

  const fetchEdits = useCallback(async (tab) => {
    setLoading(true);
    try {
      const url =
        tab === "all"
          ? `${API_BASE}/api/edits`
          : `${API_BASE}/api/edits?status=${tab}`;
      const res = await fetch(url);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEdits(activeTab);
  }, [activeTab, fetchEdits]);

  const handleAction = async (id, action) => {
    setInFlight((prev) => ({ ...prev, [id]: true }));
    setRowErrors((prev) => ({ ...prev, [id]: null }));
    try {
      const res = await fetch(`${API_BASE}/api/edits/${id}/${action}`, { method: "POST" });
      if (res.ok) {
        fetchEdits(activeTab);
      } else {
        const data = await res.json();
        setRowErrors((prev) => ({ ...prev, [id]: data.error || `${action} failed` }));
      }
    } catch {
      setRowErrors((prev) => ({ ...prev, [id]: "Network error" }));
    } finally {
      setInFlight((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="page-layout" style={{ maxWidth: 1200 }}>
      <button className="page-back" onClick={onBack} type="button">
        ← Back to search
      </button>

      <h1 className="page-title">Edit Requests</h1>

      <div className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`tab-btn${activeTab === tab ? " tab-btn--active" : ""}`}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card-grid-state">
          <div className="spinner" aria-label="Loading" />
          <p>Loading…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="card-grid-state">
          <p className="no-results">No edit requests found.</p>
        </div>
      ) : (
        <div className="page-card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="edits-table">
            <thead>
              <tr>
                <th>School Name</th>
                <th>UDISE</th>
                <th>Old Village</th>
                <th>New Village</th>
                <th>Submitted By</th>
                <th>Submitted At</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{displayValue(row.schoolName)}</td>
                  <td>{maskUdise(row.udiseschCode)}</td>
                  <td>{displayValue(row.oldValue)}</td>
                  <td><strong>{displayValue(row.newValue)}</strong></td>
                  <td>{displayValue(row.submittedBy)}</td>
                  <td style={{ whiteSpace: "nowrap", fontSize: 12, color: "var(--color-text-muted)" }}>
                    {row.submittedAt ? new Date(row.submittedAt).toLocaleString() : "—"}
                  </td>
                  <td>
                    <StatusBadge status={row.status} />
                    {row.reviewedAt && (
                      <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
                        {new Date(row.reviewedAt).toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td>
                    {row.status === "pending" && (
                      <div style={{ display: "flex", gap: 6, flexDirection: "column" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn btn--sm"
                            style={{ background: "var(--color-success)", color: "#fff", border: "none" }}
                            onClick={() => handleAction(row.id, "approve")}
                            disabled={!!inFlight[row.id]}
                            type="button"
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn--sm"
                            style={{ background: "var(--color-danger)", color: "#fff", border: "none" }}
                            onClick={() => handleAction(row.id, "reject")}
                            disabled={!!inFlight[row.id]}
                            type="button"
                          >
                            Reject
                          </button>
                        </div>
                        {rowErrors[row.id] && (
                          <div className="row-error">{rowErrors[row.id]}</div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
