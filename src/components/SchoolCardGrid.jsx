import { SchoolCard } from "./SchoolCard";

export function SchoolCardGrid({ rows, loading, onEdit }) {
  if (loading) {
    return (
      <div className="card-grid-state">
        <div className="spinner" aria-label="Loading" />
        <p>Loading schools…</p>
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="card-grid-state">
        <p className="no-results">No schools found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="card-grid">
      {rows.map((school, index) => (
        <SchoolCard key={school.sourceKey ?? school.udiseschCode ?? school.schoolId ?? index} school={school} onEdit={onEdit} />
      ))}
    </div>
  );
}
