import { SaveButton } from "@/components/SaveButton";
import { useMapSelection } from "@/hooks/useMapSelection";
import { useGetCatalog } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import type { FactorRatings, Opportunity, OpportunityId } from "@/types";
import { RecommendationMode, Status } from "@/types";
import { Link } from "@tanstack/react-router";
import {
  CalendarClock,
  Compass,
  MapPin,
  Navigation,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

const statusOptions: Array<{ value: Status | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: Status.open, label: "Open" },
  { value: Status.closingSoon, label: "Closing soon" },
  { value: Status.closed, label: "Closed" },
];

const recommendationModes: Array<{
  value: RecommendationMode;
  label: string;
}> = [
  { value: RecommendationMode.bestValue, label: "Best value" },
  { value: RecommendationMode.highestRated, label: "Highest rated" },
  { value: RecommendationMode.closingSoon, label: "Closing soon" },
  { value: RecommendationMode.university, label: "University value" },
  { value: RecommendationMode.skills, label: "Skill building" },
];

const statusStyle: Record<
  Status,
  { label: string; dot: string; pin: string; badge: string }
> = {
  [Status.open]: {
    label: "Open",
    dot: "bg-accent",
    pin: "text-accent",
    badge: "bg-accent/10 text-accent",
  },
  [Status.closingSoon]: {
    label: "Closing soon",
    dot: "bg-chart-4",
    pin: "text-chart-4",
    badge: "bg-chart-4/10 text-chart-4",
  },
  [Status.closed]: {
    label: "Closed",
    dot: "bg-muted-foreground/60",
    pin: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground",
  },
};

// Weighted overall score (0-5) from the 10 factor ratings. Weights match the
// backend's weighted scoring model in catalog.mo: Uni Application Value 20%,
// Skill Development 15%, Worth Your Time 15%, Recognition 12%, Leadership 10%,
// Networking 8%, and 5% each for Difficulty, Time Commitment, Price/Value, and
// Relevance.
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

function getScoreColor(score: number): string {
  if (score >= 4.2) return "border-accent/60 text-accent";
  if (score >= 3.6) return "border-chart-4/60 text-chart-4";
  return "border-muted-foreground/40 text-muted-foreground";
}

function formatDeadline(ts: bigint): string {
  const date = new Date(Number(ts / 1_000_000n));
  if (Number.isNaN(date.getTime())) return "Date TBA";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function orderOpportunities(
  list: Opportunity[],
  mode: RecommendationMode | null,
): Opportunity[] {
  if (!mode) return list;
  const sorted = [...list];
  switch (mode) {
    case RecommendationMode.closingSoon:
      return sorted.sort((a, b) => Number(a.deadline) - Number(b.deadline));
    case RecommendationMode.university:
      return sorted.sort(
        (a, b) =>
          Number(b.factorRatings.uniApplicationValue) -
          Number(a.factorRatings.uniApplicationValue),
      );
    case RecommendationMode.skills:
      return sorted.sort(
        (a, b) =>
          Number(b.factorRatings.skillDevelopment) -
          Number(a.factorRatings.skillDevelopment),
      );
    case RecommendationMode.bestValue:
      return sorted.sort(
        (a, b) =>
          Number(b.factorRatings.priceValue) -
          Number(a.factorRatings.priceValue),
      );
    default:
      return sorted.sort((a, b) => getOverallScore(b) - getOverallScore(a));
  }
}

/** Stylized SVG base map of Amman's hills, roads, and districts. */
function AmmanMap() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="map-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.96 0.02 80)" />
          <stop offset="100%" stopColor="oklch(0.9 0.025 78)" />
        </linearGradient>
        <linearGradient id="hill-1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.88 0.03 90)" />
          <stop offset="100%" stopColor="oklch(0.82 0.03 85)" />
        </linearGradient>
        <linearGradient id="hill-2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.86 0.03 95)" />
          <stop offset="100%" stopColor="oklch(0.8 0.03 88)" />
        </linearGradient>
      </defs>

      <rect width="100" height="100" fill="url(#map-bg)" />

      {/* Hill contours */}
      <path
        d="M-5 78 C 12 60, 22 66, 34 58 C 46 50, 58 56, 72 48 C 84 41, 96 46, 108 40 L 108 108 L -5 108 Z"
        fill="url(#hill-1)"
        opacity="0.7"
      />
      <path
        d="M-5 88 C 16 74, 30 80, 44 72 C 58 64, 70 70, 84 62 C 94 56, 102 60, 108 56 L 108 108 L -5 108 Z"
        fill="url(#hill-2)"
        opacity="0.6"
      />
      <path
        d="M-5 62 C 14 52, 28 58, 42 50 C 56 42, 66 48, 80 40 C 90 34, 100 38, 108 32 L 108 40 L -5 48 Z"
        fill="url(#hill-1)"
        opacity="0.5"
      />

      {/* Roads */}
      <path
        d="M-5 55 C 20 50, 40 52, 60 44 C 78 37, 92 40, 108 34"
        fill="none"
        stroke="oklch(0.99 0.012 80)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M18 108 C 24 82, 30 70, 44 58 C 58 46, 70 44, 84 34"
        fill="none"
        stroke="oklch(0.99 0.012 80)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M-5 74 C 24 70, 46 72, 66 64 C 84 57, 96 60, 108 54"
        fill="none"
        stroke="oklch(0.99 0.012 80)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />

      {/* District labels */}
      <text
        x="26"
        y="40"
        fill="oklch(0.55 0.04 70)"
        fontSize="3.4"
        fontWeight="700"
        fontFamily="var(--font-display)"
        letterSpacing="0.08"
      >
        JABAL AMMAN
      </text>
      <text
        x="62"
        y="30"
        fill="oklch(0.55 0.04 70)"
        fontSize="3"
        fontWeight="700"
        fontFamily="var(--font-display)"
        letterSpacing="0.08"
      >
        ABDALI
      </text>
      <text
        x="20"
        y="66"
        fill="oklch(0.55 0.04 70)"
        fontSize="3"
        fontWeight="700"
        fontFamily="var(--font-display)"
        letterSpacing="0.08"
      >
        WEIBDEH
      </text>
      <text
        x="70"
        y="70"
        fill="oklch(0.55 0.04 70)"
        fontSize="3"
        fontWeight="700"
        fontFamily="var(--font-display)"
        letterSpacing="0.08"
      >
        SWEIFIEH
      </text>
      <text
        x="40"
        y="88"
        fill="oklch(0.55 0.04 70)"
        fontSize="3"
        fontWeight="700"
        fontFamily="var(--font-display)"
        letterSpacing="0.08"
      >
        DOWNTOWN
      </text>
    </svg>
  );
}

