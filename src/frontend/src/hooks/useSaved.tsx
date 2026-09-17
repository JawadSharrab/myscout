import type { OpportunityId } from "@/backend";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { createContext, useCallback, useContext, useMemo } from "react";
import {
  useGetSavedOpportunities,
  useSaveOpportunity,
  useUnsaveOpportunity,
} from "./useQueries";

interface SavedContextValue {
  /** Saved opportunity ids keyed by string for stable Set membership. */
  savedIds: Set<string>;
  isSaved: (id: OpportunityId) => boolean;
  save: (id: OpportunityId) => void;
  unsave: (id: OpportunityId) => void;
  toggleSave: (id: OpportunityId) => void;
  savedCount: number;
  isAuthenticated: boolean;
}

const SavedContext = createContext<SavedContextValue | null>(null);

/**
 * Provides shared saved-state across cards, detail pages, and the Saved page.
 * Saved state is backend-owned (getSavedOpportunities); this context only
 * mirrors it and exposes mutations. Saving is gated behind sign-in — callers
 * should show a sign-in prompt when `isAuthenticated` is false.
 */
export function SavedProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useInternetIdentity();
  const { data: savedOpportunities = [] } = useGetSavedOpportunities();
  const saveMutation = useSaveOpportunity();
  const unsaveMutation = useUnsaveOpportunity();

  const savedIds = useMemo(
    () => new Set(savedOpportunities.map((o) => o.id.toString())),
    [savedOpportunities],
  );

  const isSaved = useCallback(
    (id: OpportunityId) => savedIds.has(id.toString()),
    [savedIds],
  );

  const save = useCallback(
    (id: OpportunityId) => {
      if (!isAuthenticated) return;
      saveMutation.mutate(id);
    },
    [isAuthenticated, saveMutation],
  );

  const unsave = useCallback(
    (id: OpportunityId) => {
      if (!isAuthenticated) return;
      unsaveMutation.mutate(id);
    },
    [isAuthenticated, unsaveMutation],
  );

  const toggleSave = useCallback(
    (id: OpportunityId) => {
      if (isSaved(id)) {
        unsave(id);
      } else {
        save(id);
      }
    },
    [isSaved, save, unsave],
  );

  const value = useMemo(
    () => ({
      savedIds,
      isSaved,
      save,
      unsave,
      toggleSave,
      savedCount: savedIds.size,
      isAuthenticated,
    }),
    [savedIds, isSaved, save, unsave, toggleSave, isAuthenticated],
  );

  return (
    <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
  );
}

export function useSaved(): SavedContextValue {
  const context = useContext(SavedContext);
  if (!context) {
    throw new Error("useSaved must be used within a SavedProvider");
  }
  return context;
}
