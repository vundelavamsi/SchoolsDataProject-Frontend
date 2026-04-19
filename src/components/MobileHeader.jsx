export function MobileHeader({ onNavigateProfile, searchValue, onSearchChange, onSearchApply, hasPhone }) {
  return (
    <header className="app-header">
      <div className="header-top-row">
        <div className="header-left">
          <h1 className="app-title">School Directory</h1>
          <p className="app-subtitle">Search and filter schools across India</p>
        </div>
        <nav className="header-nav">
          <button className="btn btn--outline btn--sm" onClick={onNavigateProfile} type="button">
            {hasPhone ? "Profile" : "Login"}
          </button>
        </nav>
      </div>
      <form
        className="header-search"
        onSubmit={(event) => {
          event.preventDefault();
          const search = event.currentTarget.elements.mobileSearch.value;
          onSearchApply(search);
        }}
      >
        <label className="sr-only" htmlFor="mobile-header-search">
          Search schools
        </label>
        <input
          id="mobile-header-search"
          name="mobileSearch"
          className="filter-input header-search-input"
          type="search"
          inputMode="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="School name, UDISE code..."
        />
        <button className="btn btn--primary btn--sm header-search-btn" type="submit">
          Search
        </button>
      </form>
    </header>
  );
}
