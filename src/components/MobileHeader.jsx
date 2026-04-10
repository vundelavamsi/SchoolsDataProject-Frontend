export function MobileHeader({ onNavigateReview, canReview, canEdit }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">School Directory</h1>
        <p className="app-subtitle">Search and filter schools across India</p>
      </div>
      <nav className="header-nav">
        {canEdit || canReview ? (
          <button
            className="btn btn--outline btn--sm"
            onClick={onNavigateReview}
            type="button"
          >
            {canReview ? "Review Edits" : "My Edits"}
          </button>
        ) : null}
      </nav>
    </header>
  );
}
