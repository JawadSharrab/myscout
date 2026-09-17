import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Compass } from "lucide-react";

export function NotFoundPage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center md:py-32">
      <div className="grid size-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <Compass className="size-7" />
      </div>
      <p className="mt-8 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        404 · Lost your way
      </p>
      <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
        This page isn't on the map.
      </h1>
      <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
        The page you're looking for doesn't exist or has moved. Head back to
        Discover to find something worth doing.
      </p>
      <Button asChild className="mt-8 rounded-full" data-ocid="not_found_home">
        <Link to="/">
          <ArrowLeft className="size-4" />
          Back to Discover
        </Link>
      </Button>
    </section>
  );
}
