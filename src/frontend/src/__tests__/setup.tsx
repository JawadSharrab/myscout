import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// jsdom does not implement Element.prototype.scrollIntoView, which the Map
// page's selection-sync hook calls to bring the selected card into view.
// Provide a no-op so the reorder/scroll behavior can be exercised in tests.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// jsdom does not implement pointer-capture APIs that Radix UI (e.g. Select)
// relies on. Provide no-ops so Radix components can be driven in tests.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}

// next-themes reads the system color scheme via matchMedia; jsdom does not
// implement it. Provide a minimal stub so the ThemeProvider can mount.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// The generated components use `data-ocid` for test hooks. Configure RTL to
// treat it as the test id attribute so semantic queries stay readable.
configure({ testIdAttribute: "data-ocid" });

// Vitest is not run with `globals: true`, so RTL's automatic cleanup (which
// relies on a global `afterEach`) does not fire. Clean the DOM explicitly so
// renders from one test never leak into the next.
afterEach(() => {
  cleanup();
});

// Mock the auth/actor seam so tests never touch a real backend or Internet
// Identity. The mock state is exported from ./mockBackend and mutated per test.
vi.mock("@caffeineai/core-infrastructure", async () => {
  const { mockActor, mockAuth } = await import("./mockBackend");
  return {
    useActor: () => ({ actor: mockActor, isFetching: false }),
    useInternetIdentity: () => mockAuth,
    InternetIdentityProvider: ({ children }: { children: React.ReactNode }) =>
      children,
  };
});

// Mock the router primitives the pages use. `Link` renders a plain anchor so
// navigation is observable without a real router; it interpolates `params.id`
// into the `to` template the way the real router does. `useParams` reads a
// mutable value so detail-page tests can control the requested id.
vi.mock("@tanstack/react-router", async () => {
  const { mockParams } = await import("./mockBackend");
  return {
    Link: ({
      to,
      params,
      children,
      ...rest
    }: {
      to: string;
      params?: { id?: string };
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => {
      let href = to;
      if (params?.id) {
        href = to.replace("$id", params.id);
      }
      return (
        <a href={href} {...rest}>
          {children}
        </a>
      );
    },
    useParams: () => mockParams,
  };
});

// sonner's `toast` is called by save/remove handlers; stub it so no real toast
// DOM is produced and calls are observable.
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// `@/backend` (the generated actor wrapper) re-exports `ExternalBlob` from
// `@caffeineai/object-storage`, whose `exports` map does not expose its internal
// `./blob` subpath under Vite's resolver. Stub the package so the wrapper loads
// without touching the broken subpath; the actor itself is mocked anyway.
vi.mock("@caffeineai/object-storage", () => ({
  ExternalBlob: class ExternalBlob {},
}));
