import { useCallback, useEffect, useState } from "react";
import { ACCESS_PHONE_STORAGE_KEY, buildAccessHeaders, normalizePhone } from "../lib/access";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

const GUEST_ACCESS = {
  phone: "",
  authenticated: false,
  role: null,
  canEdit: false,
  canReview: false,
  blockIds: [],
  scope: "global",
};

export function useAccess() {
  const [phone, setPhone] = useState(() => {
    if (typeof window === "undefined") return "";
    return normalizePhone(window.localStorage.getItem(ACCESS_PHONE_STORAGE_KEY) || "");
  });
  const [access, setAccess] = useState(GUEST_ACCESS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshAccess = useCallback(async (phoneValue) => {
    setLoading(true);
    setError("");
    try {
      const normalized = normalizePhone(phoneValue);
      const url = normalized
        ? `${API_BASE}/api/access?phone=${encodeURIComponent(normalized)}`
        : `${API_BASE}/api/access`;
      const res = await fetch(url, { headers: buildAccessHeaders(normalized) });
      if (!res.ok) {
        setAccess(GUEST_ACCESS);
        setError("Unable to resolve access right now.");
        return;
      }
      const data = await res.json();
      setAccess({
        phone: data.phone || "",
        authenticated: !!data.authenticated,
        role: data.role || null,
        canEdit: !!data.canEdit,
        canReview: !!data.canReview,
        blockIds: Array.isArray(data.blockIds) ? data.blockIds : [],
        scope: data.scope || "global",
      });
    } catch {
      setAccess(GUEST_ACCESS);
      setError("Unable to resolve access right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  const setPhoneAndResolve = useCallback((inputValue) => {
    const normalized = normalizePhone(inputValue);
    setPhone(normalized);
    if (typeof window !== "undefined") {
      if (normalized) {
        window.localStorage.setItem(ACCESS_PHONE_STORAGE_KEY, normalized);
      } else {
        window.localStorage.removeItem(ACCESS_PHONE_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    refreshAccess(phone);
  }, [phone, refreshAccess]);

  return {
    phone,
    access,
    loading,
    error,
    setPhoneAndResolve,
  };
}
