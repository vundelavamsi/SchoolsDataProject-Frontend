import { SchoolCard } from "./SchoolCard";
import { SkeletonCard } from "./SkeletonCard";

export function SchoolCardGrid({ rows, loading, apiFailed, onEdit }) {
  if (loading) {
    return (
      <div className="card-grid-loading" role="status" aria-live="polite">
        <div className="card-grid-loading-banner">
          <span className="spinner" aria-hidden="true" />
          <div className="card-grid-loading-copy">
            <p className="card-grid-loading-title">Loading schools</p>
            <p className="card-grid-loading-subtitle">Please wait while we fetch the latest records.</p>
          </div>
        </div>
        <div className="card-grid">
          <SkeletonCard count={6} />
        </div>
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    if (apiFailed) {
      return (
        <div className="card-grid-state">
          <p className="no-results">Please continue to refresh the page</p>
        </div>
      );
    }
    return (
      <div className="card-grid-state">
        <p className="no-results">No schools found matching your filters.</p>
        <p className="no-results-hint">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="card-grid">
      {rows.map((school, index) => (
        <SchoolCard
          key={school.sourceKey ?? school.udiseschCode ?? school.schoolId ?? index}
          school={school}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
