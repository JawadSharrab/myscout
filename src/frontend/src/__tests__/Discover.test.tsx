import { DiscoverPage } from "@/pages/Discover";
import { Category, CostFilter, Status } from "@/types";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import {
  makeOpportunity,
  mockCalls,
  mockState,
  resetMockBackend,
} from "./mockBackend";
import { renderWithProviders } from "./renderWithProviders";

describe("DiscoverPage", () => {
  beforeEach(() => {
    resetMockBackend();
    mockState.catalog = [
      makeOpportunity({
        id: 1n,
        title: "Amman Model United Nations",
        category: Category.academic,
        status: Status.open,
        cost: "35 JOD",
      }),
      makeOpportunity({
        id: 2n,
        title: "Debate Open",
        category: Category.debate,
        status: Status.closingSoon,
        cost: "Free",
      }),
    ];
  });

  it("renders the hero with tagline and a primary explore CTA", () => {
    renderWithProviders(<DiscoverPage />);
    expect(
      screen.getByRole("heading", { name: /find something worth doing/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /browse opportunities/i }),
    ).toBeInTheDocument();
  });

  it("shows the For you / Explore / Saved tabs", () => {
    renderWithProviders(<DiscoverPage />);
    expect(screen.getByRole("tab", { name: /for you/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /explore/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /saved/i })).toBeInTheDocument();
  });

  it("lists the seeded catalog on the Explore tab with card details", async () => {
    renderWithProviders(<DiscoverPage />);
    await userEvent.click(screen.getByRole("tab", { name: /explore/i }));

    await waitFor(() => {
      expect(screen.getByTestId("opportunity_list")).toBeInTheDocument();
    });
    // Scope the grid assertions because the Featured Pick card above the tabs
    // also shows the top opportunity's title.
    const grid = screen.getByTestId("opportunity_list");
    expect(
      within(grid).getByText("Amman Model United Nations"),
    ).toBeInTheDocument();
    expect(within(grid).getByText("Debate Open")).toBeInTheDocument();
    // Card shows category, rating, cost, distance, status. Scope the category
    // and status assertions to the card because the filter pills also read
    // "Academic" and "Open".
    const card = screen.getByTestId("opportunity_card.0");
    expect(within(card).getByText("Academic")).toBeInTheDocument();
    expect(within(grid).getByText("35 JOD")).toBeInTheDocument();
    expect(within(card).getByText("Open")).toBeInTheDocument();
  });

  it("does not render any distance or km display on cards", async () => {
    renderWithProviders(<DiscoverPage />);
    await userEvent.click(screen.getByRole("tab", { name: /explore/i }));

    await waitFor(() => {
      expect(screen.getByTestId("opportunity_list")).toBeInTheDocument();
    });
    expect(screen.queryByText(/km/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/distance/i)).not.toBeInTheDocument();
  });

  it("searches opportunities by keyword and calls the backend search", async () => {
    renderWithProviders(<DiscoverPage />);
    await userEvent.click(screen.getByRole("tab", { name: /explore/i }));

    const search = screen.getByRole("searchbox", {
      name: /search opportunities/i,
    });
    await userEvent.type(search, "debate");

    await waitFor(() => {
      expect(mockCalls.searchOpportunities).toContain("debate");
    });
    // Only the debate opportunity matches. Scope to the results grid because
    // the Featured Pick card above the tabs always shows the top opportunity.
    const grid = screen.getByTestId("opportunity_list");
    expect(within(grid).getByText("Debate Open")).toBeInTheDocument();
    expect(
      within(grid).queryByText("Amman Model United Nations"),
    ).not.toBeInTheDocument();
  });

  it("filters by category and status through the backend filter", async () => {
    renderWithProviders(<DiscoverPage />);
    await userEvent.click(screen.getByRole("tab", { name: /explore/i }));

    await userEvent.click(screen.getByTestId("category_pill.academic"));
    await userEvent.click(screen.getByTestId("status_pill.open"));

    await waitFor(() => {
      expect(mockCalls.filterOpportunities.length).toBeGreaterThan(0);
    });
    const filter = mockCalls.filterOpportunities.at(-1);
    expect(filter?.category).toBe(Category.academic);
    expect(filter?.status).toBe(Status.open);
    const grid = screen.getByTestId("opportunity_list");
    expect(
      within(grid).getByText("Amman Model United Nations"),
    ).toBeInTheDocument();
    expect(within(grid).queryByText("Debate Open")).not.toBeInTheDocument();
  });

  it("filters by cost through the backend filter", async () => {
    renderWithProviders(<DiscoverPage />);
    await userEvent.click(screen.getByRole("tab", { name: /explore/i }));

    await userEvent.click(screen.getByTestId("cost_pill.free"));

    await waitFor(() => {
      expect(mockCalls.filterOpportunities.length).toBeGreaterThan(0);
    });
    const filter = mockCalls.filterOpportunities.at(-1);
    expect(filter?.cost).toBe(CostFilter.free);
    // Only the free opportunity remains; the paid one is filtered out. Scope
    // to the results grid because the Featured Pick shows the top opportunity.
    const grid = screen.getByTestId("opportunity_list");
    expect(within(grid).getByText("Debate Open")).toBeInTheDocument();
    expect(
      within(grid).queryByText("Amman Model United Nations"),
    ).not.toBeInTheDocument();
  });

  it("switches recommendation mode and calls the backend recommend", async () => {
    renderWithProviders(<DiscoverPage />);
    await userEvent.click(screen.getByRole("tab", { name: /explore/i }));

    await userEvent.click(screen.getByTestId("mode.highestRated"));

    await waitFor(() => {
      expect(mockCalls.recommend).toContain("highestRated");
    });
  });

  it("shows a sign-in prompt on the For you tab when signed out", async () => {
    renderWithProviders(<DiscoverPage />);
    expect(
      screen.getByText(/sign in for personalized picks/i),
    ).toBeInTheDocument();
  });

  it("renders the hero and tabbed content together on the page", () => {
    renderWithProviders(<DiscoverPage />);
    // The hero section and the tabbed content both belong to the discover
    // experience; a spotlight card added to the page must not displace either.
    expect(
      screen.getByRole("heading", { name: /find something worth doing/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /for you/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /explore/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /saved/i })).toBeInTheDocument();
  });

  it("defaults to the For you tab on first render", () => {
    renderWithProviders(<DiscoverPage />);
    // The default tab is "For you", so its sign-in prompt is visible without
    // any interaction. A spotlight card must not change which tab is active.
    expect(
      screen.getByText(/sign in for personalized picks/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/browse the full catalog across amman/i),
    ).not.toBeInTheDocument();
  });

  it("renders a Featured Pick spotlight card for the highest-scored opportunity", async () => {
    // Give the second opportunity a higher uni value so it wins the pick.
    mockState.catalog = [
      makeOpportunity({
        id: 1n,
        title: "Amman Model United Nations",
        category: Category.academic,
        status: Status.open,
        cost: "35 JOD",
      }),
      makeOpportunity({
        id: 2n,
        title: "Jordan Robotics Cup",
        category: Category.coding,
        status: Status.open,
        cost: "Free",
        factorRatings: {
          recognition: 5,
          difficulty: 3,
          skillDevelopment: 5,
          networking: 5,
          timeCommitment: 3,
          leadership: 5,
          relevance: 5,
          worthYourTime: 5,
          priceValue: 5,
          uniApplicationValue: 5,
        },
      }),
    ];
    renderWithProviders(<DiscoverPage />);

    await waitFor(() => {
      expect(screen.getByText("Jordan Robotics Cup")).toBeInTheDocument();
    });

    const card = screen.getByTestId("featured_pick");
    expect(within(card).getByText(/featured pick/i)).toBeInTheDocument();
    // Pill tags at the top of the card.
    expect(within(card).getByText("Top signal")).toBeInTheDocument();
    expect(within(card).getByText("Uni value")).toBeInTheDocument();
    // Serif italic headline is the featured opportunity title.
    expect(
      within(card).getByRole("heading", { name: "Jordan Robotics Cup" }),
    ).toBeInTheDocument();
    // Metric line: rating, university application value, and cost — no distance.
    expect(within(card).getByText(/\/ 5/)).toBeInTheDocument();
    expect(
      within(card).getByText(/university application value/i),
    ).toBeInTheDocument();
    expect(within(card).getByText("Free")).toBeInTheDocument();
    // CTA navigates to the detail page.
    expect(
      within(card).getByRole("link", { name: /explore the pick/i }),
    ).toHaveAttribute("href", "/opportunity/2");
  });

  it("does not show a Closest tag or any distance metric on the Featured Pick", async () => {
    renderWithProviders(<DiscoverPage />);

    await waitFor(() => {
      expect(screen.getByTestId("featured_pick")).toBeInTheDocument();
    });

    const card = screen.getByTestId("featured_pick");
    expect(within(card).queryByText(/closest/i)).not.toBeInTheDocument();
    expect(within(card).queryByText(/km/i)).not.toBeInTheDocument();
    expect(within(card).queryByText(/distance/i)).not.toBeInTheDocument();
  });

  // Characterization: the Featured Pick card's content contract. The request
  // swaps the card's visual treatment (CSS-only navy gradient -> illustration
  // image), so these assertions pin the text/structure that must survive the
  // swap: eyebrow, chips, title, organizer, metric line, and CTA.
  it("keeps the Featured Pick eyebrow, chips, title, organizer, metric line, and CTA", async () => {
    mockState.catalog = [
      makeOpportunity({
        id: 7n,
        title: "Amman Youth Orchestra",
        organizer: "Amman Arts Council",
        category: Category.arts,
        status: Status.open,
        cost: "12 JOD",
        factorRatings: {
          recognition: 5,
          difficulty: 3,
          skillDevelopment: 5,
          networking: 5,
          timeCommitment: 3,
          leadership: 5,
          relevance: 5,
          worthYourTime: 5,
          priceValue: 5,
          uniApplicationValue: 5,
        },
      }),
    ];
    renderWithProviders(<DiscoverPage />);

    await waitFor(() => {
      expect(screen.getByTestId("featured_pick")).toBeInTheDocument();
    });

    const card = screen.getByTestId("featured_pick");
    // Eyebrow.
    expect(within(card).getByText(/featured pick/i)).toBeInTheDocument();
    // Chips.
    expect(within(card).getByText("Top signal")).toBeInTheDocument();
    expect(within(card).getByText("Uni value")).toBeInTheDocument();
    // Title and organizer.
    expect(
      within(card).getByRole("heading", { name: "Amman Youth Orchestra" }),
    ).toBeInTheDocument();
    expect(within(card).getByText("Amman Arts Council")).toBeInTheDocument();
    // Metric line: score, university application value, and cost.
    expect(within(card).getByText(/\/ 5/)).toBeInTheDocument();
    expect(
      within(card).getByText(/university application value/i),
    ).toBeInTheDocument();
    expect(within(card).getByText("12 JOD")).toBeInTheDocument();
    // CTA still navigates to the featured opportunity's detail page.
    expect(
      within(card).getByRole("link", { name: /explore the pick/i }),
    ).toHaveAttribute("href", "/opportunity/7");
  });

  // Cover: the accepted change replaces the Featured Pick's CSS-only navy
  // gradient visual with the attached Amman arches illustration, referenced as
  // a public path under /assets/ the same way the hero image is.
  it("renders the Featured Pick illustration as the card's visual", async () => {
    renderWithProviders(<DiscoverPage />);

    await waitFor(() => {
      expect(screen.getByTestId("featured_pick")).toBeInTheDocument();
    });

    const card = screen.getByTestId("featured_pick");
    const illustration = within(card).getByRole("img", {
      name: /illustration of amman-style arches and domes/i,
    });
    expect(illustration).toHaveAttribute(
      "src",
      "/assets/featured-pick-amman.png",
    );
  });

  it("keeps the Featured Pick content contract alongside the illustration", async () => {
    mockState.catalog = [
      makeOpportunity({
        id: 9n,
        title: "Amman Robotics Challenge",
        organizer: "Jordan STEM Network",
        category: Category.coding,
        status: Status.open,
        cost: "Free",
        factorRatings: {
          recognition: 5,
          difficulty: 3,
          skillDevelopment: 5,
          networking: 5,
          timeCommitment: 3,
          leadership: 5,
          relevance: 5,
          worthYourTime: 5,
          priceValue: 5,
          uniApplicationValue: 5,
        },
      }),
    ];
    renderWithProviders(<DiscoverPage />);

    await waitFor(() => {
      expect(screen.getByTestId("featured_pick")).toBeInTheDocument();
    });

    const card = screen.getByTestId("featured_pick");
    // The illustration is the visual, and the copy block is still present.
    expect(
      within(card).getByRole("img", {
        name: /illustration of amman-style arches and domes/i,
      }),
    ).toHaveAttribute("src", "/assets/featured-pick-amman.png");
    expect(within(card).getByText(/featured pick/i)).toBeInTheDocument();
    expect(within(card).getByText("Top signal")).toBeInTheDocument();
    expect(within(card).getByText("Uni value")).toBeInTheDocument();
    expect(
      within(card).getByRole("heading", { name: "Amman Robotics Challenge" }),
    ).toBeInTheDocument();
    expect(within(card).getByText("Jordan STEM Network")).toBeInTheDocument();
    expect(within(card).getByText(/\/ 5/)).toBeInTheDocument();
    expect(
      within(card).getByText(/university application value/i),
    ).toBeInTheDocument();
    expect(within(card).getByText("Free")).toBeInTheDocument();
    expect(
      within(card).getByRole("link", { name: /explore the pick/i }),
    ).toHaveAttribute("href", "/opportunity/9");
  });

  it("renders exactly one Featured Pick spotlight for the catalog", async () => {
    renderWithProviders(<DiscoverPage />);

    await waitFor(() => {
      expect(screen.getByTestId("featured_pick")).toBeInTheDocument();
    });

    expect(screen.getAllByTestId("featured_pick")).toHaveLength(1);
  });

  // Characterization: the hero illustration is adjacent working behavior that
  // must survive the Featured Pick asset work. It is the page's only raster
  // image today and carries a descriptive alt.
  it("renders the hero illustration with descriptive alt text", () => {
    renderWithProviders(<DiscoverPage />);

    const hero = screen.getByRole("img", {
      name: /abstract illustration of amman's arches and domes/i,
    });
    expect(hero).toHaveAttribute(
      "src",
      "/assets/generated/hero-amman.dim_1600x900.jpg",
    );
  });
});
