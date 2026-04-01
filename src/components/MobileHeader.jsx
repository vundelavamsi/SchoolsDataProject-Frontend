export function MobileHeader({ onNavigateReview }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">School Directory</h1>
        <p className="app-subtitle">Search and filter schools across India</p>
      </div>
      <nav className="header-nav">
        <button
          className="btn btn--outline btn--sm"
          onClick={onNavigateReview}
          type="button"
        >
          Review Edits
        </button>
      </nav>
    </header>
  );
}
