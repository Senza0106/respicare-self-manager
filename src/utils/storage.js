import { useState, useEffect, useCallback } from 'react';

export const STORAGE_KEYS = {
  PATIENT_PROFILE: 'respicare_patient_profile_v1',
  MEDICATIONS: 'respicare_medications_v1',
  DOSE_LOGS: 'respicare_dose_logs_v1',
  TECHNIQUE_VALIDATIONS: 'respicare_technique_validations_v1',
  SYMPTOM_LOGS: 'respicare_symptom_logs_v1',
  NOTIFICATION_PREFS: 'respicare_notification_prefs_v1'
};

/**
 * Mengembalikan tanggal lokal dalam format YYYY-MM-DD
 */
export function getLocalDateISO(dateObj = new Date()) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Mengembalikan daftar tanggal YYYY-MM-DD mundur sejumlah hari dari hari ini
 */
export function getPastDatesISO(daysCount = 30) {
  const dates = [];
  const today = new Date();
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(getLocalDateISO(d));
  }
  return dates;
}

/**
 * Format tanggal YYYY-MM-DD ke bahasa Indonesia ringkas (contoh: 11 Nov 2026)
 */
export function formatDateID(isoDateStr, includeWeekday = false) {
  if (!isoDateStr) return '-';
  try {
    const [y, m, d] = isoDateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (Number.isNaN(date.getTime())) return isoDateStr;
    return date.toLocaleDateString('id-ID', {
      ...(includeWeekday ? { weekday: 'short' } : {}),
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return isoDateStr;
  }
}

/**
 * Pembaca localStorage yang aman dari error JSON.parse maupun korupsi tipe data
 */
export function safeReadStorage(key, fallbackValue) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallbackValue;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null || raw === undefined || raw.trim() === '') {
      return fallbackValue;
    }
    const parsed = JSON.parse(raw);
    if (parsed === null || parsed === undefined) {
      return fallbackValue;
    }
    if (Array.isArray(fallbackValue) && !Array.isArray(parsed)) {
      return fallbackValue;
    }
    if (
      typeof fallbackValue === 'object' &&
      fallbackValue !== null &&
      !Array.isArray(fallbackValue) &&
      (typeof parsed !== 'object' || Array.isArray(parsed))
    ) {
      return fallbackValue;
    }
    return parsed;
  } catch (err) {
    console.warn(`[RespiCare Storage] Gagal membaca key "${key}", menggunakan fallback data:`, err);
    return fallbackValue;
  }
}

/**
 * Penulis localStorage yang aman dari QuotaExceededError atau mode privat
 */
export function safeWriteStorage(key, value) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`[RespiCare Storage] Gagal menyimpan key "${key}":`, err);
    return false;
  }
}

/**
 * Custom React Hook untuk state yang tersinkronisasi aman dengan LocalStorage
 */
export function useLocalStorage(key, fallbackValue) {
  const [storedValue, setStoredValue] = useState(() => safeReadStorage(key, fallbackValue));

  useEffect(() => {
    safeWriteStorage(key, storedValue);
  }, [key, storedValue]);

  const setValue = useCallback((valueOrUpdater) => {
    setStoredValue((prev) => {
      const nextValue =
        typeof valueOrUpdater === 'function' ? valueOrUpdater(prev) : valueOrUpdater;
      safeWriteStorage(key, nextValue);
      return nextValue;
    });
  }, [key]);

  return [storedValue, setValue];
}
