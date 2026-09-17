import List "mo:core/List";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Types "../types/catalog";
import Common "../types/common";

module {
  /// Return the full opportunity catalog.
  public func listOpportunities(opportunities : List.List<Types.Opportunity>) : [Types.Opportunity] {
    opportunities.toArray();
  };

  /// Look up a single opportunity by id.
  public func getOpportunity(opportunities : List.List<Types.Opportunity>, id : Common.OpportunityId) : ?Types.Opportunity {
    opportunities.find(func o = o.id == id);
  };

  /// Return the 19 opportunity categories.
  public func getCategories() : [Types.Category] {
    [
      #academic,
      #arts,
      #athletics,
      #business,
      #coding,
      #community,
      #competition,
      #conference,
      #creative,
      #culture,
      #debate,
      #design,
      #entrepreneurship,
      #environment,
      #health,
      #internship,
      #leadership,
      #scholarship,
      #volunteering,
    ];
  };

  /// Search opportunities by keyword across title, organizer, and description.
  public func searchOpportunities(opportunities : List.List<Types.Opportunity>, keyword : Text) : [Types.Opportunity] {
    let term = keyword.toLower();
    opportunities.toArray().filter(func o =
      o.title.toLower().contains(#text term) or
      o.organizer.toLower().contains(#text term) or
      o.description.toLower().contains(#text term)
    );
  };

  /// Filter opportunities by category, cost, and status.
  public func filterOpportunities(opportunities : List.List<Types.Opportunity>, filter : Types.OpportunityFilter) : [Types.Opportunity] {
    opportunities.toArray().filter(func o =
      (switch (filter.category) {
        case (?c) o.category == c;
        case null true;
      }) and
      (switch (filter.cost) {
        case (?cost) {
          switch (cost) {
            case (#free) o.cost == "Free";
            case (#paid) o.cost != "Free";
          };
        };
        case null true;
      }) and
      (switch (filter.status) {
        case (?s) o.status == s;
        case null true;
      })
    );
  };

  /// Return opportunities ordered by the given recommendation mode.
  public func recommend(opportunities : List.List<Types.Opportunity>, mode : Types.RecommendationMode) : [Types.Opportunity] {
    let arr = opportunities.toArray();
    switch (mode) {
      case (#highestRated) {
        arr.sort(func (a, b) = Float.compare(computeOverall(b.factorRatings), computeOverall(a.factorRatings)));
      };
      case (#closingSoon) {
        arr.sort(func (a, b) = Nat.compare(a.deadline, b.deadline));
      };
      case (#university) {
        arr.sort(func (a, b) = Float.compare(b.factorRatings.uniApplicationValue, a.factorRatings.uniApplicationValue));
      };
      case (#bestValue) {
        arr.sort(func (a, b) = Float.compare(b.factorRatings.priceValue, a.factorRatings.priceValue));
      };
      case (#skills) {
        arr.sort(func (a, b) = Float.compare(b.factorRatings.skillDevelopment, a.factorRatings.skillDevelopment));
      };
    };
  };

  /// Compute the weighted overall score (0-5) from the 10 factor ratings,
  /// rounded to one decimal with harsh scoring.
  public func computeOverall(f : Types.FactorRatings) : Float {
    let weighted =
      f.uniApplicationValue * 0.2 +
      f.skillDevelopment * 0.15 +
      f.worthYourTime * 0.15 +
      f.recognition * 0.12 +
      f.leadership * 0.1 +
      f.networking * 0.08 +
      f.difficulty * 0.05 +
      f.timeCommitment * 0.05 +
      f.priceValue * 0.05 +
      f.relevance * 0.05;
    Float.nearest(weighted * 10.0) / 10.0;
  };

  /// Build the per-factor breakdown of an opportunity's overall score.
  public func getRatingExplanation(f : Types.FactorRatings) : Types.RatingExplanation {
    {
      overall = computeOverall(f);
      factors = [
        { name = "University application value"; rating = f.uniApplicationValue; weight = 0.2 },
        { name = "Skill development"; rating = f.skillDevelopment; weight = 0.15 },
        { name = "Worth your time"; rating = f.worthYourTime; weight = 0.15 },
        { name = "Recognition / reputation"; rating = f.recognition; weight = 0.12 },
        { name = "Leadership potential"; rating = f.leadership; weight = 0.1 },
        { name = "Networking"; rating = f.networking; weight = 0.08 },
        { name = "Difficulty / challenge"; rating = f.difficulty; weight = 0.05 },
        { name = "Time commitment"; rating = f.timeCommitment; weight = 0.05 },
        { name = "Price value"; rating = f.priceValue; weight = 0.05 },
        { name = "Relevance to interests"; rating = f.relevance; weight = 0.05 },
      ];
    };
  };

  /// Whether an opportunity id is present in a user's saved set.
  public func isSaved(saved : Set.Set<Common.OpportunityId>, id : Common.OpportunityId) : Bool {
    saved.contains(id);
  };

  /// Return the caller's selected interest categories (empty if none set).
  public func getInterests(interests : Map.Map<Common.UserId, [Types.Category]>, caller : Common.UserId) : [Types.Category] {
    switch (interests.get(caller)) {
      case (?c) c;
      case null [];
    };
  };

  /// Set (replace) the caller's selected interest categories.
  public func setInterests(interests : Map.Map<Common.UserId, [Types.Category]>, caller : Common.UserId, selected : [Types.Category]) : () {
    interests.add(caller, selected);
  };

  /// A 0-1+ score for how well an opportunity matches the caller's interests:
  /// matching opportunities score 1.0 plus their relevance factor, so they
  /// surface above non-matching ones and rank by relevance within each group.
  func interestScore(o : Types.Opportunity, interests : [Types.Category]) : Float {
    let matched = interests.any(func c = c == o.category);
    if (matched) { 1.0 + o.factorRatings.relevance } else { o.factorRatings.relevance };
  };

  /// Re-rank/surface opportunities by the caller's interest categories.
  public func recommendByInterests(opportunities : List.List<Types.Opportunity>, interests : [Types.Category]) : [Types.Opportunity] {
    let arr = opportunities.toArray();
    arr.sort(func (a, b) = Float.compare(interestScore(b, interests), interestScore(a, interests)));
  };

  /// Filter opportunities to those matching the caller's interest categories.
  public func filterByInterests(opportunities : List.List<Types.Opportunity>, interests : [Types.Category]) : [Types.Opportunity] {
    opportunities.toArray().filter(func o = interests.any(func c = c == o.category));
  };

  /// Wipe all of a user's personal data: saved opportunities and interests.
  /// Called after the caller confirms account deletion.
  public func deleteAccount(
    savedLists : Map.Map<Common.UserId, Set.Set<Common.OpportunityId>>,
    interests : Map.Map<Common.UserId, [Types.Category]>,
    caller : Common.UserId,
  ) : () {
    savedLists.remove(caller);
    interests.remove(caller);
  };
};
