import { AccountProvider } from "@/hooks/useAccount";
import { SavedProvider } from "@/hooks/useSaved";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

/**
 * Render a page under the providers it depends on (React Query, account, and
 * saved state). The auth/actor seam is mocked in ./setup, so no real backend
 * or Internet Identity is touched.
 */
export function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AccountProvider>
          <SavedProvider>{children}</SavedProvider>
        </AccountProvider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper });
}
