import { useCallback, useState } from "react";
import { useFilters } from "./hooks/useFilters";
import { useOptions } from "./hooks/useOptions";
import { useSchools } from "./hooks/useSchools";
import { FilterPanel } from "./components/FilterPanel";
import { SchoolCardGrid } from "./components/SchoolCardGrid";
import { Pagination } from "./components/Pagination";
import { ResultsMeta } from "./components/ResultsMeta";
import { EditSchoolPage } from "./pages/EditSchoolPage";
import { ReviewEditsPage } from "./pages/ReviewEditsPage";
import "./styles.css";

const PAGE_SIZE = 25;

export default function App() {
  const { filters, setFilter, resetFilters } = useFilters();
  const { options } = useOptions(filters.stateId, filters.districtId, filters.blockId);
  const { rows, total, page, totalPages, loading, fetchSchools, goToPage } = useSchools();

  const handleApply = useCallback(() => {
    fetchSchools(filters, 1, PAGE_SIZE);
  }, [filters, fetchSchools]);

  const handleReset = useCallback(() => {
    resetFilters();
    fetchSchools({}, 1, PAGE_SIZE);
  }, [resetFilters, fetchSchools]);

  const handlePageChange = useCallback(
    (newPage) => {
      goToPage(newPage, filters, PAGE_SIZE);
    },
    [goToPage, filters]
  );

  const [currentView, setCurrentView] = useState("search");
  const [selectedSchool, setSelectedSchool] = useState(null);

  if (currentView === "edit" && selectedSchool) {
    return <EditSchoolPage school={selectedSchool} onBack={() => setCurrentView("search")} />;
  }
  if (currentView === "review") {
    return <ReviewEditsPage onBack={() => setCurrentView("search")} />;
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <div>
          <h1 className="app-title">School Directory</h1>
          <p className="app-subtitle">Search and filter schools across India</p>
        </div>
        <nav className="header-nav">
          <button
            className="btn btn--outline btn--sm"
            onClick={() => setCurrentView("review")}
            type="button"
          >
            Review Edits
          </button>
        </nav>
      </header>

      <FilterPanel
        filters={filters}
        options={options}
        onFilterChange={setFilter}
        onApply={handleApply}
        onReset={handleReset}
      />

      <div className="results-bar">
        <ResultsMeta loading={loading} total={total} page={page} pageSize={PAGE_SIZE} />
      </div>

      <SchoolCardGrid
        rows={rows}
        loading={loading}
        onEdit={(school) => {
          setSelectedSchool(school);
          setCurrentView("edit");
        }}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        loading={loading}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
