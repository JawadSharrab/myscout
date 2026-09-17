import type { LucideIcon } from "lucide-react";

interface PagePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  eyebrow?: string;
}

/**
 * Minimal, intentional page shell used by the foundation before page tasks
 * build the full bodies. Keeps every route non-blank and on-brand.
 */
export function PagePlaceholder({
  title,
  description,
  icon: Icon,
  eyebrow,
}: PagePlaceholderProps) {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-5 py-20 text-center md:py-28">
      <div className="grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-subtle">
        <Icon className="size-7" />
      </div>
      {eyebrow ? (
        <p className="mt-8 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
        {description}
      </p>
    </section>
  );
}
