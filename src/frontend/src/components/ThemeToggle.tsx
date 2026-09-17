import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * Compact light/dark toggle for the header (desktop and mobile menu). Wired to
 * the next-themes ThemeProvider (attribute=class, enableSystem) so toggling
 * flips `html.dark` and drives every `.dark` token. The `.theme-transition`
 * utility cross-fades chrome surfaces instead of snapping.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="theme-transition rounded-full border-border bg-card shadow-subtle"
      data-ocid="theme_toggle"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
