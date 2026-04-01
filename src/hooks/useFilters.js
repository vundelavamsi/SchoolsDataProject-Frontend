import { useState, useCallback } from "react";

const INITIAL_FILTERS = {
  stateId: "",
  districtId: "",
  blockId: "",
  villageId: "",
  schCategoryId: "",
  schType: "",
  schMgmtId: "",
  schoolStatus: "",
  classFromMin: "",
  classToMax: "",
  search: "",
};

export function useFilters() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const setFilter = useCallback((name, value) => {
    setFilters((prev) => {
      const next = { ...prev, [name]: value };
      // Cascade resets
      if (name === "stateId") {
        next.districtId = "";
        next.blockId = "";
        next.villageId = "";
      } else if (name === "districtId") {
        next.blockId = "";
        next.villageId = "";
      } else if (name === "blockId") {
        next.villageId = "";
      }
      return next;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  return { filters, setFilter, resetFilters };
}
