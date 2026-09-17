mixin () {
  public query func getApiDoc() : async Text {
    "## MyScout Backend API\n" #
    "\n" #
    "MyScout is a student extracurricular-opportunity discovery app for Amman, Jordan. " #
    "The backend stores a catalog of opportunities, per-user saved lists, per-user " #
    "interest categories, and organizer profiles with the events they create, and " #
    "exposes them through a public query API plus OQL (`schema` / `execute`) for the " #
    "Data Intelligence agent.\n" #
    "\n" #
    "## Public methods\n" #
    "\n" #
    "### Catalog (public, no sign-in required)\n" #
    "\n" #
    "- `getCatalog() : async [Opportunity]` — returns the full opportunity catalog, " #
    "including organizer-created events.\n" #
    "- `getOpportunity(id : Nat) : async ?Opportunity` — returns one opportunity by id, " #
    "or `null` if it does not exist.\n" #
    "- `getCategories() : async [Category]` — returns the 19 opportunity categories.\n" #
    "- `searchOpportunities(keyword : Text) : async [Opportunity]` — case-insensitive " #
    "substring search across title, organizer, and description.\n" #
    "- `filterOpportunities(filter : OpportunityFilter) : async [Opportunity]` — filters " #
    "by optional category, cost (`#free` / `#paid`), and status.\n" #
    "- `recommend(mode : RecommendationMode) : async [Opportunity]` — returns the catalog " #
    "ordered by the given mode (`#highestRated`, `#closingSoon`, `#university`, " #
    "`#bestValue`, `#skills`).\n" #
    "- `getRatingExplanation(id : Nat) : async ?RatingExplanation` — returns the weighted " #
    "per-factor rating breakdown for an opportunity, or `null` if it does not exist.\n" #
    "\n" #
    "### Organizers and events (signed-in user required)\n" #
    "\n" #
    "- `signUpAsOrganizer(name : Text) : async Organizer` — registers the caller as an " #
    "organizer with the given display name and returns the new organizer profile.\n" #
    "- `isOrganizer() : async Bool` — returns whether the caller is a registered organizer.\n" #
    "- `getOrganizerProfile() : async ?Organizer` — returns the caller's organizer profile, " #
    "or `null` if they are not an organizer.\n" #
    "- `createEvent(input : EventInput) : async Opportunity` — creates a new event from the " #
    "organizer's input (title, category, description, venue, location, date, deadline, " #
    "cost). The event is stored in the catalog and appears in `getCatalog`, the map, and " #
    "search results. Requires the caller to be a registered organizer.\n" #
    "- `listMyEvents() : async [Opportunity]` — returns the events created by the caller. " #
    "Requires the caller to be a registered organizer.\n" #
    "\n" #
    "### Saved opportunities (signed-in user required)\n" #
    "\n" #
    "- `saveOpportunity(id : Nat) : async ()` — adds an opportunity id to the caller's " #
    "saved list.\n" #
    "- `unsaveOpportunity(id : Nat) : async ()` — removes an opportunity id from the " #
    "caller's saved list.\n" #
    "- `getSavedOpportunities() : async [Opportunity]` — returns the caller's saved " #
    "opportunities.\n" #
    "\n" #
    "### Interests (signed-in user required)\n" #
    "\n" #
    "- `getInterests() : async [Category]` — returns the caller's selected interest " #
    "categories (empty if none set).\n" #
    "- `setInterests(selected : [Category]) : async ()` — replaces the caller's interest " #
    "categories (multi-select).\n" #
    "- `recommendByInterests() : async [Opportunity]` — re-ranks the catalog by how well " #
    "each opportunity matches the caller's interests.\n" #
    "- `filterByInterests() : async [Opportunity]` — filters the catalog to opportunities " #
    "matching the caller's interests.\n" #
    "\n" #
    "### Account (signed-in user required)\n" #
    "\n" #
    "- `deleteAccount(confirmation : Text) : async ()` — wipes the caller's saved " #
    "opportunities and interests. Requires the exact confirmation string `\"DELETE\"`.\n" #
    "\n" #
    "### Access control (from the authorization extension)\n" #
    "\n" #
    "- `_internet_identity_sign_in_start() : async Blob` — starts the Internet Identity " #
    "sign-in flow, returning a challenge blob.\n" #
    "- `_internet_identity_sign_in_finish() : async Result<(), Verify.Error>` — completes " #
    "the sign-in flow and registers the caller.\n" #
    "- `_initialize_access_control() : async ()` — registers the caller. The first " #
    "signed-in caller to call it becomes `#admin`; every later caller becomes `#user`.\n" #
    "- `getCallerUserRole() : async UserRole` — returns the caller's role (`#admin`, " #
    "`#user`, or `#guest` for anonymous callers).\n" #
    "- `assignCallerUserRole(user : Principal, role : UserRole) : async ()` — assigns a " #
    "role to a user. Admin-only.\n" #
    "- `isCallerAdmin() : async Bool` — returns whether the caller is an admin.\n" #
    "\n" #
    "### OQL (Data Intelligence)\n" #
    "\n" #
    "- `schema() : async Text` — returns the OQL schema of the exposed entities.\n" #
    "- `execute(query : Text) : async Text` — runs an OQL query over the exposed entities.\n" #
    "\n" #
    "## Authentication and authorization\n" #
    "\n" #
    "The app uses Internet Identity. A caller is **anonymous** until they sign in through " #
    "the app's frontend, and **registered** only after the sign-in flow calls " #
    "`_initialize_access_control` (directly or via `_internet_identity_sign_in_finish`).\n" #
    "\n" #
    "The first signed-in caller to register becomes `#admin`; all subsequent callers " #
    "become `#user`. Anonymous callers are never registered.\n" #
    "\n" #
    "The following methods require a signed-in (non-anonymous) caller and trap otherwise: " #
    "`signUpAsOrganizer`, `isOrganizer`, `getOrganizerProfile`, `createEvent`, " #
    "`listMyEvents`, `saveOpportunity`, `unsaveOpportunity`, `getSavedOpportunities`, " #
    "`getInterests`, `setInterests`, `recommendByInterests`, `filterByInterests`, " #
    "`deleteAccount`, `assignCallerUserRole`. All catalog read methods (`getCatalog`, " #
    "`getOpportunity`, `getCategories`, `searchOpportunities`, `filterOpportunities`, " #
    "`recommend`, `getRatingExplanation`) are public and require no sign-in.\n" #
    "\n" #
    "`createEvent` and `listMyEvents` additionally require the caller to be a registered " #
    "organizer (i.e. to have called `signUpAsOrganizer` first); a signed-in non-organizer " #
    "receives the trap `Unauthorized: Only organizers can create events` (or " #
    "`Unauthorized: Only organizers can view their events`).\n" #
    "\n" #
    "An **anonymous** caller on a signed-in-only method receives the trap message " #
    "`Unauthorized: Only signed-in users can <action>` (for example " #
    "`Unauthorized: Only signed-in users can save opportunities`). A **signed-in but " #
    "unregistered** caller (one who never completed registration through the app's " #
    "frontend) receives the trap `User is not registered` from the authorization layer. " #
    "A caller can be unregistered even when it belongs to the app's owner: registration " #
    "happens only when a caller signs in through the app's own frontend, so a principal " #
    "that never did so is unregistered, and a signed-in caller derived against a " #
    "different origin is a different principal than the one the frontend registered.\n" #
    "\n" #
    "`assignCallerUserRole` additionally requires the caller to be an admin; a " #
    "non-admin caller receives the trap `Unauthorized: Only admins can assign user roles`.\n" #
    "\n" #
    "### Identity derivation\n" #
    "\n" #
    "The app's frontend pins an Internet Identity derivation origin, published at " #
    "`/.well-known/ii-derivation-origin` when available. An agent already holding the " #
    "user's Internet Identity authorization derives the correct per-app principal " #
    "against that origin, for example `icp identity link web <name> --app <host>`. " #
    "Such a delegation acts with the user's full authority in this app until it expires.\n" #
    "\n" #
    "## Units and encodings\n" #
    "\n" #
    "- `OpportunityId` and `UserId` are `Nat` and `Principal` respectively.\n" #
    "- `Timestamp` fields (`date`, `deadline`, `createdAt`) are Unix timestamps in " #
    "nanoseconds as `Nat`.\n" #
    "- `factorRatings` fields are `Float` values rated 0-5 (harsh scoring; 5.0 is rare). " #
    "The overall score is the weighted sum of the 10 factors, rounded to one decimal. " #
    "Organizer-created events default all factor ratings to 0.0.\n" #
    "- `Category` and `Status` are variants; `Status` is `#open`, `#closingSoon`, or " #
    "`#closed`. Organizer-created events are stored with `status = #open`.\n" #
    "- `registrationUrl` and `applyUrl` are optional `Text` (`null` when absent).\n" #
    "- `marker` is `{ x : Float; y : Float }` with normalized coordinates. " #
    "Organizer-created events default to `{ x = 0.0; y = 0.0 }`.\n" #
    "- `EventInput` carries `title`, `category`, `description`, `venue`, `location`, " #
    "`date`, `deadline`, and `cost`; the remaining `Opportunity` fields are derived with " #
    "defaults when the event is stored.\n" #
    "- Distance is not part of the data model: the app does not know the user's " #
    "location, so `distanceKm` is not returned and there is no distance filter or " #
    "closest-sorting mode.\n" #
    "\n" #
    "## Lifecycle and polling\n" #
    "\n" #
    "The catalog is seeded at deployment with 42 opportunities (ids 1-42). Organizers " #
    "can add new events via `createEvent`; each new event receives the next sequential " #
    "id (from 43 onward) and appears immediately in the catalog, map, and search " #
    "results. `Status` is derived from each opportunity's `deadline` relative to now. " #
    "There are no long-running operations to poll; all methods return immediately.\n" #
    "\n" #
    "## Mutation retry safety\n" #
    "\n" #
    "- `saveOpportunity` and `unsaveOpportunity` operate on a set, so they are " #
    "idempotent: saving an already-saved id or unsaving an absent id is a no-op.\n" #
    "- `setInterests` replaces the caller's interest list wholesale, so re-sending the " #
    "same selection is idempotent.\n" #
    "- `signUpAsOrganizer` is idempotent in effect: re-registering overwrites the " #
    "caller's organizer profile with the new name.\n" #
    "- `createEvent` is **not** idempotent: each call appends a new event with a fresh " #
    "id. Retrying a failed create may produce duplicate events; the caller should " #
    "deduplicate by the returned event id.\n" #
    "- `deleteAccount` is destructive: it permanently wipes the caller's saved " #
    "opportunities and interests. It requires the exact confirmation string `\"DELETE\"` " #
    "and traps with `Confirmation required: pass \"DELETE\" to delete your account` " #
    "otherwise.\n" #
    "\n" #
    "## Errors, traps, and limits\n" #
    "\n" #
    "- Signed-in-only methods trap with `Unauthorized: Only signed-in users can <action>` " #
    "for anonymous callers and `User is not registered` for unregistered signed-in " #
    "callers.\n" #
    "- `createEvent` and `listMyEvents` trap with `Unauthorized: Only organizers can " #
    "create events` / `Unauthorized: Only organizers can view their events` for " #
    "signed-in callers who are not registered organizers.\n" #
    "- `assignCallerUserRole` traps with `Unauthorized: Only admins can assign user roles` " #
    "for non-admin callers.\n" #
    "- `deleteAccount` traps with `Confirmation required: pass \"DELETE\" to delete your " #
    "account` when the confirmation string is not exactly `\"DELETE\"`.\n" #
    "- `getOpportunity` and `getRatingExplanation` return `null` (not an error) for " #
    "unknown ids.\n" #
    "- OQL `execute` is bounded by the canister's message size limits; large result sets " #
    "should be filtered or paginated in the query.\n"
  };
};
