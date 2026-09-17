import List "mo:core/List";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/catalog";
import Common "../types/common";
import CatalogLib "../lib/catalog";

mixin (
  accessControlState : AccessControl.AccessControlState,
  opportunities : List.List<Types.Opportunity>,
  savedLists : Map.Map<Common.UserId, Set.Set<Common.OpportunityId>>,
  interests : Map.Map<Common.UserId, [Types.Category]>,
) {
  /// Return the full opportunity catalog. Public; no sign-in required.
  public query func getCatalog() : async [Types.Opportunity] {
    CatalogLib.listOpportunities(opportunities);
  };

  /// Look up a single opportunity by id. Public.
  public query func getOpportunity(id : Common.OpportunityId) : async ?Types.Opportunity {
    CatalogLib.getOpportunity(opportunities, id);
  };

  /// Return the 19 opportunity categories. Public.
  public query func getCategories() : async [Types.Category] {
    CatalogLib.getCategories();
  };

  /// Search opportunities by keyword across title, organizer, and description. Public.
  public query func searchOpportunities(keyword : Text) : async [Types.Opportunity] {
    CatalogLib.searchOpportunities(opportunities, keyword);
  };

  /// Filter opportunities by category, cost, and status. Public.
  public query func filterOpportunities(filter : Types.OpportunityFilter) : async [Types.Opportunity] {
    CatalogLib.filterOpportunities(opportunities, filter);
  };

  /// Return opportunities ordered by the given recommendation mode. Public.
  public query func recommend(mode : Types.RecommendationMode) : async [Types.Opportunity] {
    CatalogLib.recommend(opportunities, mode);
  };

  /// Save an opportunity to the caller's saved list. Requires a signed-in caller.
  public shared ({ caller }) func saveOpportunity(id : Common.OpportunityId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in users can save opportunities");
    };
    let current = switch (savedLists.get(caller)) {
      case (?s) s;
      case null Set.empty<Common.OpportunityId>();
    };
    current.add(id);
    savedLists.add(caller, current);
  };

  /// Remove an opportunity from the caller's saved list. Requires a signed-in caller.
  public shared ({ caller }) func unsaveOpportunity(id : Common.OpportunityId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in users can unsave opportunities");
    };
    let current = switch (savedLists.get(caller)) {
      case (?s) s;
      case null Set.empty<Common.OpportunityId>();
    };
    current.remove(id);
    savedLists.add(caller, current);
  };

  /// Return the caller's saved opportunities. Requires a signed-in caller.
  public query ({ caller }) func getSavedOpportunities() : async [Types.Opportunity] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in users can view saved opportunities");
    };
    let saved = switch (savedLists.get(caller)) {
      case (?s) s;
      case null Set.empty<Common.OpportunityId>();
    };
    opportunities.toArray().filter(func o = saved.contains(o.id));
  };

  /// Return the per-factor rating breakdown for an opportunity. Public.
  public query func getRatingExplanation(id : Common.OpportunityId) : async ?Types.RatingExplanation {
    switch (CatalogLib.getOpportunity(opportunities, id)) {
      case (?o) ?CatalogLib.getRatingExplanation(o.factorRatings);
      case null null;
    };
  };

  /// Return the caller's selected interest categories. Requires a signed-in caller.
  public query ({ caller }) func getInterests() : async [Types.Category] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in users can view interests");
    };
    CatalogLib.getInterests(interests, caller);
  };

  /// Set the caller's selected interest categories (multi-select, replaces). Requires a signed-in caller.
  public shared ({ caller }) func setInterests(selected : [Types.Category]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in users can set interests");
    };
    CatalogLib.setInterests(interests, caller, selected);
  };

  /// Re-rank/surface opportunities by the caller's interests. Requires a signed-in caller.
  public query ({ caller }) func recommendByInterests() : async [Types.Opportunity] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in users can get recommendations");
    };
    CatalogLib.recommendByInterests(opportunities, CatalogLib.getInterests(interests, caller));
  };

  /// Filter opportunities to those matching the caller's interests. Requires a signed-in caller.
  public query ({ caller }) func filterByInterests() : async [Types.Opportunity] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in users can filter by interests");
    };
    CatalogLib.filterByInterests(opportunities, CatalogLib.getInterests(interests, caller));
  };

  /// Delete the caller's account, wiping saved opportunities and interests.
  /// Requires a signed-in caller and the confirmation string "DELETE".
  public shared ({ caller }) func deleteAccount(confirmation : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in users can delete their account");
    };
    if (confirmation != "DELETE") {
      Runtime.trap("Confirmation required: pass \"DELETE\" to delete your account");
    };
    CatalogLib.deleteAccount(savedLists, interests, caller);
  };
};
