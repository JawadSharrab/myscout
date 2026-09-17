import { InterestsPicker } from "@/components/InterestsPicker";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteAccount } from "@/hooks/useQueries";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, LogOut, Settings2, Trash2, User } from "lucide-react";
import { useState } from "react";

/**
 * Account menu shown in the header for signed-in users. Offers editing
 * interests, signing out, and deleting the account (with confirmation).
 */
export function AccountMenu() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteAccount();
  const isDeletingAccount = deleteMutation.isPending;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleSignOut = () => {
    clear();
  };

  const openDeleteDialog = () => {
    setDeleteError(null);
    setConfirmation("");
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (confirmation.trim() !== "DELETE") return;
    deleteMutation.mutate(confirmation.trim(), {
      onSuccess: () => {
        queryClient.clear();
        clear();
        setDeleteOpen(false);
        setConfirmation("");
        setDeleteError(null);
      },
      onError: (err) => {
        setDeleteError(
          err instanceof Error
            ? err.message
            : "Something went wrong while deleting your account. Please try again.",
        );
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            data-ocid="account_menu_button"
          >
            <User className="size-4" />
            Account
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setPickerOpen(true)}
            data-ocid="account_menu_edit_interests"
          >
            <Settings2 className="size-4" />
            Edit interests
          </DropdownMenuItem>
          <DropdownMenuItem asChild data-ocid="account_menu_settings">
            <Link to="/account/settings">
              <Settings2 className="size-4" />
              Account settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={handleSignOut}
            data-ocid="account_menu_sign_out"
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={openDeleteDialog}
            data-ocid="account_menu_delete_account"
          >
            <Trash2 className="size-4" />
            Delete account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <InterestsPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        mode="edit"
      />

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
    </>
  );
}
