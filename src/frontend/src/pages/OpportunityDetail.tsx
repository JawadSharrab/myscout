import { SaveButton } from "@/components/SaveButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetOpportunity, useGetRatingExplanation } from "@/hooks/useQueries";
import type {
  Category,
  FactorRatings,
  Opportunity,
  OpportunityId,
  Status,
  Timestamp,
} from "@/types";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ExternalLink,
  Hourglass,
  MapPin,
  Navigation,
  ShieldAlert,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";

const categoryLabels: Record<Category, string> = {
  scholarship: "Scholarship",
  internship: "Internship",
  creative: "Creative",
  arts: "Arts",
  conference: "Conference",
  community: "Community",
  culture: "Culture",
  athletics: "Athletics",
  academic: "Academic",
  debate: "Debate",
  design: "Design",
  leadership: "Leadership",
  competition: "Competition",
  business: "Business",
  environment: "Environment",
  entrepreneurship: "Entrepreneurship",
  coding: "Coding",
  volunteering: "Volunteering",
  health: "Health",
};

const statusLabels: Record<Status, { label: string; tone: string }> = {
  open: { label: "Open", tone: "bg-success/15 text-success" },
  closingSoon: {
    label: "Closing soon",
    tone: "bg-warning/15 text-warning",
  },
  closed: { label: "Closed", tone: "bg-destructive/15 text-destructive" },
};

const factorOrder: Array<keyof FactorRatings> = [
  "recognition",
  "skillDevelopment",
  "relevance",
  "worthYourTime",
  "leadership",
  "networking",
  "uniApplicationValue",
  "difficulty",
  "timeCommitment",
  "priceValue",
];

const factorLabels: Record<keyof FactorRatings, string> = {
  recognition: "Recognition",
  difficulty: "Difficulty",
  skillDevelopment: "Skill development",
  networking: "Networking",
  timeCommitment: "Time commitment",
  leadership: "Leadership",
  relevance: "Relevance",
  worthYourTime: "Worth your time",
  priceValue: "Price value",
  uniApplicationValue: "University value",
};

/** Weights sum to 1.0 and mirror the backend's weighted scoring model. */
const scoreWeights: Record<keyof FactorRatings, number> = {
  recognition: 0.12,
  difficulty: 0.05,
  skillDevelopment: 0.15,
  networking: 0.08,
  timeCommitment: 0.05,
  leadership: 0.1,
  relevance: 0.05,
  worthYourTime: 0.15,
  priceValue: 0.05,
  uniApplicationValue: 0.2,
};

/**
 * Maps each factor key to the exact factor name returned by the backend's
 * getRatingExplanation, so the backend explanation (name and weight) is
 * looked up correctly for all 10 factors.
 */
const factorExplanationNames: Record<keyof FactorRatings, string> = {
  recognition: "Recognition / reputation",
  difficulty: "Difficulty / challenge",
  skillDevelopment: "Skill development",
  networking: "Networking",
  timeCommitment: "Time commitment",
  leadership: "Leadership potential",
  relevance: "Relevance to interests",
  worthYourTime: "Worth your time",
  priceValue: "Price value",
  uniApplicationValue: "University application value",
};

function getOverallScore(opportunity: Opportunity): number {
  const ratings = opportunity.factorRatings;
  return factorOrder.reduce(
    (sum, factor) => sum + Number(ratings[factor]) * scoreWeights[factor],
    0,
  );
}

function getScoreColor(score: number): string {
  if (score >= 4) return "text-success";
  if (score >= 3) return "text-primary";
  if (score >= 2) return "text-warning";
  return "text-destructive";
}

