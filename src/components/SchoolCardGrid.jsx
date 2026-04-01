import { SchoolCard } from "./SchoolCard";
import { SkeletonCard } from "./SkeletonCard";

export function SchoolCardGrid({ rows, loading, onEdit }) {
  if (loading) {
    return (
      <div className="card-grid">
        <SkeletonCard count={6} />
      </div>
    );
  }

  if (!rows || rows.length === 0) {
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
