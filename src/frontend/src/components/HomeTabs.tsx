import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, Compass, Sparkles } from "lucide-react";

interface HomeTabsProps {
  /** "For you" tab content (personalized recommendations). */
  forYou: React.ReactNode;
  /** "Explore" tab content (browse + filter the full catalog). */
  explore: React.ReactNode;
  /** "Saved" tab content (the caller's shortlist). */
  saved: React.ReactNode;
  /** Controlled active tab value ("forYou" | "explore" | "saved"). */
  value?: string;
  /** Called when the active tab changes. */
  onValueChange?: (value: string) => void;
}

/**
 * Compact, tabbed homepage scaffolding (For you / Explore / Saved) so content
 * is reachable without excessive scrolling. Supports both uncontrolled use
 * (default "forYou") and controlled use so the hero CTA can switch tabs.
 */
export function HomeTabs({
  forYou,
  explore,
  saved,
  value,
  onValueChange,
}: HomeTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      defaultValue={value === undefined ? "forYou" : undefined}
      className="w-full"
    >
      <TabsList className="h-11 w-full justify-start gap-1 rounded-2xl bg-muted/70 p-1 sm:w-fit">
        <TabsTrigger
          value="forYou"
          className="gap-2 rounded-xl px-4"
          data-ocid="home_tab.for_you"
        >
          <Sparkles className="size-4" />
          For you
        </TabsTrigger>
        <TabsTrigger
          value="explore"
          className="gap-2 rounded-xl px-4"
          data-ocid="home_tab.explore"
        >
          <Compass className="size-4" />
          Explore
        </TabsTrigger>
        <TabsTrigger
          value="saved"
          className="gap-2 rounded-xl px-4"
          data-ocid="home_tab.saved"
        >
          <Bookmark className="size-4" />
          Saved
        </TabsTrigger>
      </TabsList>
      <TabsContent value="forYou" className="mt-6">
        {forYou}
      </TabsContent>
      <TabsContent value="explore" className="mt-6">
        {explore}
      </TabsContent>
      <TabsContent value="saved" className="mt-6">
        {saved}
      </TabsContent>
    </Tabs>
  );
}
