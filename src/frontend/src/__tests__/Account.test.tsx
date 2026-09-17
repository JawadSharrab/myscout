import { AccountPage } from "@/pages/Account";
import { Category } from "@/types";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import {
  mockAuth,
  mockCalls,
  mockState,
  resetMockBackend,
} from "./mockBackend";
import { renderWithProviders } from "./renderWithProviders";

describe("AccountPage", () => {
  beforeEach(() => {
    resetMockBackend();
  });

  it("prompts sign-in when signed out", () => {
    renderWithProviders(<AccountPage />);
    expect(
      screen.getByRole("heading", { name: /your account/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in to your account/i }),
    ).toBeInTheDocument();
  });

  it("shows the user's interest tags when signed in", async () => {
    mockState.isAuthenticated = true;
    mockState.interests = [Category.academic, Category.debate];
    renderWithProviders(<AccountPage />);

    await waitFor(() => {
      expect(screen.getByTestId("account_interests_list")).toBeInTheDocument();
    });
    expect(screen.getByText("Academic")).toBeInTheDocument();
    expect(screen.getByText("Debate")).toBeInTheDocument();
  });

  it("signs out via the sign-out button", async () => {
    mockState.isAuthenticated = true;
    renderWithProviders(<AccountPage />);

    await waitFor(() => {
      expect(screen.getByTestId("account_sign_out_button")).toBeInTheDocument();
    });
    await userEvent.click(screen.getByTestId("account_sign_out_button"));

    expect(mockAuth.clear).toHaveBeenCalled();
  });

  it("deletes the account only when DELETE is confirmed", async () => {
    mockState.isAuthenticated = true;
    renderWithProviders(<AccountPage />);

    await waitFor(() => {
      expect(screen.getByTestId("account_delete_button")).toBeInTheDocument();
    });
    await userEvent.click(screen.getByTestId("account_delete_button"));

    const _dialog = screen.getByTestId("delete_account_dialog");
    const confirmButton = screen.getByTestId("delete_confirm_button");
    // Confirm is disabled until the user types DELETE.
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
