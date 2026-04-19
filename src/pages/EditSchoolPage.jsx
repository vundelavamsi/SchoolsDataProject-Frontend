import { useState, useEffect } from "react";
import { buildUdise, displayValue } from "../lib/utils";
import { buildAccessHeaders } from "../lib/access";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

function toGoogleMapsLink(lat, lng) {
  return `https://maps.google.com/?q=${encodeURIComponent(`${lat},${lng}`)}`;
}

export function EditSchoolPage({ school, onBack, phone, canEdit }) {
  const [villageName, setVillageName] = useState(school.villageName ?? "");
  const [pincode, setPincode] = useState(school.pincode ?? "");
  const [classFrom, setClassFrom] = useState(school.classFrm ?? "");
  const [classTo, setClassTo] = useState(school.classTo ?? "");
  const [gmapLocationLink, setGmapLocationLink] = useState(school.gmapLocationLink ?? "");
  const [submittedBy, setSubmittedBy] = useState("");
  const [locationTab, setLocationTab] = useState("manual");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [hasPending, setHasPending] = useState(false);

  useEffect(() => {
    if (!canEdit || !phone) {
      setHasPending(false);
      return;
    }
    fetch(`${API_BASE}/api/edits/school/${encodeURIComponent(school.sourceKey)}`, {
      headers: buildAccessHeaders(phone),
    })
      .then((r) => r.json())
      .then((data) => {
        setHasPending(Array.isArray(data) && data.length > 0);
      })
      .catch(() => {});
  }, [school.sourceKey, phone, canEdit]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported in this browser.");
      return;
    }

    setGeoLoading(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const generatedLink = toGoogleMapsLink(latitude, longitude);
        setGmapLocationLink(generatedLink);
        setGeoLoading(false);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError("Location permission denied. Please allow location access and try again.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setGeoError("Unable to detect current location.");
        } else if (error.code === error.TIMEOUT) {
          setGeoError("Location request timed out. Please try again.");
        } else {
          setGeoError("Unable to detect current location.");
        }
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleSave = async () => {
    if (!canEdit) {
      setMessage({ type: "error", text: "This phone number does not have edit access." });
      return;
    }
    if (!submittedBy.trim()) {
      setMessage({ type: "error", text: "Submitted By is required." });
      return;
    }

    const villageChanged = villageName.trim() !== (school.villageName ?? "").trim();
    const pincodeChanged = pincode.trim() !== String(school.pincode ?? "").trim();
    const classFromChanged = classFrom.trim() !== String(school.classFrm ?? "").trim();
    const classToChanged = classTo.trim() !== String(school.classTo ?? "").trim();
    const locationChanged = gmapLocationLink.trim() !== (school.gmapLocationLink ?? "").trim();

    if (!villageChanged && !pincodeChanged && !classFromChanged && !classToChanged && !locationChanged) {
      setMessage({ type: "error", text: "No changes made. Update at least one field." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const edits = [];
      if (villageChanged) {
        edits.push({ fieldName: "villageName", newValue: villageName.trim() });
      }
      if (pincodeChanged) {
        edits.push({ fieldName: "pincode", newValue: pincode.trim() });
      }
      if (classFromChanged) {
        edits.push({ fieldName: "classFrm", newValue: classFrom.trim() });
      }
      if (classToChanged) {
        edits.push({ fieldName: "classTo", newValue: classTo.trim() });
      }
      if (locationChanged) {
        edits.push({ fieldName: "gmapLocationLink", newValue: gmapLocationLink.trim() });
      }

      for (const edit of edits) {
        const res = await fetch(`${API_BASE}/api/edits`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...buildAccessHeaders(phone),
          },
          body: JSON.stringify({
            sourceKey: school.sourceKey,
            ...edit,
            submittedBy: submittedBy.trim(),
          }),
        });
        if (res.status !== 201) {
          const data = await res.json();
          setMessage({ type: "error", text: data.error || "Submission failed." });
          setSubmitting(false);
          return;
        }
      }

      setMessage({ type: "success", text: "Edit submitted successfully." });
      setTimeout(onBack, 1500);
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
              <label className="form-label" htmlFor="pincode">Pincode</label>
              <input
                id="pincode"
                className="form-input"
                type="text"
                inputMode="numeric"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter pincode"
                disabled={submitting}
              />
              <p className="form-hint">
                Check current PIN code:{" "}
                <a
                  href="https://dac.indiapost.gov.in/mypincode/home"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  India Post My Pincode
                </a>
              </p>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label" htmlFor="classFrom">Class From</label>
                <input
                  id="classFrom"
                  className="form-input"
                  type="text"
                  inputMode="numeric"
                  value={classFrom}
                  onChange={(e) => setClassFrom(e.target.value)}
                  placeholder="e.g. 1"
                  disabled={submitting}
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="classTo">Class To</label>
                <input
                  id="classTo"
                  className="form-input"
                  type="text"
                  inputMode="numeric"
                  value={classTo}
                  onChange={(e) => setClassTo(e.target.value)}
                  placeholder="e.g. 12"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">School Location</label>
              <div className="tab-bar">
                <button
                  className={`tab-btn${locationTab === "manual" ? " tab-btn--active" : ""}`}
                  type="button"
                  onClick={() => setLocationTab("manual")}
                >
                  Manual Link
                </button>
                <button
                  className={`tab-btn${locationTab === "auto" ? " tab-btn--active" : ""}`}
                  type="button"
                  onClick={() => setLocationTab("auto")}
                >
                  Auto Detect
                </button>
              </div>
              {locationTab === "manual" ? (
                <input
                  id="gmapLocationLink"
                  className="form-input"
                  type="url"
                  inputMode="url"
                  value={gmapLocationLink}
                  onChange={(e) => setGmapLocationLink(e.target.value)}
                  placeholder="https://maps.google.com/..."
                  disabled={submitting}
                />
              ) : (
                <div>
                  <button
                    className="btn btn--outline btn--sm"
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={geoLoading || submitting}
                  >
                    {geoLoading ? "Detecting..." : "Detect Current Location"}
                  </button>
                  {geoError && <div className="inline-error" style={{ marginTop: 8 }}>{geoError}</div>}
                  {gmapLocationLink && (
                    <div style={{ marginTop: 8 }}>
                      <a href={gmapLocationLink} target="_blank" rel="noopener noreferrer">
                        Preview detected Google Maps link
                      </a>
                    </div>
                  )}
                </div>
              )}
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
                disabled={submitting || !canEdit}
                type="button"
              >
                {submitting ? "Saving..." : "Save Edit"}
              </button>
            </div>
            {!canEdit && (
              <div className="inline-warning" style={{ marginTop: 12 }}>
                You can view this page, but this phone number cannot submit edits.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
