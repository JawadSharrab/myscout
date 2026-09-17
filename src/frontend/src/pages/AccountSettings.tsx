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
import {
  useGetOrganizerProfile,
  useIsOrganizer,
  useSignUpAsOrganizer,
} from "@/hooks/useQueries";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  LogIn,
  Megaphone,
  Settings2,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AccountSettingsPage() {
  const { isAuthenticated, isInitializing, isLoggingIn } =
    useInternetIdentity();
  const { deleteAccount, isDeletingAccount } = useAccount();

  const { data: isOrganizer, isLoading: isOrganizerLoading } = useIsOrganizer();
  const { data: profile, isLoading: profileLoading } = useGetOrganizerProfile();
  const signUpMutation = useSignUpAsOrganizer();

  const [promptOpen, setPromptOpen] = useState(false);
  const [name, setName] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const organizerActive = isOrganizer === true;

  const handleSignUp = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    signUpMutation.mutate(trimmed, {
      onSuccess: () => {
        setName("");
        toast.success("You're now an organizer. Welcome aboard!");
      },
      onError: (err) => {
        toast.error(
          err instanceof Error
            ? err.message
            : "Something went wrong while signing up as an organizer.",
        );
      },
    });
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
          <Settings2 className="size-7" />
        </div>
        <p className="mt-8 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          MyScout · Settings
        </p>
        <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Account settings
        </h1>
        <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
          Sign in to manage your organizer profile and account options.
        </p>
        <Button
          type="button"
          onClick={() => setPromptOpen(true)}
          disabled={isInitializing || isLoggingIn}
          className="mt-8 rounded-full"
          data-ocid="settings_sign_in_button"
        >
          <LogIn className="size-4" />
          {isLoggingIn ? "Opening sign-in…" : "Sign in to your account"}
        </Button>
        <SignInPrompt
          open={promptOpen}
          onOpenChange={setPromptOpen}
          title="Sign in to your account"
          description="Sign in to manage your organizer profile and account options."
        />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <Link
        to="/account"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        data-ocid="settings_back_link"
      >
        <ArrowLeft className="size-4" />
        Back to account
      </Link>

      <header className="mt-4 mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          MyScout · Settings
        </p>
        <h1 className="font-display mt-2 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Account settings
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
          Manage your organizer profile and account options.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {/* Organizer */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-subtle">
          <div className="flex items-start gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
              <Megaphone className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Organizer profile
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Become an organizer to add events and share them with the
                MyScout community.
              </p>
            </div>
          </div>

          <div className="mt-5">
            {isOrganizerLoading || profileLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : organizerActive ? (
              <div
                className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3"
                data-ocid="organizer_active_state"
              >
                <BadgeCheck className="size-5 shrink-0 text-accent" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    You're an organizer
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.name
                      ? `Signed up as ${profile.name}.`
                      : "Your organizer profile is active."}
                  </p>
                </div>
              </div>
            ) : (
              <form
                className="flex flex-col gap-3 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignUp();
                }}
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your organizer name"
                  aria-label="Organizer name"
                  className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  data-ocid="organizer_name_input"
                />
                <Button
                  type="submit"
                  disabled={
                    name.trim().length === 0 || signUpMutation.isPending
                  }
                  className="rounded-full"
                  data-ocid="sign_up_organizer_button"
                >
                  <Megaphone className="size-4" />
                  {signUpMutation.isPending
                    ? "Signing up…"
                    : "Sign up as organizer"}
                </Button>
              </form>
            )}
          </div>
        </div>

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
                  Permanently wipes your saved opportunities, interests, and
                  organizer profile. This cannot be undone.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={openDeleteDialog}
              className="shrink-0 rounded-full text-destructive hover:text-destructive"
              data-ocid="settings_delete_button"
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
              This permanently wipes your saved opportunities, interests, and
              organizer profile. This cannot be undone. Type{" "}
              <strong>DELETE</strong> to confirm.
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