export function MapPage() {
  const { data: catalog = [], isLoading } = useGetCatalog();
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [mode, setMode] = useState<RecommendationMode | null>(
    RecommendationMode.bestValue,
  );
  const [hoveredId, setHoveredId] = useState<OpportunityId | null>(null);

  const filtered = useMemo(() => {
    const statusFiltered =
      statusFilter === "all"
        ? catalog
        : catalog.filter((o) => o.status === statusFilter);
    return orderOpportunities(statusFiltered, mode);
  }, [catalog, statusFilter, mode]);

  const { selectedId, select, reordered, registerCardRef } =
    useMapSelection(filtered);

  const activeId = selectedId ?? hoveredId;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
      {/* Page header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            Explore Amman
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Find something worth doing.
          </h1>
          <p className="mt-2 max-w-xl text-base leading-7 text-muted-foreground">
            Every opportunity plotted across Amman&apos;s hills. Hover a pin or
            a card to see its match, and filter by status or how you want to
            explore.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-subtle">
          <MapPin className="size-4 text-accent" />
          <span className="font-semibold text-foreground">
            {reordered.length}
          </span>
          {reordered.length === 1 ? "opportunity" : "opportunities"} on the map
        </div>
      </header>

      {/* Control bar */}
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-subtle md:flex-row md:items-center md:justify-between">
        <fieldset className="flex flex-wrap items-center gap-1.5">
          <legend className="sr-only">Filter by status</legend>
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatusFilter(option.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
                statusFilter === option.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              data-ocid={`map_status_filter_${option.value}`}
            >
              {option.value !== "all" ? (
                <span
                  className={cn(
                    "size-2 rounded-full",
                    statusStyle[option.value].dot,
                  )}
                />
              ) : null}
              {option.label}
            </button>
          ))}
        </fieldset>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="size-4 text-accent" />
          <span className="font-semibold">Sort by</span>
          <select
            value={mode ?? ""}
            onChange={(e) =>
              setMode(
                e.target.value ? (e.target.value as RecommendationMode) : null,
              )
            }
            className="h-9 rounded-full border border-input bg-background px-3 text-sm font-semibold text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            data-ocid="map_mode_select"
          >
            {recommendationModes.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Map + list */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        {/* Map panel */}
        <section
          className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-elevated"
          aria-label="Map of Amman opportunities"
          data-ocid="map_panel"
        >
          <div className="relative aspect-[4/3] w-full sm:aspect-[16/11] lg:aspect-auto lg:h-[640px]">
            <AmmanMap />

            {/* Markers */}
            {reordered.map((opportunity, index) => {
              const x = Math.min(96, Math.max(4, opportunity.marker.x));
              const y = Math.min(92, Math.max(8, opportunity.marker.y));
              const isActive = activeId === opportunity.id;
              const style = statusStyle[opportunity.status];
              return (
                <button
                  key={opportunity.id.toString()}
                  type="button"
                  onClick={() => select(opportunity.id)}
                  onMouseEnter={() => setHoveredId(opportunity.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(opportunity.id)}
                  onBlur={() => setHoveredId(null)}
                  aria-label={`${opportunity.title} — ${style.label}`}
                  aria-pressed={isActive}
                  className="group absolute -translate-x-1/2 -translate-y-full"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  data-ocid={`map_marker.${index}`}
                >
                  <span
                    className={cn(
                      "relative block transition-transform duration-200 group-hover:scale-110",
                      isActive && "scale-110",
                    )}
                  >
                    {isActive ? (
                      <span
                        className={cn(
                          "absolute -inset-2 rounded-full opacity-40 animate-marker-pulse",
                          style.dot,
                        )}
                      />
                    ) : null}
                    <MapPin
                      className={cn(
                        "size-7 drop-shadow-md transition-colors",
                        style.pin,
                        isActive && "scale-110",
                      )}
                      fill="currentColor"
                      strokeWidth={1.5}
                    />
                  </span>
                  {isActive ? (
                    <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 w-max max-w-[180px] -translate-x-1/2 rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs font-semibold text-popover-foreground shadow-elevated">
                      {opportunity.title}
                    </span>
                  ) : null}
                </button>
              );
            })}

            {/* Legend */}
            <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card/90 px-3 py-2 text-xs font-semibold text-muted-foreground shadow-subtle backdrop-blur">
              {statusOptions
                .filter((o) => o.value !== "all")
                .map((o) => (
                  <span
                    key={o.value}
                    className="inline-flex items-center gap-1.5"
                  >
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        statusStyle[o.value].dot,
                      )}
                    />
                    {o.label}
                  </span>
                ))}
            </div>
          </div>
        </section>

        {/* List panel */}
        <section
          className="flex min-h-0 flex-col rounded-3xl border border-border bg-card shadow-subtle"
          aria-label="Opportunity list"
          data-ocid="map_list"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-lg font-bold text-foreground">
              Opportunities
            </h2>
            <span className="text-sm text-muted-foreground">
              {reordered.length} shown
            </span>
          </div>

          <div className="max-h-[560px] flex-1 space-y-3 overflow-y-auto p-4 lg:max-h-[640px]">
            {isLoading ? (
              Array.from({ length: 5 }, (_, i) => `skeleton-${i}`).map((id) => (
                <div
                  key={id}
                  className="h-28 animate-pulse rounded-2xl bg-muted"
                  data-ocid="map_loading_state"
                />
              ))
            ) : reordered.length === 0 ? (
              <div
                className="flex flex-col items-center gap-3 px-6 py-16 text-center"
                data-ocid="map_empty_state"
              >
                <div className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
                  <Navigation className="size-6" />
                </div>
                <p className="font-display text-lg font-bold text-foreground">
                  Nothing here yet
                </p>
                <p className="max-w-xs text-sm leading-6 text-muted-foreground">
                  No opportunities match this filter. Try switching the status
                  or sort mode to see more of Amman.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setMode(RecommendationMode.bestValue);
                  }}
                  className="mt-1 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
                  data-ocid="map_reset_button"
                >
                  <Compass className="size-4" />
                  Reset filters
                </button>
              </div>
            ) : (
              reordered.map((opportunity, index) => {
                const isActive = activeId === opportunity.id;
                const score = getOverallScore(opportunity);
                const style = statusStyle[opportunity.status];
                return (
                  <article
                    key={opportunity.id.toString()}
                    ref={(el) => registerCardRef(opportunity.id, el)}
                    onMouseEnter={() => setHoveredId(opportunity.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(opportunity.id)}
                    onBlur={() => setHoveredId(null)}
                    className={cn(
                      "group rounded-2xl border p-4 transition-all",
                      isActive
                        ? "border-accent/50 bg-accent/5 shadow-elevated"
                        : "border-border bg-card hover:border-accent/30 hover:shadow-subtle",
                    )}
                    data-ocid={`map_card.${index}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold",
                              style.badge,
                            )}
                          >
                            <span
                              className={cn("size-1.5 rounded-full", style.dot)}
                            />
                            {style.label}
                          </span>
                          <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                            {opportunity.category}
                          </span>
                        </div>
                        <h3 className="font-display mt-2 truncate text-base font-bold text-foreground">
                          <Link
                            to="/opportunity/$id"
                            params={{ id: opportunity.id.toString() }}
                            className="hover:text-accent"
                            data-ocid={`map_card_link.${index}`}
                          >
                            {opportunity.title}
                          </Link>
                        </h3>
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          {opportunity.organizer}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={cn(
                            "grid size-11 place-items-center rounded-full border-2 font-display text-sm font-bold",
                            getScoreColor(score),
                            isActive ? "border-accent/50" : "border-border",
                          )}
                          title={`Overall score ${score.toFixed(1)} / 5`}
                        >
                          {score.toFixed(1)}
                        </span>
                        <SaveButton
                          id={opportunity.id}
                          name={opportunity.title}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarClock className="size-3.5 text-accent" />
                        Closes {formatDeadline(opportunity.deadline)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-accent" />
                        {opportunity.location}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                      <span className="text-xs text-muted-foreground">
                        {opportunity.cost}
                      </span>
                      <button
                        type="button"
                        onClick={() => select(opportunity.id)}
                        aria-pressed={isActive}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-foreground hover:bg-accent/15 hover:text-accent",
                        )}
                        data-ocid={`map_locate_button.${index}`}
                      >
                        <MapPin className="size-3.5" />
                        {isActive ? "Located" : "Locate on map"}
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
