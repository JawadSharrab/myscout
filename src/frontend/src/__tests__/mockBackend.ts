import type { EventInput, Organizer } from "@/backend";
import {
  Category,
  type CostFilter,
  type RecommendationMode,
  type Status,
} from "@/types";
import type { Opportunity, OpportunityFilter, OpportunityId } from "@/types";
import { vi } from "vitest";

/** Build a minimal valid Opportunity fixture for tests. */
export function makeOpportunity(
  overrides: Partial<Opportunity> = {},
): Opportunity {
  return {
    id: 1n,
    status: "open" as Status,
    organizer: "Test Organizer",
    title: "Test Opportunity",
    duration: "1 day",
    venue: "Test Venue",
    isPrototype: false,
    ageRange: "15-20",
    cost: "Free",
    date: 1792238400000000000n,
    description: "A test opportunity description.",
    deadline: 1791201600000000000n,
    category: "academic" as Category,
    marker: { x: 50, y: 50 },
    location: "Amman",
    factorRatings: {
      recognition: 4,
      difficulty: 3,
      skillDevelopment: 4,
      networking: 4,
      timeCommitment: 3,
      leadership: 4,
      relevance: 4,
      worthYourTime: 4,
      priceValue: 4,
      uniApplicationValue: 4,
    },
    ...overrides,
  };
}

export const CATEGORIES: Category[] = [
  Category.academic,
  Category.arts,
  Category.athletics,
  Category.business,
  Category.coding,
  Category.community,
  Category.competition,
  Category.conference,
  Category.creative,
  Category.culture,
  Category.debate,
  Category.design,
  Category.entrepreneurship,
  Category.environment,
  Category.health,
  Category.internship,
  Category.leadership,
  Category.scholarship,
  Category.volunteering,
];

export interface MockState {
  catalog: Opportunity[];
  categories: Category[];
  saved: Opportunity[];
  interests: Category[];
  isAuthenticated: boolean;
  opportunityId: string;
  isOrganizer: boolean;
  organizerProfile: Organizer | null;
  myEvents: Opportunity[];
}

export const mockState: MockState = {
  catalog: [],
  categories: CATEGORIES,
  saved: [],
  interests: [],
  isAuthenticated: false,
  opportunityId: "1",
  isOrganizer: false,
  organizerProfile: null,
  myEvents: [],
};

export const mockParams: { id?: string } = {};

export const mockCalls = {
  searchOpportunities: [] as string[],
  filterOpportunities: [] as OpportunityFilter[],
  recommend: [] as RecommendationMode[],
  saveOpportunity: [] as OpportunityId[],
  unsaveOpportunity: [] as OpportunityId[],
  setInterests: [] as Category[][],
  deleteAccount: [] as string[],
  signUpAsOrganizer: [] as string[],
  createEvent: [] as EventInput[],
};

function matchesFilter(o: Opportunity, filter: OpportunityFilter): boolean {
  if (filter.category !== undefined && o.category !== filter.category)
    return false;
  if (filter.cost !== undefined) {
    const isFree = o.cost.toLowerCase() === "free";
    if (filter.cost === ("free" as CostFilter) && !isFree) return false;
    if (filter.cost === ("paid" as CostFilter) && isFree) return false;
  }
  if (filter.status !== undefined && o.status !== filter.status) return false;
  return true;
}

