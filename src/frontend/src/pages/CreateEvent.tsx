import type { EventInput } from "@/backend";
import { SignInPrompt } from "@/components/SignInPrompt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateEvent,
  useGetCategories,
  useIsOrganizer,
  useListMyEvents,
  useSignUpAsOrganizer,
} from "@/hooks/useQueries";
import type { Category, Opportunity } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
  LogIn,
  MapPin,
  Megaphone,
  Plus,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function categoryLabel(cat: Category): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

function toTimestamp(value: string): bigint {
  return BigInt(new Date(value).getTime()) * 1_000_000n;
}

function formatDate(ts: bigint): string {
  const date = new Date(Number(ts / 1_000_000n));
  if (Number.isNaN(date.getTime())) return "Date TBA";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SignInGate() {
  const { isInitializing, isLoggingIn } = useInternetIdentity();
  const [promptOpen, setPromptOpen] = useState(false);

  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-5 py-20 text-center md:py-28">
      <div className="grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-subtle">
        <Megaphone className="size-7" />
      </div>
      <p className="mt-8 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        MyScout · Organizer
      </p>
      <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
        Create an event
      </h1>
      <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
        Sign in to publish a new opportunity to Amman's catalog and manage the
        events you've created.
      </p>
      <Button
        type="button"
        onClick={() => setPromptOpen(true)}
        disabled={isInitializing || isLoggingIn}
        className="mt-8 rounded-full"
        data-ocid="create_event_sign_in_button"
      >
        <LogIn className="size-4" />
        {isLoggingIn ? "Opening sign-in…" : "Sign in to create"}
      </Button>
      <SignInPrompt
        open={promptOpen}
        onOpenChange={setPromptOpen}
        title="Sign in to create an event"
        description="Sign in to publish a new opportunity to Amman's catalog and manage the events you've created."
      />
    </section>
  );
}

function OrganizerSignUpGate() {
  const [name, setName] = useState("");
  const signUp = useSignUpAsOrganizer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    signUp.mutate(trimmed, {
      onSuccess: () => {
        setName("");
        toast.success("You're now an organizer. Create your first event!");
      },
      onError: (err) => {
        toast.error(
          err instanceof Error
            ? err.message
            : "Could not sign you up as an organizer. Please try again.",
        );
      },
    });
  };

  return (
    <section className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <Card
        className="items-center gap-4 px-8 py-12 text-center"
        data-ocid="organizer_sign_up_state"
      >
        <span className="grid size-14 place-items-center rounded-2xl bg-accent/10 text-accent">
          <Sparkles className="size-7" />
        </span>
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            Become an organizer
          </h1>
          <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">
            Organizers can publish events to Amman's catalog and manage the
            opportunities they create. Enter a name for your organizer profile
            to get started.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="mt-2 flex w-full max-w-sm flex-col gap-3"
        >
          <div className="text-left">
            <Label htmlFor="organizer-name">Organizer name</Label>
            <Input
              id="organizer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Amman Youth Hub"
              className="mt-1.5"
              data-ocid="organizer_name_input"
            />
          </div>
          <Button
            type="submit"
            disabled={!name.trim() || signUp.isPending}
            className="rounded-full"
            data-ocid="organizer_sign_up_button"
          >
            <Sparkles className="size-4" />
            {signUp.isPending ? "Signing up…" : "Sign up as organizer"}
          </Button>
        </form>
      </Card>
    </section>
  );
}

