import { FilterSelect } from "./FilterSelect";

export function FilterPanel({ filters, options, onFilterChange, onApply, onReset }) {
  return (
    <div className="filter-panel">
      <div className="filter-row">
        <FilterSelect
          label="State"
          name="stateId"
          value={filters.stateId}
          options={options.stateId}
          onChange={onFilterChange}
          placeholder="All States"
        />
        <FilterSelect
          label="District"
          name="districtId"
          value={filters.districtId}
          options={options.districtId}
          onChange={onFilterChange}
          disabled={!filters.stateId}
          placeholder="All Districts"
        />
        <FilterSelect
          label="Block"
          name="blockId"
          value={filters.blockId}
          options={options.blockId}
          onChange={onFilterChange}
          disabled={!filters.districtId}
          placeholder="All Blocks"
        />
        <FilterSelect
          label="Village"
          name="villageId"
          value={filters.villageId}
          options={options.villageId}
          onChange={onFilterChange}
          disabled={!filters.blockId}
          placeholder="All Villages"
        />
      </div>

      <div className="filter-row filter-row--bottom">
        <div className="filter-field filter-field--grow">
          <label className="filter-label" htmlFor="search">Search</label>
          <input
            id="search"
            type="search"
            inputMode="search"
            className="filter-input"
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            placeholder="School name, UDISE code..."
          />
        </div>
      </div>

      <div className="filter-actions">
        <button className="btn btn--primary" onClick={onApply} type="button">
          Apply Filters
        </button>
        <button className="btn btn--secondary" onClick={onReset} type="button">
          Reset
        </button>
      </div>
    </div>
  );
}
