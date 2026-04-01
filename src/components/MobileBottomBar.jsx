export function MobileBottomBar({ onToggleFilters, activeFilterCount, total, loading }) {
  return (
    <div className="mobile-bottom-bar">
      <button
        className="bottom-bar-filter-btn"
        onClick={onToggleFilters}
        type="button"
        aria-label="Open filters"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="11" y1="18" x2="13" y2="18" />
        </svg>
        Filters
        {activeFilterCount > 0 && (
          <span className="filter-count-badge">{activeFilterCount}</span>
        )}
      </button>
      <span className="bottom-bar-meta">
        {loading ? "Loading..." : total > 0 ? `${total.toLocaleString()} schools` : ""}
      </span>
    </div>
  );
}
