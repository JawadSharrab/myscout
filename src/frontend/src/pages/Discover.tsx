import { HomeTabs } from "@/components/HomeTabs";
import { SaveButton } from "@/components/SaveButton";
import { SignInPrompt } from "@/components/SignInPrompt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount } from "@/hooks/useAccount";
import {
  useFilterOpportunities,
  useGetCatalog,
  useGetCategories,
  useGetSavedOpportunities,
  useRecommend,
  useRecommendByInterests,
  useSearchOpportunities,
} from "@/hooks/useQueries";
import { useSaved } from "@/hooks/useSaved";
import { cn } from "@/lib/utils";
import {
  type Category,
  CostFilter,
  type Opportunity,
  type OpportunityFilter,
  RecommendationMode,
  Status,
} from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  Briefcase,
  Brush,
  Clock,
  Code,
  Compass,
  Crown,
  Dumbbell,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  Landmark,
  Leaf,
  type LucideIcon,
  MessageSquare,
  Palette,
  PenTool,
  Rocket,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const RECOMMENDATION_MODES: Array<{
  value: RecommendationMode;
  label: string;
  hint: string;
}> = [
  {
    value: RecommendationMode.highestRated,
    label: "Highest rated",
    hint: "Best overall scores",
  },
  {
    value: RecommendationMode.closingSoon,
    label: "Closing soon",
    hint: "Deadlines nearest",
  },
  {
    value: RecommendationMode.university,
    label: "University value",
    hint: "Best for applications",
  },
  {
    value: RecommendationMode.bestValue,
    label: "Best value",
    hint: "Most for your money",
  },
  {
    value: RecommendationMode.skills,
    label: "Skills",
    hint: "Most skill growth",
  },
];

// Category → thumbnail color + icon. Colors cycle through the theme palette
// (sky accent, terracotta primary, sage/green chart tones, deep navy) so each
// category reads distinctly in the editorial card grid.
const CATEGORY_STYLES: Record<Category, { color: string; icon: LucideIcon }> = {
  scholarship: { color: "bg-accent/15 text-accent", icon: GraduationCap },
  internship: { color: "bg-primary/15 text-primary", icon: Briefcase },
  creative: { color: "bg-chart-4/15 text-chart-4", icon: Palette },
  arts: { color: "bg-chart-5/15 text-chart-5", icon: Brush },
  conference: { color: "bg-navy text-navy-foreground", icon: Users },
  community: { color: "bg-accent/15 text-accent", icon: HeartHandshake },
  culture: { color: "bg-primary/15 text-primary", icon: Landmark },
  athletics: { color: "bg-chart-4/15 text-chart-4", icon: Dumbbell },
  academic: { color: "bg-chart-5/15 text-chart-5", icon: BookOpen },
  debate: { color: "bg-navy text-navy-foreground", icon: MessageSquare },
  design: { color: "bg-accent/15 text-accent", icon: PenTool },
  leadership: { color: "bg-primary/15 text-primary", icon: Crown },
  competition: { color: "bg-chart-4/15 text-chart-4", icon: Trophy },
  business: { color: "bg-chart-5/15 text-chart-5", icon: TrendingUp },
  environment: { color: "bg-chart-2/15 text-chart-2", icon: Leaf },
  entrepreneurship: { color: "bg-navy text-navy-foreground", icon: Rocket },
  coding: { color: "bg-accent/15 text-accent", icon: Code },
  volunteering: { color: "bg-primary/15 text-primary", icon: HeartPulse },
  health: { color: "bg-chart-5/15 text-chart-5", icon: HeartPulse },
};

// Weighted overall score (0-5) from the 10 factor ratings. Weights match the
// MyScout reference: Uni Application Value 20%, Skill Development 15%, Worth
// Your Time 15%, Recognition 12%, Leadership 10%, Networking 8%, and 5% each
// for Difficulty, Time Commitment, Price/Value, and Relevance.
const SCORE_WEIGHTS: Record<keyof Opportunity["factorRatings"], number> = {
  uniApplicationValue: 0.2,
  skillDevelopment: 0.15,
  worthYourTime: 0.15,
  recognition: 0.12,
  leadership: 0.1,
  networking: 0.08,
  difficulty: 0.05,
  timeCommitment: 0.05,
  priceValue: 0.05,
  relevance: 0.05,
};

