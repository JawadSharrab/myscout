import type { Organizer } from "@/backend";
import { CreateEventPage } from "@/pages/CreateEvent";
import { Category } from "@/types";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { mockCalls, mockState, resetMockBackend } from "./mockBackend";
import { renderWithProviders } from "./renderWithProviders";

describe("CreateEventPage", () => {
  beforeEach(() => {
    resetMockBackend();
  });

  it("prompts sign-in when signed out", () => {
    renderWithProviders(<CreateEventPage />);
    expect(
      screen.getByRole("heading", { name: /create an event/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in to create/i }),
    ).toBeInTheDocument();
  });

  it("shows the organizer sign-up gate when signed in but not an organizer", async () => {
    mockState.isAuthenticated = true;
    renderWithProviders(<CreateEventPage />);

    await waitFor(() => {
      expect(screen.getByTestId("organizer_sign_up_state")).toBeInTheDocument();
    });
    expect(
      screen.getByRole("heading", { name: /become an organizer/i }),
    ).toBeInTheDocument();
  });

  it("signs up as an organizer from the create-event gate", async () => {
    mockState.isAuthenticated = true;
    renderWithProviders(<CreateEventPage />);

    await waitFor(() => {
      expect(
        screen.getByTestId("organizer_sign_up_button"),
      ).toBeInTheDocument();
    });

    await userEvent.type(
      screen.getByLabelText(/organizer name/i),
      "Amman Youth Hub",
    );
    await userEvent.click(screen.getByTestId("organizer_sign_up_button"));

    await waitFor(() => {
      expect(mockCalls.signUpAsOrganizer).toContain("Amman Youth Hub");
    });
  });

  it("creates an event that appears in the catalog and my events", async () => {
    mockState.isAuthenticated = true;
    mockState.isOrganizer = true;
    mockState.organizerProfile = {
      id: "aaaaa-aa" as unknown as Organizer["id"],
      name: "Amman Youth Hub",
      createdAt: 1792238400000000000n,
    };
    renderWithProviders(<CreateEventPage />);

    await waitFor(() => {
      expect(screen.getByTestId("create_event_form")).toBeInTheDocument();
    });

    await userEvent.type(
      screen.getByTestId("event_title_input"),
      "Amman Design Week 2026",
    );
    await userEvent.type(
      screen.getByTestId("event_description_input"),
      "A week of design talks and workshops.",
    );
    await userEvent.type(
      screen.getByTestId("event_venue_input"),
      "Ras El Ain Gallery",
    );
    await userEvent.type(
      screen.getByTestId("event_location_input"),
      "Jabal Amman, Amman",
    );
    await userEvent.type(
      screen.getByTestId("event_date_input"),
      "2026-11-01T10:00",
    );
    await userEvent.type(
      screen.getByTestId("event_deadline_input"),
      "2026-10-15T23:59",
    );
    await userEvent.type(screen.getByTestId("event_cost_input"), "Free");

    // Select a category through the hidden native select that Radix Select
    // renders (jsdom cannot drive the Radix pointer-based dropdown reliably).
    const hiddenSelect = document.querySelector(
      'select[aria-hidden="true"]',
    ) as HTMLSelectElement;
    fireEvent.change(hiddenSelect, { target: { value: Category.design } });

    await userEvent.click(screen.getByTestId("create_event_submit_button"));

    await waitFor(() => {
      expect(mockCalls.createEvent.length).toBe(1);
    });
    const input = mockCalls.createEvent[0];
    expect(input.title).toBe("Amman Design Week 2026");
    expect(input.category).toBe(Category.design);
    expect(input.cost).toBe("Free");

    // The created event appears in the success state and the "Your events"
    // list (two occurrences: the success banner and the my-events card).
    await waitFor(() => {
      expect(
        screen.getAllByText("Amman Design Week 2026").length,
      ).toBeGreaterThanOrEqual(2);
    });
  });
});
