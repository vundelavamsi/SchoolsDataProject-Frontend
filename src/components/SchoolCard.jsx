import { memo, useState } from "react";
import { buildUdise, formatClassRange, displayValue } from "../lib/utils";

function StatusBadge({ status, statusName }) {
  const name = displayValue(statusName, displayValue(status, "Unknown"));
  let cls = "badge";
  const lower = String(name).toLowerCase();
  if (lower.includes("operational") || lower.includes("open")) cls += " badge--operational";
  else if (lower.includes("closed") || lower.includes("non-operational")) cls += " badge--closed";
  else cls += " badge--other";
  return <span className={cls}>{name}</span>;
}

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

function DetailBox({ type, label, value, fullWidth = false }) {
  return (
    <div className={`detail-box detail-box--${type}${fullWidth ? " detail-box--full" : ""}`}>
      <div className="detail-box-header">{label}</div>
      <div className={`detail-box-value${type === "address" ? " detail-box-value--multiline" : ""}`}>
        {value}
      </div>
    </div>
  );
}

export const SchoolCard = memo(function SchoolCard({ school, onEdit }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="school-card">
      <div className="card-header" onClick={() => setExpanded((v) => !v)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpanded((v) => !v); } }}>
        <div className="card-header-top">
          <span className="card-udise">
            UDISE: <strong>{buildUdise(school.blockCd, school.udiseschCode)}</strong>
          </span>
          <div className="card-header-actions">
            {onEdit && (
              <button
                className="card-profile-edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(school);
                }}
                onKeyDown={(e) => e.stopPropagation()}
                type="button"
                aria-label={`Edit ${school.schoolName || "school"}`}
              >
                <EditIcon />
              </button>
            )}
            <button
              className={`card-expand-toggle${expanded ? " expanded" : ""}`}
              type="button"
              aria-label={expanded ? "Collapse" : "Expand"}
              onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
            >
              <ChevronDown />
            </button>
          </div>
        </div>
        <div className="card-management-row">
          <span className="badge badge--private">{displayValue(school.schMgmtDescSt || school.schMgmtDesc, "—")}</span>
        </div>
        <div className="card-title">
          {displayValue(school.schoolName, "—")}
          {school.gmapLocationLink && (
            <a
              href={school.gmapLocationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="card-location-link"
              title="Open in Google Maps"
              onClick={(e) => e.stopPropagation()}
              aria-label="Open school location in Google Maps"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </a>
          )}
        </div>
        <div className="card-geo">
          {school.schCatDesc && <span className="card-category">{school.schCatDesc}</span>}
          {school.blockName && <span className="card-geo-item card-geo-item--block">Block: {school.blockName}</span>}
          {school.villageName && <span className="card-geo-item card-geo-item--village">Village: {school.villageName}</span>}
        </div>
      </div>

      <div className={`card-collapsible${expanded ? " card-collapsible--open" : ""}`}>
        <div className="card-body">
          <div className="card-profile-grid">
            <DetailBox type="village" label="Village" value={displayValue(school.villageName)} />
            <DetailBox type="pincode" label="PIN Code" value={displayValue(school.pincode)} />
            <DetailBox type="rural-urban" label="Rural / Urban" value={displayValue(school.schLocDesc)} />
            <DetailBox type="management" label="Management" value={displayValue(school.schMgmtDesc || school.schMgmtDescSt)} />
            <DetailBox type="school-type" label="School Type" value={displayValue(school.schTypeDesc)} />
            <DetailBox type="class-range" label="Class Range" value={formatClassRange(school.classFrm, school.classTo)} />

            {school.schLocRuralUrban === "2" && (
              <>
                <DetailBox type="urban-local-body" label="Urban Local Body" value={displayValue(school.lgdurbanlocalbodyName)} />
                <DetailBox type="ward" label="Ward" value={displayValue(school.lgdwardName)} />
              </>
            )}

            <DetailBox type="address" label="Address" value={displayValue(school.address)} fullWidth />
          </div>
        </div>
      </div>
    </div>
  );
});