/** Convert a backend nanosecond timestamp to a readable date string. */
function formatTimestamp(timestamp: Timestamp): string {
  const date = new Date(Number(timestamp / 1_000_000n));
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function FactorRow({
  factor,
  ratings,
  explanation,
}: {
  factor: keyof FactorRatings;
  ratings: FactorRatings;
  explanation?: { name: string; weight: number; rating: number };
}) {
  const [open, setOpen] = useState(false);
  const rating = Number(ratings[factor]);
  const weight = explanation?.weight ?? scoreWeights[factor];
  const pct = Math.round(weight * 100);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="rounded-xl border border-border bg-card"
      data-ocid={`factor_${factor}`}
    >
      <CollapsibleTrigger
        type="button"
        className="flex w-full items-center gap-4 px-4 py-3 text-left"
        data-ocid={`factor_${factor}_toggle`}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {factorLabels[factor]}
          </p>
          <p className="text-xs text-muted-foreground">
            {pct}% of overall score
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`font-display text-lg font-bold ${getScoreColor(rating)}`}
          >
            {rating.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">/ 5</span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t border-border px-4 py-3">
          <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-featured"
              style={{ width: `${(rating / 5) * 100}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {explanation
              ? explanation.name
              : `${factorLabels[factor]} is rated ${rating.toFixed(1)} out of 5, weighted at ${pct}% of the overall score.`}
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function DetailSkeleton() {
  return (
    <div
      className="mx-auto max-w-5xl px-5 py-10 md:px-8"
      data-ocid="loading_state"
    >
      <Skeleton className="mb-8 h-5 w-32" />
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}

function DetailBody({ opportunity }: { opportunity: Opportunity }) {
  const { data: explanation } = useGetRatingExplanation(opportunity.id);
  const overall = explanation?.overall ?? getOverallScore(opportunity);
  const scoreColor = getScoreColor(overall);
  const status = statusLabels[opportunity.status];
  const explanationByFactor = new Map(
    (explanation?.factors ?? []).map((f) => [f.name, f]),
  );

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        data-ocid="back_link"
      >
        <ArrowLeft className="size-4" />
        Back to discover
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="min-w-0 space-y-8">
          <header>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-full"
                data-ocid="category_badge"
              >
                {categoryLabels[opportunity.category]}
              </Badge>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${status.tone}`}
                data-ocid="status_badge"
              >
                {status.label}
              </span>
              {opportunity.isPrototype ? (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-bold text-warning"
                  data-ocid="prototype_badge"
                >
                  <ShieldAlert className="size-3.5" />
                  Not organizer-verified
                </span>
              ) : null}
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {opportunity.title}
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Organized by {opportunity.organizer}
            </p>
            {opportunity.isPrototype ? (
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                This is a prototype/demo listing and has not been verified by
                the organizing body. Details may be illustrative.
              </p>
            ) : null}
          </header>

          <Card data-ocid="info_card">
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Opportunity details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                <InfoItem
                  icon={CalendarDays}
                  label="Date"
                  value={formatTimestamp(opportunity.date)}
                />
                <InfoItem
                  icon={Clock}
                  label="Duration"
                  value={opportunity.duration}
                />
                <InfoItem
                  icon={MapPin}
                  label="Venue"
                  value={opportunity.venue}
                />
                <InfoItem
                  icon={Navigation}
                  label="Location"
                  value={opportunity.location}
                />
                <InfoItem
                  icon={Users}
                  label="Age range"
                  value={opportunity.ageRange}
                />
                <InfoItem icon={Wallet} label="Cost" value={opportunity.cost} />
                <InfoItem
                  icon={Hourglass}
                  label="Deadline"
                  value={formatTimestamp(opportunity.deadline)}
                />
              </div>
            </CardContent>
          </Card>

          {opportunity.description ? (
            <Card data-ocid="description_card">
              <CardHeader>
                <CardTitle className="font-display text-lg">
                  About this opportunity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                  {opportunity.description}
                </p>
              </CardContent>
            </Card>
          ) : null}

          <Card data-ocid="score_card">
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Why this score?
              </CardTitle>
              <CardDescription>
                A weighted average of 10 factors, scored harshly so a perfect
                5.0 is rare.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {factorOrder.map((factor) => (
                <FactorRow
                  key={factor}
                  factor={factor}
                  ratings={opportunity.factorRatings}
                  explanation={explanationByFactor.get(
                    factorExplanationNames[factor],
                  )}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <Card className="sticky top-24" data-ocid="score_panel">
            <CardContent className="flex flex-col items-center gap-4 pt-6">
              <div
                className={`grid size-28 place-items-center rounded-full border-4 ${scoreColor} border-current bg-card`}
                data-ocid="overall_score"
              >
                <div className="text-center">
                  <p
                    className={`font-display text-4xl font-bold ${scoreColor}`}
                  >
                    {overall.toFixed(1)}
                  </p>
                  <p className="text-xs font-semibold text-muted-foreground">
                    / 5.0
                  </p>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Overall score across 10 weighted factors
              </p>
              <Separator />
              <div className="grid w-full grid-cols-1 gap-3">
                <div className="rounded-xl bg-muted p-3 text-center">
                  <p className="font-display text-xl font-bold text-foreground">
                    {factorOrder.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Factors</p>
                </div>
              </div>
              <SaveButton
                id={opportunity.id}
                name={opportunity.title}
                variant="full"
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card data-ocid="links_card">
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Get involved
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {opportunity.registrationUrl ? (
                <Button
                  type="button"
                  asChild
                  className="w-full"
                  data-ocid="registration_link"
                >
                  <a
                    href={opportunity.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Ticket className="size-4" />
                    Register
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              ) : (
                <div
                  className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground"
                  data-ocid="registration_unavailable"
                >
                  <Ticket className="size-4" />
                  Registration link unavailable
                </div>
              )}
              {opportunity.applyUrl ? (
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="w-full"
                  data-ocid="apply_link"
                >
                  <a
                    href={opportunity.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="size-4" />
                    Apply now
                  </a>
                </Button>
              ) : (
                <div
                  className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground"
                  data-ocid="apply_unavailable"
                >
                  <ExternalLink className="size-4" />
                  Apply link unavailable
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export function OpportunityDetailPage() {
  const { id } = useParams({ from: "/opportunity/$id" });
  const opportunityId: OpportunityId | undefined = id ? BigInt(id) : undefined;
  const { data: opportunity, isLoading } = useGetOpportunity(opportunityId);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (!opportunity) {
    return (
      <div
        className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-5 py-24 text-center"
        data-ocid="error_state"
      >
        <ShieldAlert className="size-10 text-muted-foreground" />
        <h1 className="font-display text-2xl font-bold text-foreground">
          Opportunity not found
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          We couldn't find that opportunity. It may have been removed or the
          link is out of date.
        </p>
        <Button type="button" asChild data-ocid="back_button">
          <Link to="/">Back to discover</Link>
        </Button>
      </div>
    );
  }

  return <DetailBody opportunity={opportunity} />;
}
