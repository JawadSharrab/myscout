import { AccountMenu } from "@/components/AccountMenu";
import { InterestsPicker } from "@/components/InterestsPicker";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/hooks/useAccount";
import { useIsOrganizer } from "@/hooks/useQueries";
import { useSaved } from "@/hooks/useSaved";
import { cn } from "@/lib/utils";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import {
  Bookmark,
  Compass,
  LayoutGrid,
  LogIn,
  MapPin,
  Megaphone,
  Menu,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/", label: "Discover", icon: LayoutGrid, ocid: "nav_discover" },
  { to: "/map", label: "Map", icon: MapPin, ocid: "nav_map" },
  { to: "/saved", label: "Saved", icon: Bookmark, ocid: "nav_saved" },
  { to: "/account", label: "Account", icon: User, ocid: "nav_account" },
];

const organizerNavItem = {
  to: "/create-event",
  label: "Create event",
  icon: Megaphone,
  ocid: "nav_create_event",
} as const;

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5" data-ocid="brand_link">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Compass className="size-5" />
      </span>
      <span className="leading-none">
        <strong className="block font-display text-[17px] font-bold tracking-tight text-foreground">
          MyScout
        </strong>
        <span className="text-[9px] font-semibold tracking-[0.17em] text-muted-foreground uppercase">
          Find something worth doing
        </span>
      </span>
    </Link>
  );
}

function AuthButton() {
  const { login, isAuthenticated, isInitializing, isLoggingIn } =
    useInternetIdentity();
  const disabled = isInitializing || isLoggingIn;

  if (isAuthenticated) {
    return <AccountMenu />;
  }

  return (
    <Button
      type="button"
      size="sm"
      onClick={() => login()}
      disabled={disabled}
      className="rounded-full"
      data-ocid="sign_in_button"
    >
      <LogIn className="size-4" />
      {isLoggingIn ? "Signing in…" : "Sign in"}
    </Button>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { savedCount } = useSaved();
  const { showInterestsPicker, closeInterestsPicker } = useAccount();
  const { data: isOrganizer = false } = useIsOrganizer();

  const visibleNavItems = isOrganizer
    ? [...navItems, organizerNavItem]
    : navItems;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <InterestsPicker
        open={showInterestsPicker}
        onOpenChange={closeInterestsPicker}
        mode="onboarding"
      />
      <header className="sticky top-0 z-40 border-b border-border bg-card shadow-subtle">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
          <Brand />

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Primary"
          >
            {visibleNavItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-muted text-foreground" }}
                data-ocid={item.ocid}
              >
                <item.icon className="size-4" />
                {item.label}
                {item.to === "/saved" && savedCount > 0 ? (
                  <span className="grid min-w-5 place-items-center rounded-full bg-accent/15 px-1.5 text-xs font-bold text-accent">
                    {savedCount}
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <AuthButton />
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="grid size-10 place-items-center rounded-full border border-border text-foreground md:hidden"
            data-ocid="mobile_menu_button"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-border bg-card px-5 py-4 md:hidden">
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                  activeProps={{ className: "bg-muted" }}
                  data-ocid={item.ocid}
                >
                  <item.icon className="size-4 text-muted-foreground" />
                  {item.label}
                  {item.to === "/saved" && savedCount > 0 ? (
                    <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-accent/15 px-1.5 text-xs font-bold text-accent">
                      {savedCount}
                    </span>
                  ) : null}
                </Link>
              ))}
              <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-3">
                <ThemeToggle />
                <AuthButton />
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <main className="flex-1 bg-background">{children}</main>

      <footer className="border-t border-border bg-muted/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-8 text-center md:flex-row md:px-8 md:text-left">
          <div>
            <p className="font-display text-sm font-bold text-foreground">
              MyScout
            </p>
            <p className="text-xs text-muted-foreground">
              Find something worth doing in Amman.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.hostname : "",
              )}`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline-offset-2 hover:underline"
              data-ocid="footer_link"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
