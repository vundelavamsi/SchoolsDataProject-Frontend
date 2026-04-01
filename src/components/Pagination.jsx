function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set([1, total]);

  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.add(i);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push("...");
    }
    result.push(sorted[i]);
  }

  return result;
}

export function Pagination({ page, totalPages, loading, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="pagination">
      <button
        className="pagination-btn pagination-btn--nav"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1 || loading}
        type="button"
        aria-label="Previous page"
      >
        &#8249;
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="pagination-ellipsis">...</span>
        ) : (
          <button
            key={p}
            className={`pagination-btn${p === page ? " pagination-btn--active" : ""}`}
            onClick={() => onPageChange(p)}
            disabled={loading}
            type="button"
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        className="pagination-btn pagination-btn--nav"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages || loading}
        type="button"
        aria-label="Next page"
      >
        &#8250;
      </button>
    </div>
  );
}
