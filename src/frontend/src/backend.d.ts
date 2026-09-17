import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cell {
    value: Value;
    name: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface EventInput {
    title: string;
    venue: string;
    cost: string;
    date: Timestamp;
    description: string;
    deadline: Timestamp;
    category: Category;
    location: string;
}
export interface FactorRatings {
    recognition: number;
    difficulty: number;
    skillDevelopment: number;
    networking: number;
    timeCommitment: number;
    leadership: number;
    relevance: number;
    worthYourTime: number;
    priceValue: number;
    uniApplicationValue: number;
}
export interface FactorScore {
    weight: number;
    name: string;
    rating: number;
}
export interface Marker {
    x: number;
    y: number;
}
export interface Opportunity {
    id: OpportunityId;
    status: Status;
    organizer: string;
    title: string;
    duration: string;
    applyUrl?: string;
    venue: string;
    isPrototype: boolean;
    ageRange: string;
    cost: string;
    date: Timestamp;
    description: string;
    deadline: Timestamp;
    category: Category;
    marker: Marker;
    factorRatings: FactorRatings;
    registrationUrl?: string;
    location: string;
}
export interface OpportunityFilter {
    status?: Status;
    cost?: CostFilter;
    category?: Category;
}
export type OpportunityId = bigint;
export interface Organizer {
    id: UserId;
    name: string;
    createdAt: Timestamp;
}
export interface RatingExplanation {
    factors: Array<FactorScore>;
    overall: number;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Timestamp = bigint;
export type UserId = Principal;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum Category {
    scholarship = "scholarship",
    internship = "internship",
    creative = "creative",
    arts = "arts",
    conference = "conference",
    community = "community",
    culture = "culture",
    athletics = "athletics",
    academic = "academic",
    debate = "debate",
    design = "design",
    leadership = "leadership",
    competition = "competition",
    business = "business",
    environment = "environment",
    entrepreneurship = "entrepreneurship",
    coding = "coding",
    volunteering = "volunteering",
    health = "health"
}
export enum CostFilter {
    free = "free",
    paid = "paid"
}
export enum RecommendationMode {
    bestValue = "bestValue",
    university = "university",
    closingSoon = "closingSoon",
    highestRated = "highestRated",
    skills = "skills"
}
export enum Status {
    closed = "closed",
    open = "open",
    closingSoon = "closingSoon"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Create a new event. Requires a signed-in organizer.
     */
    createEvent(input: EventInput): Promise<Opportunity>;
    /**
     * / Delete the caller's account, wiping saved opportunities and interests.
     * / Requires a signed-in caller and the confirmation string "DELETE".
     */
    deleteAccount(confirmation: string): Promise<void>;
    execute(qJson: string): Promise<Result>;
    /**
     * / Filter opportunities to those matching the caller's interests. Requires a signed-in caller.
     */
    filterByInterests(): Promise<Array<Opportunity>>;
    /**
     * / Filter opportunities by category, cost, and status. Public.
     */
    filterOpportunities(filter: OpportunityFilter): Promise<Array<Opportunity>>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Return the full opportunity catalog. Public; no sign-in required.
     */
    getCatalog(): Promise<Array<Opportunity>>;
    /**
     * / Return the 19 opportunity categories. Public.
     */
    getCategories(): Promise<Array<Category>>;
    /**
     * / Return the caller's selected interest categories. Requires a signed-in caller.
     */
    getInterests(): Promise<Array<Category>>;
    /**
     * / Look up a single opportunity by id. Public.
     */
    getOpportunity(id: OpportunityId): Promise<Opportunity | null>;
    /**
     * / Return the caller's organizer profile, if any. Requires a signed-in caller.
     */
    getOrganizerProfile(): Promise<Organizer | null>;
    /**
     * / Return the per-factor rating breakdown for an opportunity. Public.
     */
    getRatingExplanation(id: OpportunityId): Promise<RatingExplanation | null>;
    /**
     * / Return the caller's saved opportunities. Requires a signed-in caller.
     */
    getSavedOpportunities(): Promise<Array<Opportunity>>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Whether the caller is a registered organizer. Requires a signed-in caller.
     */
    isOrganizer(): Promise<boolean>;
    /**
     * / Return the events created by the caller. Requires a signed-in organizer.
     */
    listMyEvents(): Promise<Array<Opportunity>>;
    /**
     * / Return opportunities ordered by the given recommendation mode. Public.
     */
    recommend(mode: RecommendationMode): Promise<Array<Opportunity>>;
    /**
     * / Re-rank/surface opportunities by the caller's interests. Requires a signed-in caller.
     */
    recommendByInterests(): Promise<Array<Opportunity>>;
    /**
     * / Save an opportunity to the caller's saved list. Requires a signed-in caller.
     */
    saveOpportunity(id: OpportunityId): Promise<void>;
    schema(): Promise<string>;
    /**
     * / Search opportunities by keyword across title, organizer, and description. Public.
     */
    searchOpportunities(keyword: string): Promise<Array<Opportunity>>;
    /**
     * / Set the caller's selected interest categories (multi-select, replaces). Requires a signed-in caller.
     */
    setInterests(selected: Array<Category>): Promise<void>;
    /**
     * / Sign up the caller as an organizer. Requires a signed-in caller.
     */
    signUpAsOrganizer(name: string): Promise<Organizer>;
    /**
     * / Remove an opportunity from the caller's saved list. Requires a signed-in caller.
     */
    unsaveOpportunity(id: OpportunityId): Promise<void>;
}
