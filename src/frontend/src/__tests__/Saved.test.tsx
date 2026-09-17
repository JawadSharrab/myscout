import { SavedPage } from "@/pages/Saved";
import { Category, Status } from "@/types";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import {
  makeOpportunity,
  mockCalls,
  mockState,
  resetMockBackend,
} from "./mockBackend";
import { renderWithProviders } from "./renderWithProviders";

describe("SavedPage", () => {
  beforeEach(() => {
    resetMockBackend();
    mockState.saved = [
      makeOpportunity({
        id: 3n,
        title: "The Knowledge Initiative Debate Open",
        category: Category.debate,
        status: Status.open,
        location: "Jabal Amman",
      }),
      makeOpportunity({
        id: 5n,
        title: "Girls Code Amman: Build Night",
        category: Category.competition,
        status: Status.open,
        location: "Marka, Amman",
      }),
    ];
  });

  it("prompts sign-in when signed out", () => {
    renderWithProviders(<SavedPage />);
    expect(
      screen.getByRole("heading", { name: /your saved opportunities/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in to view your shortlist/i }),
    ).toBeInTheDocument();
  });

  it("lists saved opportunities with remove and open-detail actions when signed in", async () => {
    mockState.isAuthenticated = true;
    renderWithProviders(<SavedPage />);

    await waitFor(() => {
      expect(
        screen.getByText("The Knowledge Initiative Debate Open"),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText("Girls Code Amman: Build Night"),
    ).toBeInTheDocument();
    expect(screen.getByText("Jabal Amman")).toBeInTheDocument();

    // Open-detail links point at the opportunity detail route.
    const viewLinks = screen.getAllByRole("link", { name: /view/i });
    expect(viewLinks.length).toBe(2);
    expect(viewLinks[0]).toHaveAttribute("href", "/opportunity/3");
  });

  it("removes an opportunity from the shortlist", async () => {
    mockState.isAuthenticated = true;
    renderWithProviders(<SavedPage />);

    await waitFor(() => {
      expect(
        screen.getByText("The Knowledge Initiative Debate Open"),
      ).toBeInTheDocument();
    });

    const removeButtons = screen.getAllByRole("button", { name: /remove/i });
    await userEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(mockCalls.unsaveOpportunity).toContain(3n);
    });
  });

  it("shows an empty state when nothing is saved", async () => {
    mockState.isAuthenticated = true;
    mockState.saved = [];
    renderWithProviders(<SavedPage />);

    await waitFor(() => {
      expect(screen.getByText("Nothing saved yet")).toBeInTheDocument();
    });
    expect(
      screen.getByRole("link", { name: /browse opportunities/i }),
    ).toBeInTheDocument();
  });
});
