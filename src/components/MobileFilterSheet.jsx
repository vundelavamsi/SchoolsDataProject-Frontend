import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FilterSelect } from "./FilterSelect";

export function MobileFilterSheet({
  isOpen,
  onClose,
  filters,
  options,
  onFilterChange,
  onApply,
  onReset,
  activeFilterCount,
}) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="filter-sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="filter-sheet-panel" role="dialog" aria-modal="true" aria-label="Filter options">
        <div className="filter-sheet-handle" />

        <div className="filter-sheet-header">
          <div className="filter-sheet-title">
            Filters
            {activeFilterCount > 0 && (
              <span className="filter-count-badge">{activeFilterCount}</span>
            )}
          </div>
          <button
            className="filter-sheet-close"
            onClick={onClose}
            type="button"
            aria-label="Close filters"
          >
            &#x2715;
          </button>
        </div>

        <div className="filter-sheet-body">
          {/* Location */}
          <div>
            <div className="filter-sheet-section">
              <FilterSelect
                label="State"
                name="stateId"
                value={filters.stateId}
                options={options.stateId}
                onChange={onFilterChange}
                placeholder="All States"
              />
              <FilterSelect
                label="District"
                name="districtId"
                value={filters.districtId}
                options={options.districtId}
                onChange={onFilterChange}
                disabled={!filters.stateId}
                placeholder="All Districts"
              />
              <FilterSelect
                label="Block"
                name="blockId"
                value={filters.blockId}
                options={options.blockId}
                onChange={onFilterChange}
                disabled={!filters.districtId}
                placeholder="All Blocks"
              />
              <FilterSelect
                label="Village"
                name="villageId"
                value={filters.villageId}
                options={options.villageId}
                onChange={onFilterChange}
                disabled={!filters.blockId}
                placeholder="All Villages"
              />
            </div>
          </div>

        </div>

        <div className="filter-sheet-footer">
          <button className="btn btn--secondary" onClick={onReset} type="button">
            Reset
          </button>
          <button className="btn btn--primary" onClick={onApply} type="button">
            Apply Filters
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
