import type { Organizer } from "@/backend";
import { AccountSettingsPage } from "@/pages/AccountSettings";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { mockCalls, mockState, resetMockBackend } from "./mockBackend";
import { renderWithProviders } from "./renderWithProviders";

describe("AccountSettingsPage", () => {
  beforeEach(() => {
    resetMockBackend();
  });

  it("prompts sign-in when signed out", () => {
    renderWithProviders(<AccountSettingsPage />);
    expect(
      screen.getByRole("heading", { name: /account settings/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in to your account/i }),
    ).toBeInTheDocument();
  });

  it("shows the organizer sign-up form when signed in but not an organizer", async () => {
    mockState.isAuthenticated = true;
    renderWithProviders(<AccountSettingsPage />);

    await waitFor(() => {
      expect(
        screen.getByTestId("sign_up_organizer_button"),
      ).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/organizer name/i)).toBeInTheDocument();
  });

  it("signs up as an organizer and calls the backend", async () => {
    mockState.isAuthenticated = true;
    renderWithProviders(<AccountSettingsPage />);

    await waitFor(() => {
      expect(
        screen.getByTestId("sign_up_organizer_button"),
      ).toBeInTheDocument();
    });

    await userEvent.type(
      screen.getByLabelText(/organizer name/i),
      "Amman Youth Hub",
    );
    await userEvent.click(screen.getByTestId("sign_up_organizer_button"));

    await waitFor(() => {
      expect(mockCalls.signUpAsOrganizer).toContain("Amman Youth Hub");
    });
  });

  it("shows the active organizer state after signing up", async () => {
    mockState.isAuthenticated = true;
    mockState.isOrganizer = true;
    mockState.organizerProfile = {
      id: "aaaaa-aa" as unknown as Organizer["id"],
      name: "Amman Youth Hub",
      createdAt: 1792238400000000000n,
    };
    renderWithProviders(<AccountSettingsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("organizer_active_state")).toBeInTheDocument();
    });
    expect(
      screen.getByText(/signed up as amman youth hub/i),
    ).toBeInTheDocument();
  });

  it("deletes the account only when DELETE is confirmed", async () => {
    mockState.isAuthenticated = true;
    renderWithProviders(<AccountSettingsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("settings_delete_button")).toBeInTheDocument();
    });
    await userEvent.click(screen.getByTestId("settings_delete_button"));

    const confirmButton = screen.getByTestId("delete_confirm_button");
    expect(confirmButton).toBeDisabled();

    await userEvent.type(
      screen.getByLabelText(/type delete to confirm/i),
      "DELETE",
    );
    expect(confirmButton).toBeEnabled();
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockCalls.deleteAccount).toContain("DELETE");
    });
  });
});
