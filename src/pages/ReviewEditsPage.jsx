import { useState, useEffect, useCallback } from "react";
import { displayValue, buildUdise } from "../lib/utils";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { buildAccessHeaders } from "../lib/access";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";
const TABS = ["all", "pending", "approved", "rejected"];
const TAB_LABELS = { all: "All", pending: "Pending", approved: "Approved", rejected: "Rejected" };
const FIELD_LABELS = { villageName: "Village Name", gmapLocationLink: "Location Link" };

function StatusBadge({ status }) {
  const cls =
    status === "approved"
      ? "badge badge--operational"
      : status === "rejected"
      ? "badge badge--closed"
      : "badge badge--other";
  return <span className={cls}>{status}</span>;
}

function EditCardView({ rows, inFlight, rowErrors, onAction, canReview }) {
  return (
    <div className="edit-cards">
      {rows.map((row) => (
        <div key={row.id} className="edit-card">
          <div className="edit-card-header">
            <span className="edit-card-school">{displayValue(row.schoolName)}</span>
            <StatusBadge status={row.status} />
          </div>
          <div className="edit-card-body">
            <div className="edit-card-meta">
              <span>UDISE: <strong>{buildUdise(row.blockCd, row.udiseschCode)}</strong></span>
              <span>By: <strong>{displayValue(row.submittedBy)}</strong></span>
              <span>{row.submittedAt ? new Date(row.submittedAt).toLocaleDateString() : "—"}</span>
            </div>
            <div className="edit-card-field-name">{FIELD_LABELS[row.fieldName] || row.fieldName}</div>
            <div className="edit-card-change">
              <span className="edit-card-old">{displayValue(row.oldValue)}</span>
              <span className="edit-card-arrow">&rarr;</span>
              <span className="edit-card-new">{displayValue(row.newValue)}</span>
            </div>
            {row.reviewedAt && (
              <div className="review-time">
                Reviewed: {new Date(row.reviewedAt).toLocaleString()}
              </div>
            )}
            {rowErrors[row.id] && (
              <div className="row-error">{rowErrors[row.id]}</div>
            )}
          </div>
          {row.status === "pending" && canReview && (
            <div className="edit-card-actions">
              <button
                className="btn btn--success btn--sm"
                onClick={() => onAction(row.id, "approve")}
                disabled={!!inFlight[row.id]}
                type="button"
              >
                Approve
              </button>
              <button
                className="btn btn--danger btn--sm"
                onClick={() => onAction(row.id, "reject")}
                disabled={!!inFlight[row.id]}
                type="button"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function EditTableView({ rows, inFlight, rowErrors, onAction, canReview }) {
  return (
    <div className="edits-table-wrapper">
      <table className="edits-table">
        <thead>
          <tr>
            <th>School Name</th>
            <th>UDISE</th>
            <th>Field</th>
            <th>Old Value</th>
            <th>New Value</th>
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
              <td className="td-muted">{buildUdise(row.blockCd, row.udiseschCode)}</td>
              <td className="td-muted">{FIELD_LABELS[row.fieldName] || row.fieldName}</td>
              <td>{displayValue(row.oldValue)}</td>
              <td><strong>{displayValue(row.newValue)}</strong></td>
              <td>{displayValue(row.submittedBy)}</td>
              <td className="td-muted">
                {row.submittedAt ? new Date(row.submittedAt).toLocaleString() : "—"}
              </td>
              <td>
                <StatusBadge status={row.status} />
                {row.reviewedAt && (
                  <div className="review-time">
                    {new Date(row.reviewedAt).toLocaleString()}
                  </div>
                )}
              </td>
              <td>
                {row.status === "pending" && canReview ? (
                  <div>
                    <div className="td-actions">
                      <button
                        className="btn btn--success btn--sm"
                        onClick={() => onAction(row.id, "approve")}
                        disabled={!!inFlight[row.id]}
                        type="button"
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn--danger btn--sm"
                        onClick={() => onAction(row.id, "reject")}
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
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ReviewEditsPage({ onBack, phone, canReview, canEdit }) {
  const [activeTab, setActiveTab] = useState("all");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowErrors, setRowErrors] = useState({});
  const [inFlight, setInFlight] = useState({});
  const isMobile = useMediaQuery("(max-width: 767px)");

  const fetchEdits = useCallback(async (tab) => {
    if (!canReview && !canEdit) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const url =
        tab === "all"
          ? `${API_BASE}/api/edits`
          : `${API_BASE}/api/edits?status=${tab}`;
      const res = await fetch(url, { headers: buildAccessHeaders(phone) });
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [canReview, canEdit, phone]);

  useEffect(() => {
    fetchEdits(activeTab);
  }, [activeTab, fetchEdits]);

  const handleAction = async (id, action) => {
    if (!canReview) return;
    setInFlight((prev) => ({ ...prev, [id]: true }));
    setRowErrors((prev) => ({ ...prev, [id]: null }));
    try {
      const res = await fetch(`${API_BASE}/api/edits/${id}/${action}`, {
        method: "POST",
        headers: buildAccessHeaders(phone),
      });
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
    <div className="app-layout">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">{canReview ? "Edit Requests" : "My Edit Requests"}</h1>
        </div>
        <nav className="header-nav">
          <button className="btn btn--outline btn--sm" onClick={onBack} type="button">
            Back
          </button>
        </nav>
      </header>

      <div className="app-main">
        <div className="page-layout review-layout">
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
              <p>Loading...</p>
            </div>
          ) : !canReview && !canEdit ? (
            <div className="card-grid-state">
              <p className="no-results">This phone number does not have edit or review permission.</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="card-grid-state">
              <p className="no-results">No edit requests found.</p>
            </div>
          ) : isMobile ? (
            <EditCardView
              rows={rows}
              inFlight={inFlight}
              rowErrors={rowErrors}
              onAction={handleAction}
              canReview={canReview}
            />
          ) : (
            <EditTableView
              rows={rows}
              inFlight={inFlight}
              rowErrors={rowErrors}
              onAction={handleAction}
              canReview={canReview}
            />
          )}
        </div>
      </div>
    </div>
  );
}
