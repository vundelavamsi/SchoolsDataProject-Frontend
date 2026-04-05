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

export const SchoolCard = memo(function SchoolCard({ school, onEdit }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="school-card">
      <div className="card-header" onClick={() => setExpanded((v) => !v)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpanded((v) => !v); } }}>
        <div className="card-header-top">
          <span className="card-udise">
            UDISE: <strong>{buildUdise(school.blockCd, school.udiseschCode)}</strong>
          </span>
          <span className="badge badge--operational">{displayValue(school.schMgmtDesc, "—")}</span>
          <button
            className={`card-expand-toggle${expanded ? " expanded" : ""}`}
            type="button"
            aria-label={expanded ? "Collapse" : "Expand"}
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          >
            <ChevronDown />
          </button>
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
          {school.schCatDesc && <span>Category: {school.schCatDesc}</span>}
          {school.blockName && <span>Edu. Block: {school.blockName}</span>}
          {school.villageName && <span>Village: {school.villageName}</span>}
        </div>
      </div>

      <div className={`card-collapsible${expanded ? " card-collapsible--open" : ""}`}>
        <div className="card-body">
          {/* Location */}
          <div className="card-body-primary">
            <div className="field-row">
              <span className="field-label">State</span>
              <span className="field-value">{displayValue(school.stateName)}</span>
            </div>
            <div className="field-row">
              <span className="field-label">District</span>
              <span className="field-value">{displayValue(school.districtName)}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Village</span>
              <span className="field-value">{displayValue(school.villageName)}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Address</span>
              <span className="field-value">{displayValue(school.address)}</span>
            </div>
            <div className="field-row">
              <span className="field-label">PIN Code</span>
              <span className="field-value">{displayValue(school.pincode)}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Rural / Urban</span>
              <span className="field-value">{displayValue(school.schLocDesc)}</span>
            </div>
          </div>

          {/* School Classification */}
          <div className="card-body-secondary-always">
            <div className="field-row">
              <span className="field-label">School Type</span>
              <span className="field-value">{displayValue(school.schTypeDesc)}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Class Range</span>
              <span className="field-value">{formatClassRange(school.classFrm, school.classTo)}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Management</span>
              <span className="field-value">{displayValue(school.schMgmtDesc)}</span>
            </div>
            {school.schLocRuralUrban === "2" && (
              <>
                <div className="field-row">
                  <span className="field-label">Urban Local Body</span>
                  <span className="field-value">{displayValue(school.lgdurbanlocalbodyName)}</span>
                </div>
                <div className="field-row">
                  <span className="field-label">Ward</span>
                  <span className="field-value">{displayValue(school.lgdwardName)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {onEdit && (
          <div className="card-footer">
            <button
              className="btn btn--outline btn--sm"
              onClick={() => onEdit(school)}
              type="button"
            >
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
