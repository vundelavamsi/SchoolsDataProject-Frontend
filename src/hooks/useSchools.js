import { useState, useCallback, useRef } from "react";
import { buildAccessHeaders } from "../lib/access";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

export function useSchools(phone) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiFailed, setApiFailed] = useState(false);
  const abortRef = useRef(null);
  const requestIdRef = useRef(0);

  const fetchSchools = useCallback(async (filters, pageNum = 1, pageSize = 25) => {
    const requestId = ++requestIdRef.current;

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
        headers: buildAccessHeaders(phone),
      });
      if (!res.ok) {
        throw new Error(`Schools API failed with status ${res.status}`);
      }
      const data = await res.json();
      if (requestId !== requestIdRef.current) return;

      setRows(data.data || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 0);
      setApiFailed(false);
    } catch (err) {
      if (err.name !== "AbortError") {
        if (requestId !== requestIdRef.current) return;
        console.error("Failed to fetch schools", err);
        setApiFailed(true);
        setRows([]);
        setTotal(0);
        setPage(1);
        setTotalPages(0);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [phone]);

  const goToPage = useCallback(
    (newPage, filters, pageSize = 25) => {
      const clamped = Math.max(1, Math.min(newPage, totalPages || 1));
      fetchSchools(filters, clamped, pageSize);
    },
    [fetchSchools, totalPages]
  );

  return { rows, total, page, totalPages, loading, apiFailed, fetchSchools, goToPage };
}
