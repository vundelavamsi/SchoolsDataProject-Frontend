import { useCallback, useEffect, useMemo, useState } from "react";
import { useFilters } from "./hooks/useFilters";
import { useOptions } from "./hooks/useOptions";
import { useSchools } from "./hooks/useSchools";
import { useAccess } from "./hooks/useAccess";
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
  const { phone, access, loading: accessLoading, error: accessError, setPhoneAndResolve } = useAccess();
  const [phoneInput, setPhoneInput] = useState(phone);
  const { filters, setFilter, resetFilters } = useFilters();
  const { options } = useOptions(filters.stateId, filters.districtId, filters.blockId, phone);
  const { rows, total, page, totalPages, loading, fetchSchools, goToPage } = useSchools(phone);

  useEffect(() => {
    setPhoneInput(phone);
    fetchSchools(filters, 1, PAGE_SIZE);
  }, [phone]); // eslint-disable-line react-hooks/exhaustive-deps

  const [currentView, setCurrentView] = useState("search");
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  useEffect(() => {
    if (currentView === "review" && !access.canEdit && !access.canReview) {
      setCurrentView("search");
    }
  }, [currentView, access.canReview, access.canEdit]);

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

  const handleApplyPhone = useCallback(() => {
    setPhoneAndResolve(phoneInput);
  }, [setPhoneAndResolve, phoneInput]);

  const handleClearPhone = useCallback(() => {
    setPhoneAndResolve("");
  }, [setPhoneAndResolve]);

  if (currentView === "edit" && selectedSchool) {
    return (
      <EditSchoolPage
        school={selectedSchool}
        phone={phone}
        canEdit={access.canEdit}
        onBack={() => setCurrentView("search")}
      />
    );
  }
  if (currentView === "review") {
    return (
      <ReviewEditsPage
        phone={phone}
        canReview={access.canReview}
        canEdit={access.canEdit}
        onBack={() => setCurrentView("search")}
      />
    );
  }

  return (
    <div className="app-layout">
      <MobileHeader
        onNavigateReview={() => setCurrentView("review")}
        canReview={access.canReview}
        canEdit={access.canEdit}
      />

      <div className="app-main">
        <div className="app-content">
          <div className="page-card access-panel">
            <div className="access-panel-row">
              <div>
                <div className="access-panel-title">Phone access (optional)</div>
                <div className="access-panel-meta">
                  {phone
                    ? access.authenticated
                      ? `Logged as ${phone} · ${access.role} · ${access.scope === "global" ? "global scope" : `${access.blockIds.length} block(s)`}`
                      : `Phone ${phone} has no configured permissions`
                    : "Guest mode: browsing enabled"}
                </div>
              </div>
              {accessLoading && <span className="badge badge--other">Checking…</span>}
            </div>
            <div className="access-panel-actions">
              <input
                className="form-input"
                type="tel"
                inputMode="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Enter phone number"
              />
              <button className="btn btn--primary btn--sm" type="button" onClick={handleApplyPhone}>
                Apply
              </button>
              <button className="btn btn--outline btn--sm" type="button" onClick={handleClearPhone}>
                Clear
              </button>
            </div>
            {!access.canEdit && phone && access.authenticated && (
              <div className="inline-warning">This phone can browse data but cannot submit edits.</div>
            )}
            {accessError && <div className="inline-error">{accessError}</div>}
          </div>

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
            onEdit={
              access.canEdit
                ? (school) => {
                    setSelectedSchool(school);
                    setCurrentView("edit");
                  }
                : undefined
            }
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
