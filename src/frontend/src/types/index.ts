// Shared MyScout types re-exported from the generated backend contract.
// Enums are values (used in switches and as `Category.scholarship`); interfaces
// are types. Page tasks import these from `@/types`.

export type {
  FactorRatings,
  FactorScore,
  Marker,
  Opportunity,
  OpportunityFilter,
  OpportunityId,
  RatingExplanation,
  Timestamp,
} from "@/backend";

export {
  Category,
  CostFilter,
  RecommendationMode,
  Status,
  UserRole,
} from "@/backend";