export const mockActor = {
  getCatalog: vi.fn(async (): Promise<Opportunity[]> => mockState.catalog),
  getCategories: vi.fn(async (): Promise<Category[]> => mockState.categories),
  getOpportunity: vi.fn(
    async (id: OpportunityId): Promise<Opportunity | null> =>
      mockState.catalog.find((o) => o.id === id) ?? null,
  ),
  searchOpportunities: vi.fn(
    async (keyword: string): Promise<Opportunity[]> => {
      mockCalls.searchOpportunities.push(keyword);
      const q = keyword.toLowerCase();
      return mockState.catalog.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q) ||
          o.organizer.toLowerCase().includes(q),
      );
    },
  ),
  filterOpportunities: vi.fn(
    async (filter: OpportunityFilter): Promise<Opportunity[]> => {
      mockCalls.filterOpportunities.push(filter);
      return mockState.catalog.filter((o) => matchesFilter(o, filter));
    },
  ),
  recommend: vi.fn(async (mode: RecommendationMode): Promise<Opportunity[]> => {
    mockCalls.recommend.push(mode);
    return [...mockState.catalog];
  }),
  getRatingExplanation: vi.fn(async (id: OpportunityId) => {
    const o = mockState.catalog.find((x) => x.id === id);
    if (!o) return null;
    // Mirror the backend's getRatingExplanation (src/backend/lib/catalog.mo):
    // exact factor names and weights, so the frontend's factorExplanationNames
    // lookup resolves for all 10 factors.
    return {
      overall: 4.2,
      factors: [
        { name: "University application value", rating: 4, weight: 0.2 },
        { name: "Skill development", rating: 4, weight: 0.15 },
        { name: "Worth your time", rating: 4, weight: 0.15 },
        { name: "Recognition / reputation", rating: 4, weight: 0.12 },
        { name: "Leadership potential", rating: 4, weight: 0.1 },
        { name: "Networking", rating: 4, weight: 0.08 },
        { name: "Difficulty / challenge", rating: 3, weight: 0.05 },
        { name: "Time commitment", rating: 3, weight: 0.05 },
        { name: "Price value", rating: 4, weight: 0.05 },
        { name: "Relevance to interests", rating: 4, weight: 0.05 },
      ],
    };
  }),
  getSavedOpportunities: vi.fn(
    async (): Promise<Opportunity[]> => mockState.saved,
  ),
  saveOpportunity: vi.fn(async (id: OpportunityId): Promise<void> => {
    mockCalls.saveOpportunity.push(id);
    const o = mockState.catalog.find((x) => x.id === id);
    if (o && !mockState.saved.some((s) => s.id === id)) {
      mockState.saved = [...mockState.saved, o];
    }
  }),
  unsaveOpportunity: vi.fn(async (id: OpportunityId): Promise<void> => {
    mockCalls.unsaveOpportunity.push(id);
    mockState.saved = mockState.saved.filter((s) => s.id !== id);
  }),
  getInterests: vi.fn(async (): Promise<Category[]> => mockState.interests),
  setInterests: vi.fn(async (selected: Category[]): Promise<void> => {
    mockCalls.setInterests.push(selected);
    mockState.interests = [...selected];
  }),
  recommendByInterests: vi.fn(
    async (): Promise<Opportunity[]> => mockState.catalog,
  ),
  filterByInterests: vi.fn(
    async (): Promise<Opportunity[]> => mockState.catalog,
  ),
  deleteAccount: vi.fn(async (confirmation: string): Promise<void> => {
    mockCalls.deleteAccount.push(confirmation);
  }),
  signUpAsOrganizer: vi.fn(async (name: string): Promise<Organizer> => {
    mockCalls.signUpAsOrganizer.push(name);
    const profile: Organizer = {
      id: "aaaaa-aa" as unknown as Organizer["id"],
      name,
      createdAt: 1792238400000000000n,
    };
    mockState.organizerProfile = profile;
    mockState.isOrganizer = true;
    return profile;
  }),
  isOrganizer: vi.fn(async (): Promise<boolean> => mockState.isOrganizer),
  getOrganizerProfile: vi.fn(
    async (): Promise<Organizer | null> => mockState.organizerProfile,
  ),
  createEvent: vi.fn(async (input: EventInput): Promise<Opportunity> => {
    mockCalls.createEvent.push(input);
    const event: Opportunity = {
      id: 100n,
      status: "open" as Status,
      organizer: mockState.organizerProfile?.name ?? "Organizer",
      title: input.title,
      duration: "1 day",
      venue: input.venue,
      isPrototype: false,
      ageRange: "15-20",
      cost: input.cost,
      date: input.date,
      description: input.description,
      deadline: input.deadline,
      category: input.category,
      marker: { x: 50, y: 50 },
      location: input.location,
      factorRatings: {
        recognition: 4,
        difficulty: 3,
        skillDevelopment: 4,
        networking: 4,
        timeCommitment: 3,
        leadership: 4,
        relevance: 4,
        worthYourTime: 4,
        priceValue: 4,
        uniApplicationValue: 4,
      },
    };
    mockState.catalog = [...mockState.catalog, event];
    mockState.myEvents = [...mockState.myEvents, event];
    return event;
  }),
  listMyEvents: vi.fn(async (): Promise<Opportunity[]> => mockState.myEvents),
};

export const mockAuth = {
  identity: undefined,
  login: vi.fn(),
  clear: vi.fn(),
  loginStatus: "idle" as const,
  isInitializing: false,
  isLoginIdle: true,
  isLoggingIn: false,
  isLoginSuccess: false,
  isLoginError: false,
  // Reflect the shared mockState so tests can flip auth by setting
  // `mockState.isAuthenticated` and have every consumer observe it.
  get isAuthenticated() {
    return mockState.isAuthenticated;
  },
  loginError: undefined,
};

/** Reset all mock state between tests. */
export function resetMockBackend() {
  mockState.catalog = [];
  mockState.categories = CATEGORIES;
  mockState.saved = [];
  mockState.interests = [];
  mockState.isAuthenticated = false;
  mockState.opportunityId = "1";
  mockState.isOrganizer = false;
  mockState.organizerProfile = null;
  mockState.myEvents = [];
  mockParams.id = undefined;
  mockCalls.searchOpportunities = [];
  mockCalls.filterOpportunities = [];
  mockCalls.recommend = [];
  mockCalls.saveOpportunity = [];
  mockCalls.unsaveOpportunity = [];
  mockCalls.setInterests = [];
  mockCalls.deleteAccount = [];
  mockCalls.signUpAsOrganizer = [];
  mockCalls.createEvent = [];
  mockAuth.clear.mockClear();
  mockAuth.login.mockClear();
  mockActor.getCatalog.mockClear();
  mockActor.getCategories.mockClear();
  mockActor.getOpportunity.mockClear();
  mockActor.searchOpportunities.mockClear();
  mockActor.filterOpportunities.mockClear();
  mockActor.recommend.mockClear();
  mockActor.getRatingExplanation.mockClear();
  mockActor.getSavedOpportunities.mockClear();
  mockActor.saveOpportunity.mockClear();
  mockActor.unsaveOpportunity.mockClear();
  mockActor.getInterests.mockClear();
  mockActor.setInterests.mockClear();
  mockActor.recommendByInterests.mockClear();
  mockActor.filterByInterests.mockClear();
  mockActor.deleteAccount.mockClear();
  mockActor.signUpAsOrganizer.mockClear();
  mockActor.isOrganizer.mockClear();
  mockActor.getOrganizerProfile.mockClear();
  mockActor.createEvent.mockClear();
  mockActor.listMyEvents.mockClear();
}
