export function Pagination({ page, totalPages, loading, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="btn btn--secondary"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1 || loading}
        type="button"
      >
        ← Prev
      </button>
      <span className="pagination-info">
        Page {page} of {totalPages}
      </span>
      <button
        className="btn btn--secondary"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages || loading}
        type="button"
      >
        Next →
      </button>
    </div>
  );
}
