import { useCallback, useEffect, useMemo, useState } from "react";
import { useFilters } from "./hooks/useFilters";
import { useOptions } from "./hooks/useOptions";
import { useSchools } from "./hooks/useSchools";
import { MobileHeader } from "./components/MobileHeader";
import { MobileBottomBar } from "./components/MobileBottomBar";
import { MobileFilterSheet } from "./components/MobileFilterSheet";
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

  // Fetch all schools on initial load
  useEffect(() => {
    fetchSchools({}, 1, PAGE_SIZE);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [currentView, setCurrentView] = useState("search");
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((v) => v !== "").length,
    [filters]
  );

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

  if (currentView === "edit" && selectedSchool) {
    return <EditSchoolPage school={selectedSchool} onBack={() => setCurrentView("search")} />;
  }
  if (currentView === "review") {
    return <ReviewEditsPage onBack={() => setCurrentView("search")} />;
  }

  return (
    <div className="app-layout">
      <MobileHeader onNavigateReview={() => setCurrentView("review")} />

      <div className="app-main">
        <div className="app-content">
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
      </div>

      <MobileBottomBar
        onToggleFilters={() => setFilterSheetOpen(true)}
        activeFilterCount={activeFilterCount}
        total={total}
        loading={loading}
      />

      <MobileFilterSheet
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        filters={filters}
        options={options}
        onFilterChange={setFilter}
        onApply={() => {
          handleApply();
          setFilterSheetOpen(false);
        }}
        onReset={() => {
          handleReset();
          setFilterSheetOpen(false);
        }}
        activeFilterCount={activeFilterCount}
      />
    </div>
  );
}
