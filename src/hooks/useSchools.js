import { useState, useCallback, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

export function useSchools() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  const fetchSchools = useCallback(async (filters, pageNum = 1, pageSize = 25) => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(pageNum));
      params.set("pageSize", String(pageSize));

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params.set(key, String(value));
        }
      });

      const res = await fetch(`${API_BASE}/api/schools?${params}`, {
        signal: controller.signal,
      });
      const data = await res.json();

      setRows(data.data || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      if (err.name !== "AbortError") console.error("Failed to fetch schools", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const goToPage = useCallback(
    (newPage, filters, pageSize = 25) => {
      const clamped = Math.max(1, Math.min(newPage, totalPages || 1));
      fetchSchools(filters, clamped, pageSize);
    },
    [fetchSchools, totalPages]
  );

  return { rows, total, page, totalPages, loading, fetchSchools, goToPage };
}
