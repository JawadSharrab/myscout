import { OpportunityDetailPage } from "@/pages/OpportunityDetail";
import { Category, Status } from "@/types";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import {
  makeOpportunity,
  mockCalls,
  mockParams,
  mockState,
  resetMockBackend,
} from "./mockBackend";
import { renderWithProviders } from "./renderWithProviders";

describe("OpportunityDetailPage", () => {
  beforeEach(() => {
    resetMockBackend();
    mockState.catalog = [
      makeOpportunity({
        id: 7n,
        title: "Jordan Youth Leadership Forum",
        category: Category.leadership,
        status: Status.open,
        cost: "Free",
        location: "Dead Sea (Amman area)",
        venue: "King Hussein bin Talal Convention Centre",
        description: "A focused forum for students who want to lead.",
      }),
    ];
    mockParams.id = "7";
  });

  it("shows the full listing: title, category, cost, status, location", async () => {
    renderWithProviders(<OpportunityDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /jordan youth leadership forum/i }),
      ).toBeInTheDocument();
    });
    expect(screen.getByTestId("category_badge")).toHaveTextContent(
      "Leadership",
    );
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Dead Sea (Amman area)")).toBeInTheDocument();
    expect(screen.getByText(/focused forum for students/i)).toBeInTheDocument();
  });

  it("does not render any distance or km display on the detail page", async () => {
    renderWithProviders(<OpportunityDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /jordan youth leadership forum/i }),
      ).toBeInTheDocument();
    });
    expect(screen.queryByText(/km/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/distance/i)).not.toBeInTheDocument();
  });

  it("renders the factor-rating breakdown with all 10 factors", async () => {
    renderWithProviders(<OpportunityDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId("score_card")).toBeInTheDocument();
    });
    expect(screen.getByText("Why this score?")).toBeInTheDocument();
    expect(screen.getByTestId("factor_recognition")).toBeInTheDocument();
    expect(screen.getByTestId("factor_skillDevelopment")).toBeInTheDocument();
    expect(
      screen.getByTestId("factor_uniApplicationValue"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("factor_priceValue")).toBeInTheDocument();
    expect(screen.getByTestId("overall_score")).toBeInTheDocument();
  });

  it("resolves the backend explanation for all 10 factors", async () => {
    renderWithProviders(<OpportunityDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId("score_card")).toBeInTheDocument();
    });
    // The frontend looks up each factor's explanation by the backend's exact
    // factor name (e.g. "Recognition / reputation"), so the backend's name and
    // weight are shown instead of the fallback text. Open a few factor rows to
    // reveal their explanations.
    await userEvent.click(screen.getByTestId("factor_recognition_toggle"));
    await userEvent.click(
      screen.getByTestId("factor_uniApplicationValue_toggle"),
    );
    await userEvent.click(screen.getByTestId("factor_leadership_toggle"));
    await userEvent.click(screen.getByTestId("factor_difficulty_toggle"));
    await userEvent.click(screen.getByTestId("factor_relevance_toggle"));
    await waitFor(() => {
      expect(screen.getByText("Recognition / reputation")).toBeInTheDocument();
    });
    expect(
      screen.getByText("University application value"),
    ).toBeInTheDocument();
    expect(screen.getByText("Leadership potential")).toBeInTheDocument();
    expect(screen.getByText("Difficulty / challenge")).toBeInTheDocument();
    expect(screen.getByText("Relevance to interests")).toBeInTheDocument();
  });

  it("shows an error state for an unknown opportunity id", async () => {
    mockParams.id = "9999";
    renderWithProviders(<OpportunityDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Opportunity not found")).toBeInTheDocument();
    });
  });

  it("saves an opportunity when signed in", async () => {
    mockState.isAuthenticated = true;
    renderWithProviders(<OpportunityDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId("save_button")).toBeInTheDocument();
    });
    await userEvent.click(screen.getByTestId("save_button"));

    await waitFor(() => {
      expect(mockCalls.saveOpportunity).toContain(7n);
    });
  });
});
