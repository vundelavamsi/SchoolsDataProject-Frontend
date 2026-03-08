import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";
const INITIAL_FILTERS = {
  districtId: "",
  blockId: "",
  villageId: "",
  schCategoryId: "",
  schType: "",
  schMgmtId: "",
  schoolStatus: "",
  classFromMin: "",
  classToMax: "",
  search: ""
};

const FILTER_LABELS = {
  districtId: "District",
  blockId: "Block",
  villageId: "Village",
  schCategoryId: "Category",
  schType: "Type",
  schMgmtId: "Management",
  schoolStatus: "Status"
};

export default function App() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [options, setOptions] = useState({});
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const totalPages = useMemo(() => Math.max(Math.ceil(total / pageSize), 1), [total, pageSize]);

  async function loadOptions() {
    const response = await fetch(`${API_BASE}/api/options`);
    const payload = await response.json();
    setOptions((prev) => ({
      ...prev,
      ...payload,
      blockId: [],
      villageId: []
    }));
  }

  async function loadBlocks(districtId) {
    if (!districtId) {
      setOptions((prev) => ({ ...prev, blockId: [], villageId: [] }));
      return;
    }
    const params = new URLSearchParams({ districtId });
    const response = await fetch(`${API_BASE}/api/options/blocks?${params.toString()}`);
    const payload = await response.json();
    setOptions((prev) => ({
      ...prev,
      blockId: payload.blockId || [],
      villageId: []
    }));
  }

  async function loadVillages(districtId, blockId) {
    if (!districtId || !blockId) {
      setOptions((prev) => ({ ...prev, villageId: [] }));
      return;
    }
    const params = new URLSearchParams({ districtId, blockId });
    const response = await fetch(`${API_BASE}/api/options/villages?${params.toString()}`);
    const payload = await response.json();
    setOptions((prev) => ({
      ...prev,
      villageId: payload.villageId || []
    }));
  }

  async function loadSchools(nextPage = page, currentFilters = filters) {
    setLoading(true);
    const params = new URLSearchParams({ page: String(nextPage), pageSize: String(pageSize) });
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    const response = await fetch(`${API_BASE}/api/schools?${params.toString()}`);
    const payload = await response.json();
    setRows(payload.data || []);
    setTotal(payload.total || 0);
    setPage(payload.page || nextPage);
    setLoading(false);
  }

  useEffect(() => {
    loadOptions();
    loadSchools(1, INITIAL_FILTERS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadBlocks(filters.districtId);
  }, [filters.districtId]);

  useEffect(() => {
    loadVillages(filters.districtId, filters.blockId);
  }, [filters.districtId, filters.blockId]);

  function onFilterChange(event) {
    const { name, value } = event.target;
    setFilters((prev) => {
      if (name === "districtId") {
        return { ...prev, districtId: value, blockId: "", villageId: "" };
      }
      if (name === "blockId") {
        return { ...prev, blockId: value, villageId: "" };
      }
      return { ...prev, [name]: value };
    });
  }

  function onApplyFilters(event) {
    event.preventDefault();
    loadSchools(1, filters);
  }

  function onResetFilters() {
    setFilters(INITIAL_FILTERS);
    loadSchools(1, INITIAL_FILTERS);
    loadOptions();
  }

  function onPageChange(nextPage) {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }
    loadSchools(nextPage, filters);
  }

  const selectFields = [
    "districtId",
    "blockId",
    "villageId",
    "schCategoryId",
    "schType",
    "schMgmtId",
    "schoolStatus"
  ];

  function normalizeOptions(field) {
    const values = options[field] || [];
    return values.map((item) => {
      if (typeof item === "object" && item !== null) {
        return {
          value: item.value ?? "",
          label: item.label ?? item.value ?? ""
        };
      }
      return { value: item, label: item };
    });
  }

  return (
    <main className="container">
      <h1>School Filtering Application</h1>
      <form className="filters" onSubmit={onApplyFilters}>
        {selectFields.map((field) => (
          <label key={field}>
            {FILTER_LABELS[field]}
            <select
              name={field}
              value={filters[field]}
              onChange={onFilterChange}
              disabled={
                (field === "blockId" && !filters.districtId) ||
                (field === "villageId" && (!filters.districtId || !filters.blockId))
              }
            >
              <option value="">All</option>
              {normalizeOptions(field).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}
        <label>
          Class From (Min)
          <input name="classFromMin" value={filters.classFromMin} onChange={onFilterChange} />
        </label>
        <label>
          Class To (Max)
          <input name="classToMax" value={filters.classToMax} onChange={onFilterChange} />
        </label>
        <label className="wide">
          Search
          <input
            name="search"
            value={filters.search}
            onChange={onFilterChange}
            placeholder="School name, UDISE code, district, block..."
          />
        </label>
        <div className="actions">
          <button type="submit">Apply Filters</button>
          <button type="button" onClick={onResetFilters}>
            Reset
          </button>
        </div>
      </form>

      <p className="meta">
        {loading ? "Loading..." : `Showing ${rows.length} of ${total} records`}
      </p>

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>UDISE Code</th>
              <th>School Name</th>
              <th>District</th>
              <th>Block</th>
              <th>Village</th>
              <th>Category</th>
              <th>Type</th>
              <th>Management</th>
              <th>Status</th>
              <th>Class From</th>
              <th>Class To</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.schoolId || ""}-${row.udiseschCode || ""}`}>
                <td>{row.udiseschCode || "-"}</td>
                <td>{row.schoolName || "-"}</td>
                <td>{row.districtName || row.districtId || "-"}</td>
                <td>{row.blockName || row.blockId || "-"}</td>
                <td>{row.villageName || row.villageId || "-"}</td>
                <td>{row.schCatDesc || row.schCategoryId || "-"}</td>
                <td>{row.schTypeDesc || row.schType || "-"}</td>
                <td>{row.schMgmtDesc || row.schMgmtId || "-"}</td>
                <td>{row.schoolStatusName || row.schoolStatus || "-"}</td>
                <td>{row.classFrm || "-"}</td>
                <td>{row.classTo || "-"}</td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan="11">No records found for selected filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1 || loading}>
          Prev
        </button>
        <span>
          Page {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || loading}
        >
          Next
        </button>
      </div>
    </main>
  );
}
