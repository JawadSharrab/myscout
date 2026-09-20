import type { Principal } from '@icp-sdk/core/principal';
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';

export type Category = { 'scholarship' : null } |
  { 'internship' : null } |
  { 'creative' : null } |
  { 'arts' : null } |
  { 'conference' : null } |
  { 'community' : null } |
  { 'culture' : null } |
  { 'athletics' : null } |
  { 'academic' : null } |
  { 'debate' : null } |
  { 'design' : null } |
  { 'leadership' : null } |
  { 'competition' : null } |
  { 'business' : null } |
  { 'environment' : null } |
  { 'entrepreneurship' : null } |
  { 'coding' : null } |
  { 'volunteering' : null } |
  { 'health' : null };
export interface Cell { 'value' : Value, 'name' : string }
export type CostFilter = { 'free' : null } |
  { 'paid' : null };
export type Error = { 'FrontendOriginsNotConfigured' : null } |
  {
    'MixedSsoSources' : {
      'otherKeys' : Array<string>,
      'ssoKeys' : Array<string>,
    }
  } |
  { 'Stale' : { 'ageNs' : bigint } } |
  { 'MalformedCandid' : null } |
  { 'AmbiguousAttribute' : { 'field' : string, 'sources' : Array<string> } } |
  { 'NoAttributes' : null } |
  { 'UnknownNonce' : null } |
  { 'UntrustedSsoSource' : { 'domain' : string } } |
  { 'MissingField' : string } |
  { 'FrontendOriginMismatch' : { 'got' : string, 'expected' : Array<string> } };
export interface EventInput {
  'title' : string,
  'venue' : string,
  'cost' : string,
  'date' : Timestamp,
  'description' : string,
  'deadline' : Timestamp,
  'category' : Category,
  'location' : string,
}
export interface FactorRatings {
  'recognition' : number,
  'difficulty' : number,
  'skillDevelopment' : number,
  'networking' : number,
  'timeCommitment' : number,
  'leadership' : number,
  'relevance' : number,
  'worthYourTime' : number,
  'priceValue' : number,
  'uniApplicationValue' : number,
}
export interface FactorScore {
  'weight' : number,
  'name' : string,
  'rating' : number,
}
export interface Marker { 'x' : number, 'y' : number }
export interface Opportunity {
  'id' : OpportunityId,
  'status' : Status,
  'organizer' : string,
  'title' : string,
  'duration' : string,
  'applyUrl' : [] | [string],
  'venue' : string,
  'isPrototype' : boolean,
  'ageRange' : string,
  'cost' : string,
  'date' : Timestamp,
  'description' : string,
  'deadline' : Timestamp,
  'category' : Category,
  'marker' : Marker,
  'factorRatings' : FactorRatings,
  'registrationUrl' : [] | [string],
  'location' : string,
}
export interface OpportunityFilter {
  'status' : [] | [Status],
  'cost' : [] | [CostFilter],
  'category' : [] | [Category],
}
export type OpportunityId = bigint;
export interface Organizer {
  'id' : UserId,
  'name' : string,
  'createdAt' : Timestamp,
}
export interface RatingExplanation {
  'factors' : Array<FactorScore>,
  'overall' : number,
}
export type RecommendationMode = { 'bestValue' : null } |
  { 'university' : null } |
  { 'closingSoon' : null } |
  { 'highestRated' : null } |
  { 'skills' : null };
export interface Result { 'hasMore' : boolean, 'rows' : Array<Array<Cell>> }
export type Result__1 = { 'ok' : null } |
  { 'err' : Error };
export type Status = { 'closed' : null } |
  { 'open' : null } |
  { 'closingSoon' : null };
export type Timestamp = bigint;
export type UserId = Principal;
export type UserRole = { 'admin' : null } |
  { 'user' : null } |
  { 'guest' : null };
export type Value = { 'int' : bigint } |
  { 'nat' : bigint } |
  { 'float' : number } |
  { 'bool' : boolean } |
  { 'null' : null } |
  { 'text' : string };