function MyEventsList({
  events,
  loading,
}: {
  events: Opportunity[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3" data-ocid="loading_state">
        {Array.from({ length: 3 }, (_, i) => `my-event-skeleton-${i}`).map(
          (id) => (
            <Skeleton key={id} className="h-24 w-full rounded-2xl" />
          ),
        )}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center"
        data-ocid="my_events_empty_state"
      >
        <span className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <Megaphone className="size-6" />
        </span>
        <h3 className="mt-4 font-display text-lg font-bold text-foreground">
          No events yet
        </h3>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Fill in the form to publish your first event to the catalog.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3" data-ocid="my_events_list">
      {events.map((event, i) => (
        <Link
          key={event.id.toString()}
          to="/opportunity/$id"
          params={{ id: event.id.toString() }}
          className="group rounded-2xl border border-border bg-card p-4 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card"
          data-ocid={`my_event.${i}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display text-base font-bold text-foreground group-hover:text-primary">
                {event.title}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {event.organizer}
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {categoryLabel(event.category)}
            </Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border pt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4 text-accent" />
              {formatDate(event.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4 text-accent" />
              Deadline {formatDate(event.deadline)}
            </span>
            <span className="flex items-center gap-1.5">
              <Wallet className="size-4 text-accent" />
              {event.cost}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function CreateEventPage() {
  const { isAuthenticated } = useInternetIdentity();
  const { data: isOrganizer = false, isLoading: organizerLoading } =
    useIsOrganizer();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [cost, setCost] = useState("");
  const [created, setCreated] = useState<Opportunity | null>(null);

  const createEvent = useCreateEvent();
  const { data: categories = [], isLoading: categoriesLoading } =
    useGetCategories();
  const { data: myEvents = [], isLoading: myEventsLoading } = useListMyEvents();

  if (!isAuthenticated) {
    return <SignInGate />;
  }

  if (organizerLoading) {
    return (
      <section className="mx-auto max-w-5xl px-5 py-16 md:py-20">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-4 h-4 w-96 max-w-full" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </section>
    );
  }

  if (!isOrganizer) {
    return <OrganizerSignUpGate />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !date || !deadline) return;
    const input: EventInput = {
      title: title.trim(),
      category,
      description: description.trim(),
      venue: venue.trim(),
      location: location.trim(),
      date: toTimestamp(date),
      deadline: toTimestamp(deadline),
      cost: cost.trim(),
    };
    createEvent.mutate(input, {
      onSuccess: (createdEvent) => {
        setCreated(createdEvent);
        setTitle("");
        setCategory(undefined);
        setDescription("");
        setVenue("");
        setLocation("");
        setDate("");
        setDeadline("");
        setCost("");
        toast.success("Event created and added to the catalog!");
      },
      onError: (err) => {
        toast.error(
          err instanceof Error
            ? err.message
            : "Could not create the event. Please try again.",
        );
      },
    });
  };

  const resetCreated = () => {
    setCreated(null);
  };

  return (
    <section className="mx-auto max-w-5xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          MyScout · Organizer
        </p>
        <h1 className="font-display mt-2 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Create an event
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
          Publish a new opportunity to Amman's catalog. It will appear in the
          catalog, map, and search results right away.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Create form */}
        <Card className="h-fit p-6 shadow-subtle" data-ocid="create_event_form">
          {created ? (
            <div
              className="flex flex-col items-center justify-center px-4 py-16 text-center"
              data-ocid="create_event_success_state"
            >
              <span className="grid size-16 place-items-center rounded-2xl bg-success/15 text-success">
                <CheckCircle2 className="size-8" />
              </span>
              <h2 className="font-display mt-5 text-2xl font-bold text-foreground">
                Event published!
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                <strong className="font-semibold text-foreground">
                  {created.title}
                </strong>{" "}
                is now live in the catalog, map, and search results.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  type="button"
                  onClick={resetCreated}
                  className="rounded-full"
                  data-ocid="create_another_button"
                >
                  <Plus className="size-4" />
                  Create another event
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="rounded-full"
                  data-ocid="view_catalog_button"
                >
                  <Link to="/">
                    <Compass className="size-4" />
                    View catalog
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="event-title">Title</Label>
                <Input
                  id="event-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Amman Design Week 2026"
                  required
                  data-ocid="event_title_input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="event-category">Category</Label>
                {categoriesLoading ? (
                  <Skeleton className="h-9 w-full rounded-md" />
                ) : (
                  <Select
                    value={category}
                    onValueChange={(value) => setCategory(value as Category)}
                  >
                    <SelectTrigger
                      id="event-category"
                      className="w-full"
                      data-ocid="event_category_select"
                    >
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {categoryLabel(cat)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="event-description">Description</Label>
                <Textarea
                  id="event-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this event about, and who is it for?"
                  rows={4}
                  required
                  data-ocid="event_description_input"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="event-venue">Venue</Label>
                  <Input
                    id="event-venue"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Ras El Ain Gallery"
                    required
                    data-ocid="event_venue_input"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="event-location">Location</Label>
                  <Input
                    id="event-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Jabal Amman, Amman"
                    required
                    data-ocid="event_location_input"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="event-date">Event date</Label>
                  <Input
                    id="event-date"
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    data-ocid="event_date_input"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="event-deadline">Application deadline</Label>
                  <Input
                    id="event-deadline"
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                    data-ocid="event_deadline_input"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="event-cost">Cost</Label>
                <Input
                  id="event-cost"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="e.g. Free or 15 JOD"
                  required
                  data-ocid="event_cost_input"
                />
              </div>

              {createEvent.isError && (
                <p
                  role="alert"
                  className="text-sm font-medium text-destructive"
                  data-ocid="create_event_error"
                >
                  {createEvent.error instanceof Error
                    ? createEvent.error.message
                    : "Could not create the event. Please try again."}
                </p>
              )}

              <Button
                type="submit"
                disabled={
                  createEvent.isPending ||
                  !title.trim() ||
                  !category ||
                  !description.trim() ||
                  !venue.trim() ||
                  !location.trim() ||
                  !date ||
                  !deadline ||
                  !cost.trim()
                }
                className="mt-1 rounded-full"
                data-ocid="create_event_submit_button"
              >
                <Megaphone className="size-4" />
                {createEvent.isPending ? "Publishing…" : "Publish event"}
              </Button>
            </form>
          )}
        </Card>

        {/* My events */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-accent/15 text-accent">
              <MapPin className="size-4" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Your events
              </h2>
              <p className="text-xs text-muted-foreground">
                {myEvents.length} {myEvents.length === 1 ? "event" : "events"}{" "}
                published
              </p>
            </div>
          </div>
          <MyEventsList events={myEvents} loading={myEventsLoading} />
        </div>
      </div>
    </section>
  );
}
