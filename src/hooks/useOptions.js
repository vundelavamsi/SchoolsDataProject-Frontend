import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

const EMPTY_OPTIONS = {
  stateId: [],
  districtId: [],
  blockId: [],
  villageId: [],
  schCategoryId: [],
  schType: [],
  schMgmtId: [],
  schoolStatus: [],
  schLocRuralUrban: [],
  classRange: [],
};

export function useOptions(stateId, districtId, blockId) {
  const [options, setOptions] = useState(EMPTY_OPTIONS);

  // On mount: fetch states + static options in parallel
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    Promise.all([
      fetch(`${API_BASE}/api/options/states`, { signal }).then((r) => r.json()),
      fetch(`${API_BASE}/api/options`, { signal }).then((r) => r.json()),
      fetch(`${API_BASE}/api/options/classRanges`, { signal }).then((r) => r.json()),
    ])
      .then(([statesData, staticData, classData]) => {
        setOptions((prev) => ({
          ...prev,
          stateId: statesData.stateId || [],
          schCategoryId: staticData.schCategoryId || [],
          schType: staticData.schType || [],
          schMgmtId: staticData.schMgmtId || [],
          schoolStatus: staticData.schoolStatus || [],
          schLocRuralUrban: staticData.schLocRuralUrban || [],
          classRange: classData.classRange || [],
        }));
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error("Failed to load options", err);
      });

    return () => controller.abort();
  }, []);

  // On stateId change: fetch districts
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    setOptions((prev) => ({ ...prev, districtId: [], blockId: [], villageId: [] }));

    if (!stateId) return () => controller.abort();

    const url = `${API_BASE}/api/options/districts?stateId=${encodeURIComponent(stateId)}`;
    fetch(url, { signal })
      .then((r) => r.json())
      .then((data) => {
        setOptions((prev) => ({ ...prev, districtId: data.districtId || [] }));
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error("Failed to load districts", err);
      });

    return () => controller.abort();
  }, [stateId]);

  // On districtId change: fetch blocks
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    setOptions((prev) => ({ ...prev, blockId: [], villageId: [] }));

    if (!districtId) return () => controller.abort();

    const params = new URLSearchParams();
    if (stateId) params.set("stateId", stateId);
    params.set("districtId", districtId);

    fetch(`${API_BASE}/api/options/blocks?${params}`, { signal })
      .then((r) => r.json())
      .then((data) => {
        setOptions((prev) => ({ ...prev, blockId: data.blockId || [] }));
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error("Failed to load blocks", err);
      });

    return () => controller.abort();
  }, [stateId, districtId]);

  // On blockId change: fetch villages
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    setOptions((prev) => ({ ...prev, villageId: [] }));

    if (!blockId) return () => controller.abort();

    const params = new URLSearchParams({ districtId: districtId || "", blockId });
    fetch(`${API_BASE}/api/options/villages?${params}`, { signal })
      .then((r) => r.json())
      .then((data) => {
        setOptions((prev) => ({ ...prev, villageId: data.villageId || [] }));
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error("Failed to load villages", err);
      });

    return () => controller.abort();
  }, [districtId, blockId]);

  return { options };
}
