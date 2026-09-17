import type { Category } from "@/backend";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDeleteAccount, useGetInterests } from "./useQueries";

interface AccountContextValue {
  /** The caller's selected interest categories (empty when none set). */
  interests: Category[];
  interestsLoading: boolean;
  /** Whether the first-sign-in interests picker should be shown. */
  showInterestsPicker: boolean;
  openInterestsPicker: () => void;
  closeInterestsPicker: () => void;
  /** Delete the caller's account, wiping all local + backend state. */
  deleteAccount: (confirmation: string) => void;
  isDeletingAccount: boolean;
}

const AccountContext = createContext<AccountContextValue | null>(null);

/**
 * Provides shared account state: the caller's interests, the first-sign-in
 * interests picker, and account deletion. Interests are backend-owned
 * (getInterests); this context only mirrors them and exposes mutations.
 */
export function AccountProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: interests = [], isLoading: interestsLoading } =
    useGetInterests();
  const deleteMutation = useDeleteAccount();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [prompted, setPrompted] = useState(false);

  // Reset the "already prompted" flag on each fresh sign-in so a new account
  // with no interests is prompted again.
  useEffect(() => {
    if (!isAuthenticated) {
      setPrompted(false);
    }
  }, [isAuthenticated]);

  // First sign-in: show the picker when authenticated, interests are loaded
  // and empty, and we haven't already prompted this session.
  useEffect(() => {
    if (
      isAuthenticated &&
      !interestsLoading &&
      interests.length === 0 &&
      !prompted
    ) {
      setPickerOpen(true);
      setPrompted(true);
    }
  }, [isAuthenticated, interestsLoading, interests.length, prompted]);

  const openInterestsPicker = useCallback(() => setPickerOpen(true), []);
  const closeInterestsPicker = useCallback(() => setPickerOpen(false), []);

  const deleteAccount = useCallback(
    (confirmation: string) => {
      deleteMutation.mutate(confirmation, {
        onSuccess: () => {
          // Wipe all cached application data, then sign out.
          queryClient.clear();
          clear();
        },
      });
    },
    [deleteMutation, queryClient, clear],
  );

  const value = useMemo(
    () => ({
      interests,
      interestsLoading,
      showInterestsPicker: pickerOpen,
      openInterestsPicker,
      closeInterestsPicker,
      deleteAccount,
      isDeletingAccount: deleteMutation.isPending,
    }),
    [
      interests,
      interestsLoading,
      pickerOpen,
      openInterestsPicker,
      closeInterestsPicker,
      deleteAccount,
      deleteMutation.isPending,
    ],
  );

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}

export function useAccount(): AccountContextValue {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
}