export interface _SERVICE {
  '_initialize_access_control' : ActorMethod<[], undefined>,
  '_internet_identity_sign_in_finish' : ActorMethod<[], Result__1>,
  '_internet_identity_sign_in_start' : ActorMethod<[], Uint8Array | number[]>,
  'assignCallerUserRole' : ActorMethod<[Principal, UserRole], undefined>,
  /**
   * / Create a new event. Requires a signed-in organizer.
   */
  'createEvent' : ActorMethod<[EventInput], Opportunity>,
  /**
   * / Delete the caller's account, wiping saved opportunities and interests.
   * / Requires a signed-in caller and the confirmation string "DELETE".
   */
  'deleteAccount' : ActorMethod<[string], undefined>,
  'execute' : ActorMethod<[string], Result>,
  /**
   * / Filter opportunities to those matching the caller's interests. Requires a signed-in caller.
   */
  'filterByInterests' : ActorMethod<[], Array<Opportunity>>,
  /**
   * / Filter opportunities by category, cost, and status. Public.
   */
  'filterOpportunities' : ActorMethod<[OpportunityFilter], Array<Opportunity>>,
  'getApiDoc' : ActorMethod<[], string>,
  'getCallerUserRole' : ActorMethod<[], UserRole>,
  /**
   * / Return the full opportunity catalog. Public; no sign-in required.
   */
  'getCatalog' : ActorMethod<[], Array<Opportunity>>,
  /**
   * / Return the 19 opportunity categories. Public.
   */
  'getCategories' : ActorMethod<[], Array<Category>>,
  /**
   * / Return the caller's selected interest categories. Requires a signed-in caller.
   */
  'getInterests' : ActorMethod<[], Array<Category>>,
  /**
   * / Look up a single opportunity by id. Public.
   */
  'getOpportunity' : ActorMethod<[OpportunityId], [] | [Opportunity]>,
  /**
   * / Return the caller's organizer profile, if any. Requires a signed-in caller.
   */
  'getOrganizerProfile' : ActorMethod<[], [] | [Organizer]>,
  /**
   * / Return the per-factor rating breakdown for an opportunity. Public.
   */
  'getRatingExplanation' : ActorMethod<
    [OpportunityId],
    [] | [RatingExplanation]
  >,
  /**
   * / Return the caller's saved opportunities. Requires a signed-in caller.
   */
  'getSavedOpportunities' : ActorMethod<[], Array<Opportunity>>,
  'isCallerAdmin' : ActorMethod<[], boolean>,
  /**
   * / Whether the caller is a registered organizer. Requires a signed-in caller.
   */
  'isOrganizer' : ActorMethod<[], boolean>,
  /**
   * / Return the events created by the caller. Requires a signed-in organizer.
   */
  'listMyEvents' : ActorMethod<[], Array<Opportunity>>,
  /**
   * / Return opportunities ordered by the given recommendation mode. Public.
   */
  'recommend' : ActorMethod<[RecommendationMode], Array<Opportunity>>,
  /**
   * / Re-rank/surface opportunities by the caller's interests. Requires a signed-in caller.
   */
  'recommendByInterests' : ActorMethod<[], Array<Opportunity>>,
  /**
   * / Save an opportunity to the caller's saved list. Requires a signed-in caller.
   */
  'saveOpportunity' : ActorMethod<[OpportunityId], undefined>,
  'schema' : ActorMethod<[], string>,
  /**
   * / Search opportunities by keyword across title, organizer, and description. Public.
   */
  'searchOpportunities' : ActorMethod<[string], Array<Opportunity>>,
  /**
   * / Set the caller's selected interest categories (multi-select, replaces). Requires a signed-in caller.
   */
  'setInterests' : ActorMethod<[Array<Category>], undefined>,
  /**
   * / Sign up the caller as an organizer. Requires a signed-in caller.
   */
  'signUpAsOrganizer' : ActorMethod<[string], Organizer>,
  /**
   * / Remove an opportunity from the caller's saved list. Requires a signed-in caller.
   */
  'unsaveOpportunity' : ActorMethod<[OpportunityId], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
