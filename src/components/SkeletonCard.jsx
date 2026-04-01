export function SkeletonCard({ count = 6 }) {
  return Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className="skeleton-card"
      style={{ animationDelay: `${i * 80}ms` }}
    >
      <div className="skeleton-card-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="skeleton skeleton-text--subtitle" style={{ width: 120 }} />
          <div className="skeleton skeleton-text--badge" />
        </div>
        <div className="skeleton skeleton-text--title" />
        <div className="skeleton skeleton-text--subtitle" style={{ width: "70%" }} />
      </div>
      <div className="skeleton-card-body">
        {Array.from({ length: 6 }, (_, j) => (
          <div key={j} className="skeleton-field">
            <div className="skeleton skeleton-field-label" />
            <div className="skeleton skeleton-field-value" />
          </div>
        ))}
      </div>
    </div>
  ));
}
