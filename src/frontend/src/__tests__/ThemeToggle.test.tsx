import { ThemeToggle } from "@/components/ThemeToggle";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "next-themes";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "./renderWithProviders";

function renderToggle() {
  return renderWithProviders(
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

describe("ThemeToggle", () => {
  it("switches between light and dark mode", async () => {
    renderToggle();

    // Starts in light mode, so the toggle offers dark mode.
    const toggle = screen.getByRole("button", {
      name: /switch to dark mode/i,
    });
    expect(toggle).toBeInTheDocument();

    await userEvent.click(toggle);

    // After toggling, the button now offers light mode.
    expect(
      screen.getByRole("button", { name: /switch to light mode/i }),
    ).toBeInTheDocument();
  });
});
