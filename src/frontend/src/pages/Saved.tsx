import { SignInPrompt } from "@/components/SignInPrompt";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetSavedOpportunities,
  useUnsaveOpportunity,
} from "@/hooks/useQueries";
import { useSaved } from "@/hooks/useSaved";
import { cn } from "@/lib/utils";
import type { Opportunity } from "@/types";
import { Category } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  MapPin,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function categoryLabel(cat: Category): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

function categoryBadgeClass(cat: Category): string {
  switch (cat) {
    case Category.scholarship:
    case Category.academic:
    case Category.debate:
      return "bg-accent/15 text-accent";
    case Category.creative:
    case Category.arts:
    case Category.design:
    case Category.culture:
      return "bg-primary/10 text-primary";
    case Category.athletics:
    case Category.health:
    case Category.environment:
      return "bg-success/15 text-success";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp / 1_000_000n));
  if (Number.isNaN(date.getTime())) return "Date TBA";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SavedCard({
  opportunity,
  index,
}: {
  opportunity: Opportunity;
  index: number;
}) {
  const unsaveMutation = useUnsaveOpportunity();

  const handleRemove = () => {
    unsaveMutation.mutate(opportunity.id, {
      onSuccess: () =>
        toast.success(`Removed "${opportunity.title}" from your shortlist`),
      onError: () =>
        toast.error(
          `Couldn't remove "${opportunity.title}". Please try again.`,
        ),
    });
  };

  return (
    <article
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-subtle transition-shadow hover:shadow-md sm:flex-row sm:items-center"
      data-ocid={`saved_item.${index}`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
              categoryBadgeClass(opportunity.category),
            )}
          >
            {categoryLabel(opportunity.category)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <CalendarDays className="size-3.5" />
            {formatDate(opportunity.date)}
          </span>
        </div>

        <Link
          to="/opportunity/$id"
          params={{ id: opportunity.id.toString() }}
          className="font-display text-lg font-bold leading-snug text-foreground transition-colors hover:text-primary"
          data-ocid={`saved_open_link.${index}`}
        >
          {opportunity.title}
        </Link>

        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4" />
            {opportunity.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookmarkCheck className="size-4" />
            {opportunity.organizer}
          </span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          asChild
          className="rounded-full"
          data-ocid={`saved_open_button.${index}`}
        >
          <Link
            to="/opportunity/$id"
            params={{ id: opportunity.id.toString() }}
          >
            View
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={unsaveMutation.isPending}
          className="rounded-full text-muted-foreground hover:text-destructive"
          data-ocid={`saved_remove_button.${index}`}
        >
          <Trash2 className="size-4" />
          Remove
        </Button>
      </div>
    </article>
  );
}

function SavedSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }, (_, i) => `saved-skeleton-${i}`).map((id) => (
        <div
          key={id}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center"
        >
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex shrink-0 gap-2">
            <Skeleton className="h-9 w-20 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SavedPage() {
  const { isAuthenticated } = useInternetIdentity();
  const { savedCount } = useSaved();
  const { data: saved = [], isLoading } = useGetSavedOpportunities();
  const [promptOpen, setPromptOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <section className="mx-auto flex max-w-3xl flex-col items-center px-5 py-20 text-center md:py-28">
        <div className="grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-subtle">
          <Bookmark className="size-7" />
        </div>
        <p className="mt-8 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          MyScout · Shortlist
        </p>
        <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Your saved opportunities
        </h1>
        <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
          Sign in to save opportunities you like and keep them together so you
          can come back to them later.
        </p>
        <Button
          type="button"
          onClick={() => setPromptOpen(true)}
          className="mt-8 rounded-full"
          data-ocid="saved_sign_in_button"
        >
          <Sparkles className="size-4" />
          Sign in to view your shortlist
        </Button>
        <SignInPrompt
          open={promptOpen}
          onOpenChange={setPromptOpen}
          title="Sign in to see your shortlist"
          description="Sign in to view the opportunities you've saved and come back to them later."
        />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          MyScout · Shortlist
        </p>
        <h1 className="font-display mt-2 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Your saved opportunities
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
          {savedCount > 0
            ? `You've shortlisted ${savedCount} ${
                savedCount === 1 ? "opportunity" : "opportunities"
              }. Open one to see the full details, or remove it when you're done.`
            : "Everything you bookmark lands here, kept together so you can come back to it later."}
        </p>
      </header>

      {isLoading ? (
        <SavedSkeleton />
      ) : saved.length === 0 ? (
        <div
          className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center"
          data-ocid="saved_empty_state"
        >
          <div className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
            <Bookmark className="size-6" />
          </div>
          <h2 className="font-display mt-5 text-2xl font-bold text-foreground">
            Nothing saved yet
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            When you find an opportunity worth doing, tap the bookmark to save
            it here for later.
          </p>
          <Button
            type="button"
            asChild
            className="mt-6 rounded-full"
            data-ocid="saved_browse_button"
          >
            <Link to="/">
              Browse opportunities
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {saved.map((opportunity, index) => (
            <SavedCard
              key={opportunity.id.toString()}
              opportunity={opportunity}
              index={index}
            />
          ))}
        </div>
      )}
    </section>
  );
}
