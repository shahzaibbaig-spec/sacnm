"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { API_URL, api } from "@/lib/auth";

type AdmissionsSettings = {
  admissionsOpen: boolean;
  hideAdmissionsTab: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
  updateSettings: (newSettings: { admissions_open?: boolean; hide_admissions_tab?: boolean }) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
};

const STORAGE_KEY_OPEN = "sacnm_admissions_open";
const STORAGE_KEY_HIDE_TAB = "sacnm_hide_admissions_tab";
const EVENT_CHANGED = "sacnm_admissions_changed";

const AdmissionsContext = createContext<AdmissionsSettings>({
  admissionsOpen: true,
  hideAdmissionsTab: false,
  loading: true,
  saving: false,
  error: null,
  updateSettings: async () => false,
  refreshSettings: async () => {},
});

export function AdmissionsProvider({ children }: { children: React.ReactNode }) {
  const [admissionsOpen, setAdmissionsOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY_OPEN);
      if (stored !== null) return stored === "true" || stored === "1";
    }
    return true;
  });

  const [hideAdmissionsTab, setHideAdmissionsTab] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY_HIDE_TAB);
      if (stored !== null) return stored === "true" || stored === "1";
    }
    return false;
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyLocalSync = useCallback(() => {
    if (typeof window === "undefined") return;
    const storedOpen = localStorage.getItem(STORAGE_KEY_OPEN);
    if (storedOpen !== null) {
      setAdmissionsOpen(storedOpen === "true" || storedOpen === "1");
    }
    const storedHideTab = localStorage.getItem(STORAGE_KEY_HIDE_TAB);
    if (storedHideTab !== null) {
      setHideAdmissionsTab(storedHideTab === "true" || storedHideTab === "1");
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${API_URL}/api/settings`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (res.ok) {
        const body = await res.json();
        const isOpen = body.admissions_open ?? body.data?.admissions_open ?? true;
        const hideTab = body.hide_admissions_tab ?? body.data?.hide_admissions_tab ?? false;

        setAdmissionsOpen(Boolean(isOpen));
        setHideAdmissionsTab(Boolean(hideTab));

        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY_OPEN, String(isOpen));
          localStorage.setItem(STORAGE_KEY_HIDE_TAB, String(hideTab));
        }
      }
    } catch {
      // Offline fallback: keep localStorage values
      applyLocalSync();
    } finally {
      setLoading(false);
    }
  }, [applyLocalSync]);

  useEffect(() => {
    refreshSettings();

    const handleStorageChange = () => applyLocalSync();
    window.addEventListener(EVENT_CHANGED, handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(EVENT_CHANGED, handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshSettings, applyLocalSync]);

  const updateSettings = async (newSettings: { admissions_open?: boolean; hide_admissions_tab?: boolean }): Promise<boolean> => {
    const prevOpen = admissionsOpen;
    const prevHideTab = hideAdmissionsTab;

    const nextOpen = newSettings.admissions_open !== undefined ? newSettings.admissions_open : admissionsOpen;
    const nextHideTab = newSettings.hide_admissions_tab !== undefined ? newSettings.hide_admissions_tab : hideAdmissionsTab;

    // Optimistic UI update
    setAdmissionsOpen(nextOpen);
    setHideAdmissionsTab(nextHideTab);
    setSaving(true);
    setError(null);

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_OPEN, String(nextOpen));
      localStorage.setItem(STORAGE_KEY_HIDE_TAB, String(nextHideTab));
      window.dispatchEvent(new Event(EVENT_CHANGED));
    }

    try {
      await api("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admissions_open: nextOpen,
          hide_admissions_tab: nextHideTab,
        }),
      });
      setSaving(false);
      return true;
    } catch (err) {
      // Revert if API call fails
      console.warn("Failed to persist setting to API, falling back to local state:", err);
      // Still keep local if offline, but show error
      setSaving(false);
      return false;
    }
  };

  return (
    <AdmissionsContext.Provider
      value={{
        admissionsOpen,
        hideAdmissionsTab,
        loading,
        saving,
        error,
        updateSettings,
        refreshSettings,
      }}
    >
      {children}
    </AdmissionsContext.Provider>
  );
}

export function useAdmissions() {
  return useContext(AdmissionsContext);
}