function getOverallScore(opportunity: Opportunity): number {
  const weighted = (
    Object.keys(SCORE_WEIGHTS) as Array<keyof Opportunity["factorRatings"]>
  ).reduce(
    (total, factor) =>
      total + Number(opportunity.factorRatings[factor]) * SCORE_WEIGHTS[factor],
    0,
  );
  return Math.round(weighted * 10) / 10;
}

function categoryLabel(cat: Category): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

function statusLabel(status: Status): string {
  if (status === Status.closingSoon) return "Closing soon";
  if (status === Status.open) return "Open";
  return "Closed";
}

function OpportunityCard({
  opportunity,
  index,
}: {
  opportunity: Opportunity;
  index: number;
}) {
  const score = getOverallScore(opportunity);
  const style = CATEGORY_STYLES[opportunity.category];
  const Icon = style.icon;

  return (
    <div className="relative h-full">
      <Link
        to="/opportunity/$id"
        params={{ id: opportunity.id.toString() }}
        className="group block h-full"
        data-ocid={`opportunity_card.${index}`}
      >
        <Card className="h-full overflow-hidden transition-smooth hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card">
          <div
            className={cn(
              "relative flex h-32 items-center justify-center",
              style.color,
            )}
          >
            <Icon className="size-10 opacity-80" />
            <Badge
              variant="secondary"
              className="absolute left-4 top-4 bg-card/90"
            >
              {categoryLabel(opportunity.category)}
            </Badge>
          </div>
          <CardContent className="flex flex-1 flex-col gap-2.5 pt-4">
            <CardTitle className="font-display text-lg leading-snug text-foreground group-hover:text-primary">
              {opportunity.title}
            </CardTitle>
            <p className="text-sm font-medium text-muted-foreground">
              {opportunity.organizer}
            </p>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {opportunity.description}
            </p>
            <div className="mt-auto grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border pt-3 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Star className="size-4 text-accent" />
                {score.toFixed(1)}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Wallet className="size-4 text-accent" />
                {opportunity.cost}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-4 text-accent" />
                {statusLabel(opportunity.status)}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
      <div className="absolute right-4 top-4 z-10">
        <SaveButton id={opportunity.id} name={opportunity.title} />
      </div>
    </div>
  );
}

