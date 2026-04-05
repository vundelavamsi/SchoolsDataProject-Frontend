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
            <div className="filter-sheet-section-title">Location</div>
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
              <div className="filter-sheet-row">
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

          {/* School Attributes */}
          <div>
            <div className="filter-sheet-section-title">School Attributes</div>
            <div className="filter-sheet-section">
              <div className="filter-sheet-row">
                <FilterSelect
                  label="Category"
                  name="schCategoryId"
                  value={filters.schCategoryId}
                  options={options.schCategoryId}
                  onChange={onFilterChange}
                  placeholder="All"
                />
                <FilterSelect
                  label="Type"
                  name="schType"
                  value={filters.schType}
                  options={options.schType}
                  onChange={onFilterChange}
                  placeholder="All"
                />
              </div>
              <div className="filter-sheet-row">
                <FilterSelect
                  label="Management"
                  name="schMgmtId"
                  value={filters.schMgmtId}
                  options={options.schMgmtId}
                  onChange={onFilterChange}
                  placeholder="All"
                />
                <FilterSelect
                  label="Status"
                  name="schoolStatus"
                  value={filters.schoolStatus}
                  options={options.schoolStatus}
                  onChange={onFilterChange}
                  placeholder="All"
                />
              </div>
              <FilterSelect
                label="Rural/Urban"
                name="schLocRuralUrban"
                value={filters.schLocRuralUrban}
                options={options.schLocRuralUrban}
                onChange={onFilterChange}
                placeholder="All"
              />
            </div>
          </div>

          {/* Class Range + Search */}
          <div>
            <div className="filter-sheet-section-title">Class Range & Search</div>
            <div className="filter-sheet-section">
              <FilterSelect
                label="Class Range"
                name="classRange"
                value={filters.classRange}
                options={options.classRange}
                onChange={onFilterChange}
                placeholder="All Classes"
              />
              <div className="filter-field">
                <label className="filter-label">Search</label>
                <input
                  className="filter-input"
                  type="search"
                  inputMode="search"
                  value={filters.search}
                  onChange={(e) => onFilterChange("search", e.target.value)}
                  placeholder="School name, UDISE code..."
                />
              </div>
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
