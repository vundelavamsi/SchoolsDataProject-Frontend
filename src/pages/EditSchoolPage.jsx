import { useState, useEffect } from "react";
import { buildUdise, displayValue } from "../lib/utils";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

export function EditSchoolPage({ school, onBack }) {
  const [villageName, setVillageName] = useState(school.villageName ?? "");
  const [submittedBy, setSubmittedBy] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [hasPending, setHasPending] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/edits/school/${encodeURIComponent(school.sourceKey)}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setHasPending(true);
      })
      .catch(() => {});
  }, [school.sourceKey]);

  const handleSave = async () => {
    if (!villageName.trim() || !submittedBy.trim()) {
      setMessage({ type: "error", text: "Both fields are required." });
      return;
    }
    if (villageName.trim() === (school.villageName ?? "").trim()) {
      setMessage({ type: "error", text: "Village Name is unchanged. Please enter a different value." });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/edits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceKey: school.sourceKey,
          fieldName: "villageName",
          newValue: villageName.trim(),
          submittedBy: submittedBy.trim(),
        }),
      });
      if (res.status === 201) {
        setMessage({ type: "success", text: "Edit submitted successfully." });
        setTimeout(onBack, 1500);
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Submission failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">Edit School</h1>
        </div>
        <nav className="header-nav">
          <button className="btn btn--outline btn--sm" onClick={onBack} type="button">
            Back
          </button>
        </nav>
      </header>

      <div className="app-main">
        <div className="page-layout">
          <div className="page-card">
            <div className="school-context">
              <div className="school-context-name">{displayValue(school.schoolName)}</div>
              <div className="school-context-udise">UDISE: {buildUdise(school.blockCd, school.udiseschCode)}</div>
            </div>

            {hasPending && (
              <div className="inline-warning">
                There is already a pending edit for this school. You can still submit a new one.
              </div>
            )}

            <div className="form-field">
              <label className="form-label" htmlFor="villageName">Village Name</label>
              <input
                id="villageName"
                className="form-input"
                type="text"
                inputMode="text"
                value={villageName}
                onChange={(e) => setVillageName(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="submittedBy">Submitted By</label>
              <input
                id="submittedBy"
                className="form-input"
                type="text"
                inputMode="text"
                value={submittedBy}
                onChange={(e) => setSubmittedBy(e.target.value)}
                placeholder="Your name"
                disabled={submitting}
              />
            </div>

            {message && (
              <div className={`inline-${message.type}`}>
                {message.text}
              </div>
            )}

            <div className="form-actions">
              <button
                className="btn btn--primary"
                onClick={handleSave}
                disabled={submitting}
                type="button"
              >
                {submitting ? "Saving..." : "Save Edit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
