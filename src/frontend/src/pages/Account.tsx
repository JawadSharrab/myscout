import { SignInPrompt } from "@/components/SignInPrompt";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount } from "@/hooks/useAccount";
import type { Category } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ChevronRight,
  LogIn,
  LogOut,
  Settings2,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function categoryLabel(cat: Category): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

export function AccountPage() {
  const { isAuthenticated, isInitializing, isLoggingIn, clear } =
    useInternetIdentity();
  const {
    interests,
    interestsLoading,
    openInterestsPicker,
    deleteAccount,
    isDeletingAccount,
  } = useAccount();

  const [promptOpen, setPromptOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleSignOut = () => {
    clear();
    toast.success("Signed out. See you soon!");
  };

  const openDeleteDialog = () => {
    setDeleteError(null);
    setConfirmation("");
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (confirmation.trim() !== "DELETE") return;
    deleteAccount(confirmation.trim());
    setDeleteOpen(false);
    setConfirmation("");
    setDeleteError(null);
  };

  if (!isAuthenticated) {
    return (
      <section className="mx-auto flex max-w-3xl flex-col items-center px-5 py-20 text-center md:py-28">
        <div className="grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-subtle">
          <User className="size-7" />
        </div>
        <p className="mt-8 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          MyScout · Account
        </p>
        <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Your account
        </h1>
        <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
          Sign in to manage your interests, keep your shortlist, and get
          personalized recommendations across Amman.
        </p>
        <Button
          type="button"
          onClick={() => setPromptOpen(true)}
          disabled={isInitializing || isLoggingIn}
          className="mt-8 rounded-full"
          data-ocid="account_sign_in_button"
        >
          <LogIn className="size-4" />
          {isLoggingIn ? "Opening sign-in…" : "Sign in to your account"}
        </Button>
        <SignInPrompt
          open={promptOpen}
          onOpenChange={setPromptOpen}
          title="Sign in to your account"
          description="Sign in to manage your interests, keep your shortlist, and get personalized recommendations."
        />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          MyScout · Account
        </p>
        <h1 className="font-display mt-2 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Your account
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
          Manage the categories you care about, sign out, or delete your
          account.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {/* Interests */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-subtle">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Your interests
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  These shape your personalized recommendations. Pick the
                  categories that matter to you.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openInterestsPicker}
              className="shrink-0 rounded-full"
              data-ocid="account_edit_interests_button"
            >
              <Settings2 className="size-4" />
              Edit
            </Button>
          </div>

          <div className="mt-5">
            {interestsLoading ? (
              <div className="flex flex-wrap gap-2">
                {Array.from(
                  { length: 4 },
                  (_, i) => `interest-skeleton-${i}`,
                ).map((id) => (
                  <Skeleton key={id} className="h-8 w-24 rounded-full" />
                ))}
              </div>
            ) : interests.length === 0 ? (
              <p
                className="text-sm text-muted-foreground"
                data-ocid="account_no_interests"
              >
                You haven't picked any interests yet. Add a few to get
                recommendations that fit you.
              </p>
            ) : (
              <div
                className="flex flex-wrap gap-2"
                data-ocid="account_interests_list"
              >
                {interests.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 text-sm font-semibold text-accent"
                    data-ocid={`account_interest.${cat}`}
                  >
                    <Sparkles className="size-3.5" />
                    {categoryLabel(cat)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sign out */}
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-subtle">
          <div className="flex items-start gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
              <LogOut className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Sign out
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                You'll stay signed in on this device until you sign out.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleSignOut}
            className="shrink-0 rounded-full"
            data-ocid="account_sign_out_button"
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>

        {/* Account settings */}
        <Link
          to="/account/settings"
          className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-subtle transition-colors hover:border-accent/40"
          data-ocid="account_settings_link"
        >
          <div className="flex items-start gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
              <Settings2 className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Account settings
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Sign up as an organizer or manage your account options.
              </p>
            </div>
          </div>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>

        {/* Delete account */}
        <div className="rounded-2xl border border-destructive/30 bg-card p-6 shadow-subtle">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
                <Trash2 className="size-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Delete account
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Permanently wipes your saved opportunities and interests. This
                  cannot be undone.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={openDeleteDialog}
              className="shrink-0 rounded-full text-destructive hover:text-destructive"
              data-ocid="account_delete_button"
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent data-ocid="delete_account_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently wipes your saved opportunities and interests.
              This cannot be undone. Type <strong>DELETE</strong> to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="Type DELETE to confirm"
            aria-label="Type DELETE to confirm"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-ocid="delete_confirmation_input"
          />
          {deleteError && (
            <p
              role="alert"
              className="text-sm font-medium text-destructive"
              data-ocid="delete_error_message"
            >
              {deleteError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setConfirmation("")}
              data-ocid="delete_cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={confirmation.trim() !== "DELETE" || isDeletingAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="delete_confirm_button"
            >
              <AlertTriangle className="size-4" />
              {isDeletingAccount ? "Deleting…" : "Delete account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
