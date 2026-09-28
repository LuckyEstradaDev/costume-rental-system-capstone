import {useCallback, useMemo, useState} from "react";
import {
  addDays,
  parseDateInputValue,
  resolveWindow,
  startOfDay,
} from "../utils/dateRange";
import type {WindowPresetId} from "../types/filters";

/**
 * The date window behind the dashboard and the admin list pages.
 *
 * List pages default to "all time": narrowing a table to the last 30 days on
 * arrival would read as data loss, and a table has no aggregate endpoint to
 * derive real bounds from. The dashboard passes "30d" explicitly instead.
 */
export const DEFAULT_LIST_PRESET: WindowPresetId = "all";

export const presetLabel = (id: WindowPresetId): string => {
  switch (id) {
    case "7d":
      return "Last 7 days";
    case "30d":
      return "Last 30 days";
    case "90d":
      return "Last 90 days";
    case "thisMonth":
      return "This month";
    case "lastMonth":
      return "Last month";
    case "ytd":
      return "Year to date";
    case "all":
      return "All time";
    case "custom":
      return "Custom range";
  }
};

export function useDateWindow(
  defaultPreset: WindowPresetId = DEFAULT_LIST_PRESET,
) {
  const [presetId, setPresetId] = useState<WindowPresetId>(defaultPreset);
  const [customFrom, setCustomFrom] = useState(() =>
    addDays(startOfDay(new Date()), -29),
  );
  const [customTo, setCustomTo] = useState(() => startOfDay(new Date()));

  // No data bounds are supplied: "all time" resolves to the wide sentinel
  // range, which keeps every real row in scope on pages that have no aggregate
  // endpoint to derive bounds from.
  const range = useMemo(
    () =>
      resolveWindow(presetId, customFrom, customTo, {
        earliest: null,
        latest: null,
      }),
    [presetId, customFrom, customTo],
  );

  const setPreset = useCallback((next: WindowPresetId) => {
    setPresetId(next);
  }, []);

  // Typing a date adopts a custom range immediately, so the panel needs no
  // separate "apply" step.
  const setCustomFromValue = useCallback((value: string, fallback: Date) => {
    setPresetId("custom");
    setCustomFrom(parseDateInputValue(value, fallback));
  }, []);

  const setCustomToValue = useCallback((value: string, fallback: Date) => {
    setPresetId("custom");
    setCustomTo(parseDateInputValue(value, fallback));
  }, []);

  const resetAll = useCallback(() => {
    setPresetId(defaultPreset);
  }, [defaultPreset]);

  return {
    presetId,
    customFrom,
    customTo,
    range,
    isDefault: presetId === defaultPreset,
    setPreset,
    setCustomFromValue,
    setCustomToValue,
    resetAll,
  };
}

export type DateWindow = ReturnType<typeof useDateWindow>;
