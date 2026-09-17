import { MapPage } from "@/pages/Map";
import { Category, Status } from "@/types";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { makeOpportunity, mockState, resetMockBackend } from "./mockBackend";
import { renderWithProviders } from "./renderWithProviders";

describe("MapPage", () => {
  beforeEach(() => {
    resetMockBackend();
    mockState.catalog = [
      makeOpportunity({
        id: 1n,
        title: "Amman Model United Nations",
        category: Category.academic,
        status: Status.open,
        marker: { x: 26, y: 32 },
      }),
      makeOpportunity({
        id: 12n,
        title: "Winter Community Kitchen",
        category: Category.volunteering,
        status: Status.closed,
        marker: { x: 69, y: 73 },
      }),
    ];
  });

  it("renders a marker per opportunity and the opportunity count", async () => {
    renderWithProviders(<MapPage />);

    await waitFor(() => {
      expect(screen.getByTestId("map_marker.0")).toBeInTheDocument();
    });
    expect(screen.getByTestId("map_marker.1")).toBeInTheDocument();
    // The count is rendered with the number in its own span, so the text is
    // split across elements; match on the container's full text content.
    expect(
      screen.getByText(
        (_, element) => element?.textContent === "2opportunities on the map",
      ),
    ).toBeInTheDocument();
  });

  it("filters markers by status", async () => {
    renderWithProviders(<MapPage />);

    await waitFor(() => {
      expect(screen.getByTestId("map_marker.0")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId("map_status_filter_closed"));

    await waitFor(() => {
      expect(
        screen.getByText(
          (_, element) => element?.textContent === "1opportunity on the map",
        ),
      ).toBeInTheDocument();
    });
    // The closed opportunity remains; the open one is filtered out.
    expect(screen.getByText("Winter Community Kitchen")).toBeInTheDocument();
    expect(
      screen.queryByText("Amman Model United Nations"),
    ).not.toBeInTheDocument();
  });

  it("selecting a marker reveals a summary card linking to the detail page", async () => {
    renderWithProviders(<MapPage />);

    await waitFor(() => {
      expect(screen.getByTestId("map_marker.0")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId("map_marker.0"));

    // The summary card title links to the opportunity detail route.
    const link = screen.getByRole("link", {
      name: /amman model united nations/i,
    });
    expect(link).toHaveAttribute("href", "/opportunity/1");
  });

  it("highlights the selected card when its marker is selected", async () => {
    renderWithProviders(<MapPage />);

    await waitFor(() => {
      expect(screen.getByTestId("map_marker.0")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId("map_marker.0"));

    // The card for the selected opportunity reflects the active state via its
    // "Located" locate button, so marker selection stays in sync with the card.
    await waitFor(() => {
      expect(
        within(screen.getByTestId("map_card.0")).getByRole("button", {
          name: /located/i,
        }),
      ).toBeInTheDocument();
    });
  });

  it("highlights the selected marker when its card is selected", async () => {
    renderWithProviders(<MapPage />);

    await waitFor(() => {
      expect(screen.getByTestId("map_card.0")).toBeInTheDocument();
    });

    // Selecting a card (via its "Locate on map" button) marks the matching
    // marker as active, keeping the card and marker in sync in both
    // directions.
    await userEvent.click(
      within(screen.getByTestId("map_card.0")).getByRole("button", {
        name: /locate on map/i,
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("map_marker.0")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });
  });

  it("moves the selected opportunity's card to the first sidebar position", async () => {
    renderWithProviders(<MapPage />);

    await waitFor(() => {
      expect(screen.getByTestId("map_card.0")).toBeInTheDocument();
    });

    // Initially the first card is the first catalog item.
    expect(
      within(screen.getByTestId("map_card.0")).getByText(
        "Amman Model United Nations",
      ),
    ).toBeInTheDocument();

    // Select the second opportunity's marker; its card should move to first.
    await userEvent.click(screen.getByTestId("map_marker.1"));

    await waitFor(() => {
      expect(
        within(screen.getByTestId("map_card.0")).getByText(
          "Winter Community Kitchen",
        ),
      ).toBeInTheDocument();
    });
  });

  it("sorts by a recommendation mode via the select", async () => {
    renderWithProviders(<MapPage />);

    await waitFor(() => {
      expect(screen.getByTestId("map_mode_select")).toBeInTheDocument();
    });

    await userEvent.selectOptions(
      screen.getByTestId("map_mode_select"),
      "highestRated",
    );

    // Both opportunities still render; the sort reorders them without error.
    await waitFor(() => {
      expect(
        screen.getByText("Amman Model United Nations"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Winter Community Kitchen")).toBeInTheDocument();
  });

  it("does not offer a closest/distance sort mode", async () => {
    renderWithProviders(<MapPage />);

    await waitFor(() => {
      expect(screen.getByTestId("map_mode_select")).toBeInTheDocument();
    });

    const options = within(screen.getByTestId("map_mode_select")).getAllByRole(
      "option",
    );
    const labels = options.map((o) => o.textContent);
    expect(labels).not.toContain("Closest");
    expect(labels).not.toContain("Distance");
  });

  it("shows the weighted 10-factor overall score on the map card", async () => {
    // The default fixture has every factor at 4 except difficulty and
    // timeCommitment at 3. The weighted model (uniApplicationValue 20%,
    // skillDevelopment 15%, worthYourTime 15%, recognition 12%, leadership 10%,
    // networking 8%, and 5% each for the rest) yields 3.9, which differs from
    // the 3.8 a simple average would produce — so this pins the weighted
    // scoring rather than a plain mean.
    renderWithProviders(<MapPage />);

    await waitFor(() => {
      expect(screen.getByTestId("map_card.0")).toBeInTheDocument();
    });

    // Scope to the first card: both fixture opportunities share the default
    // factor ratings, so both cards show the same weighted score.
    const score = within(screen.getByTestId("map_card.0")).getByTitle(
      "Overall score 3.9 / 5",
    );
    expect(score).toHaveTextContent("3.9");
  });
});
