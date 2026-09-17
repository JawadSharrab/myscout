import { createActor } from "@/backend";
import type {
  Category,
  EventInput,
  Opportunity,
  OpportunityFilter,
  OpportunityId,
  Organizer,
  RatingExplanation,
  RecommendationMode,
} from "@/backend";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * React Query hooks wrapping every backend method. Each hook calls
 * `useActor(createActor)` at top level and gates the query on the actor being
 * ready. Writes invalidate the affected query keys on success.
 */

export function useGetCatalog() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["catalog"],
    queryFn: async () => {
      if (!actor) return [] as Opportunity[];
      return actor.getCatalog();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOpportunity(id: OpportunityId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["opportunity", id?.toString()],
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getOpportunity(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useGetCategories() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [] as Category[];
      return actor.getCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchOpportunities(keyword: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["search", keyword],
    queryFn: async () => {
      if (!actor) return [] as Opportunity[];
      return actor.searchOpportunities(keyword);
    },
    enabled: !!actor && !isFetching && keyword.trim().length > 0,
  });
}

export function useFilterOpportunities(filter: OpportunityFilter | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["filter", filter],
    queryFn: async () => {
      if (!actor || !filter) return [] as Opportunity[];
      return actor.filterOpportunities(filter);
    },
    enabled: !!actor && !isFetching && filter !== null,
  });
}

export function useRecommend(mode: RecommendationMode | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["recommend", mode],
    queryFn: async () => {
      if (!actor || !mode) return [] as Opportunity[];
      return actor.recommend(mode);
    },
    enabled: !!actor && !isFetching && mode !== null,
  });
}

export function useGetRatingExplanation(id: OpportunityId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["ratingExplanation", id?.toString()],
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getRatingExplanation(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useGetSavedOpportunities() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useInternetIdentity();
  return useQuery({
    queryKey: ["savedOpportunities"],
    queryFn: async () => {
      if (!actor) return [] as Opportunity[];
      return actor.getSavedOpportunities();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useSaveOpportunity() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: OpportunityId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.saveOpportunity(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["savedOpportunities"] });
    },
  });
}

export function useUnsaveOpportunity() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: OpportunityId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.unsaveOpportunity(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["savedOpportunities"] });
    },
  });
}

export function useGetInterests() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useInternetIdentity();
  return useQuery({
    queryKey: ["interests"],
    queryFn: async () => {
      if (!actor) return [] as Category[];
      return actor.getInterests();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useSetInterests() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (selected: Category[]) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.setInterests(selected);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["interests"] });
      void queryClient.invalidateQueries({
        queryKey: ["recommendByInterests"],
      });
      void queryClient.invalidateQueries({ queryKey: ["filterByInterests"] });
    },
  });
}

export function useRecommendByInterests() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useInternetIdentity();
  return useQuery({
    queryKey: ["recommendByInterests"],
    queryFn: async () => {
      if (!actor) return [] as Opportunity[];
      return actor.recommendByInterests();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useFilterByInterests() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useInternetIdentity();
  return useQuery({
    queryKey: ["filterByInterests"],
    queryFn: async () => {
      if (!actor) return [] as Opportunity[];
      return actor.filterByInterests();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useDeleteAccount() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (confirmation: string) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteAccount(confirmation);
    },
  });
}

export function useSignUpAsOrganizer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.signUpAsOrganizer(name);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["isOrganizer"] });
      void queryClient.invalidateQueries({ queryKey: ["organizerProfile"] });
    },
  });
}

export function useIsOrganizer() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useInternetIdentity();
  return useQuery({
    queryKey: ["isOrganizer"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isOrganizer();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useGetOrganizerProfile() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useInternetIdentity();
  return useQuery({
    queryKey: ["organizerProfile"],
    queryFn: async () => {
      if (!actor) return null as Organizer | null;
      return actor.getOrganizerProfile();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useCreateEvent() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: EventInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createEvent(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["catalog"] });
      void queryClient.invalidateQueries({ queryKey: ["search"] });
      void queryClient.invalidateQueries({ queryKey: ["filter"] });
      void queryClient.invalidateQueries({ queryKey: ["recommend"] });
      void queryClient.invalidateQueries({ queryKey: ["myEvents"] });
    },
  });
}

export function useListMyEvents() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useInternetIdentity();
  return useQuery({
    queryKey: ["myEvents"],
    queryFn: async () => {
      if (!actor) return [] as Opportunity[];
      return actor.listMyEvents();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}
