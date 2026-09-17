import type { OpportunityId } from "@/backend";
import { SignInPrompt } from "@/components/SignInPrompt";
import { Button } from "@/components/ui/button";
import { useSaveOpportunity, useUnsaveOpportunity } from "@/hooks/useQueries";
import { useSaved } from "@/hooks/useSaved";
import { cn } from "@/lib/utils";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SaveButtonProps {
  id: OpportunityId;
  name: string;
  variant?: "icon" | "full";
  className?: string;
}

/**
 * Shared save control. Reflects saved state consistently across cards, detail
 * pages, and the Saved page. Signed-out users get a clean sign-in-to-save
 * prompt instead of a broken redirect; saving is gated behind sign-in.
 */
export function SaveButton({
  id,
  name,
  variant = "icon",
  className,
}: SaveButtonProps) {
  const { isSaved, isAuthenticated } = useSaved();
  const saveMutation = useSaveOpportunity();
  const unsaveMutation = useUnsaveOpportunity();
  const [promptOpen, setPromptOpen] = useState(false);
  const saved = isSaved(id);

  const handleClick = () => {
    if (!isAuthenticated) {
      setPromptOpen(true);
      return;
    }
    if (saved) {
      unsaveMutation.mutate(id, {
        onSuccess: () => toast.success(`Removed "${name}" from your shortlist`),
        onError: () =>
          toast.error(
            `Couldn't remove "${name}" from your shortlist. Please try again.`,
          ),
      });
    } else {
      saveMutation.mutate(id, {
        onSuccess: () => toast.success(`Saved "${name}" to your shortlist`),
        onError: () =>
          toast.error(`Couldn't save "${name}". Please try again.`),
      });
    }
  };

  if (variant === "full") {
    return (
      <>
        <Button
          type="button"
          onClick={handleClick}
          variant={saved ? "secondary" : "default"}
          className={className}
          data-ocid="save_button"
        >
          {saved ? (
            <BookmarkCheck className="size-4" />
          ) : (
            <Bookmark className="size-4" />
          )}
          {saved ? "Saved" : "Save"}
        </Button>
        <SignInPrompt
          open={promptOpen}
          onOpenChange={setPromptOpen}
          title="Sign in to save"
          description={`Sign in to save "${name}" to your shortlist and come back to it later.`}
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={
          saved ? `Remove ${name} from saved` : `Save ${name} to shortlist`
        }
        title={saved ? "Remove from saved" : "Save to shortlist"}
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-full border transition-colors",
          saved
            ? "border-accent/40 bg-accent/10 text-accent"
            : "border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-accent",
          className,
        )}
        data-ocid="save_button"
      >
        {saved ? (
          <BookmarkCheck className="size-[17px]" />
        ) : (
          <Bookmark className="size-[17px]" />
        )}
      </button>
      <SignInPrompt
        open={promptOpen}
        onOpenChange={setPromptOpen}
        title="Sign in to save"
        description={`Sign in to save "${name}" to your shortlist and come back to it later.`}
      />
    </>
  );
}
