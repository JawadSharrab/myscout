import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { LogIn } from "lucide-react";

interface SignInPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

/**
 * Clean sign-in-to-save prompt. Signed-out users who try to save see this
 * dialog with a working sign-in button — no broken redirect.
 */
export function SignInPrompt({
  open,
  onOpenChange,
  title = "Sign in to save",
  description = "Create a MyScout account to keep your shortlist across visits and come back to it later.",
}: SignInPromptProps) {
  const { login, isInitializing, isLoggingIn } = useInternetIdentity();
  const disabled = isInitializing || isLoggingIn;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-ocid="sign_in_prompt">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 pt-1">
          <Button
            type="button"
            onClick={() => login()}
            disabled={disabled}
            className="w-full"
            data-ocid="sign_in_button"
          >
            <LogIn className="size-4" />
            {isLoggingIn ? "Opening sign-in…" : "Sign in to save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
