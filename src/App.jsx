import { useCallback, useEffect, useMemo, useState } from "react";
import { useFilters } from "./hooks/useFilters";
import { useOptions } from "./hooks/useOptions";
import { useSchools } from "./hooks/useSchools";
import { useAccess } from "./hooks/useAccess";
import { MobileHeader } from "./components/MobileHeader";
import { MobileBottomBar } from "./components/MobileBottomBar";
import { MobileFilterSheet } from "./components/MobileFilterSheet";
import { PhoneAccessModal } from "./components/PhoneAccessModal";
import { FilterPanel } from "./components/FilterPanel";
import { SchoolCardGrid } from "./components/SchoolCardGrid";
import { Pagination } from "./components/Pagination";
import { ResultsMeta } from "./components/ResultsMeta";
import { EditSchoolPage } from "./pages/EditSchoolPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ReviewEditsPage } from "./pages/ReviewEditsPage";
import "./styles.css";

const PAGE_SIZE = 25;

export default function App() {
  const { phone, access, loading: accessLoading, error: accessError, setPhoneAndResolve } = useAccess();
  const { filters, setFilter, resetFilters } = useFilters();
  const { options } = useOptions(filters.stateId, filters.districtId, filters.blockId, phone);
  const { rows, total, page, totalPages, loading, apiFailed, fetchSchools, goToPage } = useSchools(phone);

  useEffect(() => {
    fetchSchools(filters, 1, PAGE_SIZE);
  }, [phone]); // eslint-disable-line react-hooks/exhaustive-deps

  const [currentView, setCurrentView] = useState("search");
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [accessModalOpen, setAccessModalOpen] = useState(false);

  useEffect(() => {
    if (currentView === "review" && !access.canEdit && !access.canReview) {
      setCurrentView("profile");
    }
  }, [currentView, access.canReview, access.canEdit]);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((v) => v !== "").length,
    [filters]
  );

  const handleApply = useCallback(() => {
    fetchSchools(filters, 1, PAGE_SIZE);
  }, [filters, fetchSchools]);

  const handleMobileSearchApply = useCallback(
    (searchValue) => {
      if (filters.search !== searchValue) {
        setFilter("search", searchValue);
      }
      fetchSchools({ ...filters, search: searchValue }, 1, PAGE_SIZE);
    },
    [filters, setFilter, fetchSchools]
  );

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

  const handleApplyPhone = useCallback(
    (phoneValue) => {
      setPhoneAndResolve(phoneValue);
    },
    [setPhoneAndResolve]
  );

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
        onBack={() => setCurrentView("profile")}
      />
    );
  }
  if (currentView === "profile") {
    return (
      <>
        <ProfilePage
          phone={phone}
          access={access}
          accessLoading={accessLoading}
          accessError={accessError}
          onOpenAccessModal={() => setAccessModalOpen(true)}
          onNavigateReview={() => setCurrentView("review")}
          onBack={() => setCurrentView("search")}
        />
        <PhoneAccessModal
          isOpen={accessModalOpen}
          onClose={() => setAccessModalOpen(false)}
          phone={phone}
          access={access}
          accessLoading={accessLoading}
          accessError={accessError}
          onApplyPhone={handleApplyPhone}
          onClearPhone={handleClearPhone}
        />
      </>
    );
  }

  return (
      <>
      <div className="app-layout">
        <MobileHeader
          onNavigateProfile={() => setCurrentView("profile")}
          searchValue={filters.search}
          onSearchChange={(value) => setFilter("search", value)}
          onSearchApply={handleMobileSearchApply}
        />

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
              apiFailed={apiFailed}
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
      <PhoneAccessModal
        isOpen={accessModalOpen}
        onClose={() => setAccessModalOpen(false)}
        phone={phone}
        access={access}
        accessLoading={accessLoading}
        accessError={accessError}
        onApplyPhone={handleApplyPhone}
        onClearPhone={handleClearPhone}
      />
    </>
  );
}