// Featured Pick / spotlight card. Renders the highest-overall-scored
// opportunity from the catalog over the Amman arches illustration. The app has
// no user location, so the metric line deliberately omits any distance/closest
// value — the third metric is the cost (Free/Paid) instead.
function FeaturedPick() {
  const { data: catalog = [], isLoading } = useGetCatalog();

  if (isLoading || catalog.length === 0) return null;

  const featured = catalog.reduce((best, o) =>
    getOverallScore(o) > getOverallScore(best) ? o : best,
  );

  const score = getOverallScore(featured);
  const uniValue = featured.factorRatings.uniApplicationValue;
  const isFree = featured.cost.toLowerCase() === "free";

  return (
    <section className="mx-auto max-w-7xl px-5 md:px-8">
      <div
        className="relative flex min-h-[22rem] flex-col overflow-hidden rounded-[2rem] bg-card text-foreground shadow-elevated md:min-h-[26rem]"
        data-ocid="featured_pick"
      >
        {/* Illustration panel — the card's visual. The artwork's dominant ground
            is cream/off-white inside a thin black outer matte, so the card base
            matches that cream and the image is scaled up slightly to crop the
            matte out of view. No full-bleed scrim: the illustration reads
            clearly, with only a localized bottom gradient behind the copy. */}
        <img
          src="/assets/featured-pick-amman.png"
          alt="Illustration of Amman-style arches and domes in terracotta, cream, and dusty blue"
          className="absolute inset-0 size-full scale-[1.14] object-cover object-center"
        />

        {/* Localized bottom-only wash so the copy block stays legible without
            washing out the illustration above it. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-card via-card/85 to-transparent" />

        <div className="relative flex flex-1 flex-col justify-end p-8 md:max-w-2xl md:justify-center md:p-12">
          <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            Featured pick
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-primary/30 bg-card/70 px-3 py-1 text-xs font-semibold text-primary">
              Top signal
            </span>
            <span className="rounded-full border border-primary/30 bg-card/70 px-3 py-1 text-xs font-semibold text-primary">
              Uni value
            </span>
          </div>

          <h2 className="mt-5 max-w-2xl font-display text-3xl font-bold italic leading-tight text-foreground md:text-4xl">
            {featured.title}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {featured.organizer}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span>{score.toFixed(1)} / 5</span>
            <span className="text-border">·</span>
            <span>{uniValue.toFixed(1)} university application value</span>
            <span className="text-border">·</span>
            <span>{isFree ? "Free" : featured.cost}</span>
          </div>

          <Link
            to="/opportunity/$id"
            params={{ id: featured.id.toString() }}
            className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            data-ocid="featured_pick_button"
          >
            Explore the pick
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CardSkeleton() {
  return (
    <Card className="h-full overflow-hidden">
      <Skeleton className="h-32 w-full rounded-none" />
      <CardContent className="flex flex-col gap-2.5 pt-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="mt-auto grid grid-cols-2 gap-3 border-t border-border pt-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

function CardGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      data-ocid="loading_state"
    >
      {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((id) => (
        <CardSkeleton key={id} />
      ))}
    </div>
  );
}

function ResultsGrid({ results }: { results: Opportunity[] }) {
  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      data-ocid="opportunity_list"
    >
      {results.map((o, i) => (
        <OpportunityCard key={o.id.toString()} opportunity={o} index={i} />
      ))}
    </div>
  );
}

function ForYouTab() {
  const { isAuthenticated } = useInternetIdentity();
  const { interests, interestsLoading, openInterestsPicker } = useAccount();
  const { data: recommended = [], isLoading: recommendedLoading } =
    useRecommendByInterests();
  const [promptOpen, setPromptOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <Card
        className="mx-auto max-w-xl items-center gap-4 px-8 py-12 text-center"
        data-ocid="for_you_sign_in_state"
      >
        <span className="grid size-14 place-items-center rounded-2xl bg-accent/10 text-accent">
          <Sparkles className="size-7" />
        </span>
        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold text-foreground">
            Sign in for personalized picks
          </h2>
          <p className="text-sm text-muted-foreground">
            Tell us what you're into and we'll surface the opportunities across
            Amman that actually fit you.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setPromptOpen(true)}
          className="mt-1"
          data-ocid="for_you_sign_in_button"
        >
          <Sparkles className="size-4" />
          Sign in to personalize
        </Button>
        <SignInPrompt
          open={promptOpen}
          onOpenChange={setPromptOpen}
          title="Sign in to personalize"
          description="Create a MyScout account to get recommendations matched to your interests."
        />
      </Card>
    );
  }

  if (interestsLoading) {
    return <CardGridSkeleton />;
  }

  if (interests.length === 0) {
    return (
      <Card
        className="mx-auto max-w-xl items-center gap-4 px-8 py-12 text-center"
        data-ocid="for_you_no_interests_state"
      >
        <span className="grid size-14 place-items-center rounded-2xl bg-accent/10 text-accent">
          <Sparkles className="size-7" />
        </span>
        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold text-foreground">
            Pick your interests
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose a few categories and we'll re-rank and surface the
            opportunities that match what you care about.
          </p>
        </div>
        <Button
          type="button"
          onClick={openInterestsPicker}
          className="mt-1"
          data-ocid="for_you_choose_interests_button"
        >
          <Sparkles className="size-4" />
          Choose interests
        </Button>
      </Card>
    );
  }

  if (recommendedLoading) {
    return <CardGridSkeleton />;
  }

  if (recommended.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-20 text-center"
        data-ocid="for_you_empty_state"
      >
        <span className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <Sparkles className="size-7" />
        </span>
        <h3 className="mt-5 font-display text-xl font-bold text-foreground">
          Nothing matches your interests yet
        </h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Try the Explore tab to browse the full catalog, or adjust your
          interests from your account menu.
        </p>
        <Button
          type="button"
          onClick={openInterestsPicker}
          className="mt-6 rounded-full"
          data-ocid="for_you_empty_edit_interests_button"
        >
          Edit interests
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            For you
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Re-ranked to match your interests.
          </p>
        </div>
      </div>
      <ResultsGrid results={recommended} />
    </div>
  );
}

function SavedTab({ onBrowse }: { onBrowse: () => void }) {
  const { isAuthenticated } = useSaved();
  const { data: savedOpportunities = [], isLoading } =
    useGetSavedOpportunities();
  const [promptOpen, setPromptOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <Card
        className="mx-auto max-w-xl items-center gap-4 px-8 py-12 text-center"
        data-ocid="saved_tab_sign_in_state"
      >
        <span className="grid size-14 place-items-center rounded-2xl bg-accent/10 text-accent">
          <Bookmark className="size-7" />
        </span>
        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold text-foreground">
            Sign in to see your shortlist
          </h2>
          <p className="text-sm text-muted-foreground">
            Your saved opportunities live with your account. Sign in to keep
            your shortlist across visits.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setPromptOpen(true)}
          className="mt-1"
          data-ocid="saved_tab_sign_in_button"
        >
          <Bookmark className="size-4" />
          Sign in to save
        </Button>
        <SignInPrompt
          open={promptOpen}
          onOpenChange={setPromptOpen}
          title="Sign in to save"
          description="Create a MyScout account to keep your shortlist across visits and come back to it later."
        />
      </Card>
    );
  }

  if (isLoading) {
    return <CardGridSkeleton />;
  }

  if (savedOpportunities.length === 0) {
    return (
      <Card
        className="mx-auto max-w-xl items-center gap-4 px-8 py-12 text-center"
        data-ocid="saved_tab_empty_state"
      >
        <span className="grid size-14 place-items-center rounded-2xl bg-accent/10 text-accent">
          <Sparkles className="size-7" />
        </span>
        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold text-foreground">
            Nothing saved yet
          </h2>
          <p className="text-sm text-muted-foreground">
            Tap the bookmark on any opportunity to add it to your shortlist.
            Your saved picks will show up here.
          </p>
        </div>
        <Button
          type="button"
          onClick={onBrowse}
          className="mt-1"
          data-ocid="saved_tab_browse_button"
        >
          <Compass className="size-4" />
          Discover opportunities
        </Button>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Saved
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {savedOpportunities.length}{" "}
            {savedOpportunities.length === 1 ? "opportunity" : "opportunities"}{" "}
            saved to your shortlist.
          </p>
        </div>
      </div>
      <ResultsGrid results={savedOpportunities} />
    </div>
  );
}

function ExploreTab() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [cost, setCost] = useState<CostFilter | undefined>(undefined);
  const [status, setStatus] = useState<Status | undefined>(undefined);
  const [mode, setMode] = useState<RecommendationMode | undefined>(undefined);

  const { data: categories = [] } = useGetCategories();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const filter: OpportunityFilter | null =
    category || cost || status ? { category, cost, status } : null;

  const searchResults = useSearchOpportunities(debouncedQuery);
  const filterResults = useFilterOpportunities(filter);
  const recommendResults = useRecommend(mode ?? null);
  const catalog = useGetCatalog();

  const hasQuery = debouncedQuery.trim().length > 0;
  const hasFilter = filter !== null;
  const hasMode = mode !== undefined;

  const active = hasQuery
    ? searchResults
    : hasFilter
      ? filterResults
      : hasMode
        ? recommendResults
        : catalog;

  const results = active.data ?? [];
  const isLoading = active.isLoading;

  const hasActiveFilters = hasQuery || hasFilter || hasMode;

  const clearAll = () => {
    setQuery("");
    setCategory(undefined);
    setCost(undefined);
    setStatus(undefined);
    setMode(undefined);
  };

  const activeModeLabel =
    RECOMMENDATION_MODES.find((m) => m.value === mode)?.label ?? "relevance";

  return (
    <div>
      {/* Search */}
      <div className="flex max-w-xl items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm">
        <Search className="ml-2 size-5 shrink-0 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search opportunities, organizers, or keywords…"
          aria-label="Search opportunities"
          className="h-10 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          data-ocid="search_input"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            data-ocid="clear_search_button"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {/* Category pills */}
      <fieldset
        className="mt-5 flex flex-wrap gap-2 border-0 p-0"
        aria-label="Filter by category"
        data-ocid="category_filter"
      >
        <button
          type="button"
          onClick={() => setCategory(undefined)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
            !category
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
          data-ocid="category_pill.all"
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(category === cat ? undefined : cat)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              category === cat
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
            data-ocid={`category_pill.${cat}`}
          >
            {categoryLabel(cat)}
          </button>
        ))}
      </fieldset>

      {/* Filter + sort bar */}
      <div className="mt-6 rounded-2xl border border-border bg-card/60 p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Cost
            </span>
            <fieldset
              className="flex gap-1.5 border-0 p-0"
              aria-label="Filter by cost"
            >
              <button
                type="button"
                onClick={() => setCost(undefined)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                  !cost
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
                data-ocid="cost_pill.any"
              >
                Any
              </button>
              <button
                type="button"
                onClick={() =>
                  setCost(
                    cost === CostFilter.free ? undefined : CostFilter.free,
                  )
                }
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                  cost === CostFilter.free
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
                data-ocid="cost_pill.free"
              >
                Free
              </button>
              <button
                type="button"
                onClick={() =>
                  setCost(
                    cost === CostFilter.paid ? undefined : CostFilter.paid,
                  )
                }
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                  cost === CostFilter.paid
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
                data-ocid="cost_pill.paid"
              >
                Paid
              </button>
            </fieldset>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Status
            </span>
            <fieldset
              className="flex gap-1.5 border-0 p-0"
              aria-label="Filter by status"
            >
              <button
                type="button"
                onClick={() => setStatus(undefined)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                  !status
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
                data-ocid="status_pill.any"
              >
                Any
              </button>
              <button
                type="button"
                onClick={() =>
                  setStatus(status === Status.open ? undefined : Status.open)
                }
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                  status === Status.open
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
                data-ocid="status_pill.open"
              >
                Open
              </button>
              <button
                type="button"
                onClick={() =>
                  setStatus(
                    status === Status.closingSoon
                      ? undefined
                      : Status.closingSoon,
                  )
                }
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                  status === Status.closingSoon
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
                data-ocid="status_pill.closing_soon"
              >
                Closing soon
              </button>
              <button
                type="button"
                onClick={() =>
                  setStatus(
                    status === Status.closed ? undefined : Status.closed,
                  )
                }
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                  status === Status.closed
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
                data-ocid="status_pill.closed"
              >
                Closed
              </button>
            </fieldset>
          </div>
        </div>

        {/* Recommendation mode selector */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <span className="mr-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Sort by
          </span>
          {RECOMMENDATION_MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(mode === m.value ? undefined : m.value)}
              title={m.hint}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                mode === m.value
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground",
              )}
              data-ocid={`mode.${m.value}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="mt-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              {isLoading
                ? "Loading opportunities…"
                : `${results.length} opportunities`}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isLoading
                ? "Fetching the latest from Amman's hills."
                : hasQuery
                  ? "Matching your search."
                  : hasFilter
                    ? "Filtered to your criteria."
                    : hasMode
                      ? `Sorted by ${activeModeLabel.toLowerCase()}.`
                      : "Browse the full catalog across Amman."}
            </p>
          </div>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
              data-ocid="clear_filters_button"
            >
              <X className="size-4" />
              Clear filters
            </button>
          ) : null}
        </div>

        {isLoading ? (
          <CardGridSkeleton />
        ) : results.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-20 text-center"
            data-ocid="empty_state"
          >
            <span className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <Search className="size-7" />
            </span>
            <h3 className="mt-5 font-display text-xl font-bold text-foreground">
              Nothing matches those filters
            </h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Try removing a category, clearing the search, or resetting the
              filters to see more opportunities across Amman.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              data-ocid="empty_state_clear_button"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <ResultsGrid results={results} />
        )}
      </div>
    </div>
  );
}

export function DiscoverPage() {
  const [activeTab, setActiveTab] = useState("forYou");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="animate-fade-up">
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-accent uppercase">
              <Compass className="size-4" />
              MyScout · Amman
            </p>
            <h1 className="max-w-2xl font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Find something{" "}
              <span className="text-gradient-terracotta italic">
                worth doing.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
              Discover extracurricular opportunities across Amman's hills that
              actually fit you — browse, filter, and compare by what matters.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={() => setActiveTab("explore")}
                className="rounded-full px-6 py-2.5"
                data-ocid="hero_explore_button"
              >
                Browse opportunities
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="animate-fade-up overflow-hidden rounded-3xl shadow-elevated">
            <img
              src="/assets/generated/hero-amman.dim_1600x900.jpg"
              alt="Abstract illustration of Amman's arches and domes in warm limestone, terracotta, and sky-blue tones"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Featured pick spotlight */}
      <div className="py-8 md:py-10">
        <FeaturedPick />
      </div>

      {/* Tabbed content */}
      <section className="mx-auto max-w-7xl px-5 pb-8 md:px-8 md:pb-10">
        <HomeTabs
          value={activeTab}
          onValueChange={handleTabChange}
          forYou={<ForYouTab />}
          explore={<ExploreTab />}
          saved={<SavedTab onBrowse={() => setActiveTab("explore")} />}
        />
      </section>
    </div>
  );
}
