import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAccount } from "@/hooks/useAccount";
import { useGetCategories, useSetInterests } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import { Check, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

function categoryLabel(cat: Category): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

interface InterestsPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "onboarding" shows a Skip option; "edit" is reached from the account menu. */
  mode?: "onboarding" | "edit";
}

/**
 * Multi-select interests picker built from the existing opportunity
 * categories. Used on first sign-in (skippable) and from the account menu.
 * Saves via setInterests on the backend.
 */
export function InterestsPicker({
  open,
  onOpenChange,
  mode = "onboarding",
}: InterestsPickerProps) {
  const { data: categories = [] } = useGetCategories();
  const { interests } = useAccount();
  const setInterests = useSetInterests();

  const [selected, setSelected] = useState<Category[]>([]);

  // Initialize the selection from the caller's current interests each time the
  // dialog opens (one-time initialization when editing).
  useEffect(() => {
    if (open) {
      setSelected(interests);
    }
  }, [open, interests]);

  const toggle = (cat: Category) => {
    setSelected((current) =>
      current.includes(cat)
        ? current.filter((c) => c !== cat)
        : [...current, cat],
    );
  };

  const handleSave = () => {
    setInterests.mutate(selected, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" data-ocid="interests_picker">
        <DialogHeader>
          <DialogTitle>
            {mode === "onboarding"
              ? "What are you into?"
              : "Edit your interests"}
          </DialogTitle>
          <DialogDescription>
            {mode === "onboarding"
              ? "Pick a few categories to personalize your recommendations. You can skip this and choose later from your account menu."
              : "Update the categories you care about to refine your recommendations."}
          </DialogDescription>
        </DialogHeader>

        <div
          className="grid max-h-[50vh] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3"
          data-ocid="interests_list"
        >
          {categories.map((cat) => {
            const active = selected.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggle(cat)}
                aria-pressed={active}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-colors",
                  active
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground",
                )}
                data-ocid={`interest_option.${cat}`}
              >
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-md border transition-colors",
                    active
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-background",
                  )}
                >
                  {active ? <Check className="size-3.5" /> : null}
                </span>
                {categoryLabel(cat)}
              </button>
            );
          })}
        </div>

        <DialogFooter className="gap-2">
          {mode === "onboarding" ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              data-ocid="interests_skip_button"
            >
              Skip for now
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={handleSave}
            disabled={setInterests.isPending}
            data-ocid="interests_save_button"
          >
            <Sparkles className="size-4" />
            {setInterests.isPending ? "Saving…" : "Save interests"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
