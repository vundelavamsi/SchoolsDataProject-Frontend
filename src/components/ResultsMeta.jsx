export function ResultsMeta({ loading, total, page, pageSize }) {
  if (loading) return <p className="results-meta">Loading…</p>;
  if (!total) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <p className="results-meta">
      Showing <strong>{from}–{to}</strong> of <strong>{total.toLocaleString()}</strong> schools
    </p>
  );
}
