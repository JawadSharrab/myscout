import Common "../types/common";

module {
  /// The opportunity categories from the MyScout reference app, used to group
  /// opportunities and drive interest-based personalization.
  public type Category = {
    #academic;
    #arts;
    #athletics;
    #business;
    #coding;
    #community;
    #competition;
    #conference;
    #creative;
    #culture;
    #debate;
    #design;
    #entrepreneurship;
    #environment;
    #health;
    #internship;
    #leadership;
    #scholarship;
    #volunteering;
  };

  /// Lifecycle status of an opportunity, derived from its deadline relative to now.
  public type Status = {
    #open;
    #closingSoon;
    #closed;
  };

  /// Cost filter for filtering opportunities.
  public type CostFilter = {
    #free;
    #paid;
  };

  /// The 10 weighted rating factors. Each factor is rated 0-5 (harsh scoring,
  /// 5.0 is rare). Weights sum to 1.0:
  ///   Uni Application Value 20%, Skill Development 15%, Worth Your Time 15%,
  ///   Recognition 12%, Leadership 10%, Networking 8%, Difficulty 5%,
  ///   Time Commitment 5%, Price/Value 5%, Relevance 5%.
  public type FactorRatings = {
    uniApplicationValue : Float;
    skillDevelopment : Float;
    worthYourTime : Float;
    recognition : Float;
    leadership : Float;
    networking : Float;
    difficulty : Float;
    timeCommitment : Float;
    priceValue : Float;
    relevance : Float;
  };

  /// Map marker position (normalized coordinates).
  public type Marker = {
    x : Float;
    y : Float;
  };

  /// A single opportunity listing in the MyScout catalog.
  public type Opportunity = {
    id : Common.OpportunityId;
    title : Text;
    organizer : Text;
    category : Category;
    description : Text;
    venue : Text;
    location : Text;
    date : Common.Timestamp;
    duration : Text;
    ageRange : Text;
    cost : Text;
    deadline : Common.Timestamp;
    registrationUrl : ?Text;
    applyUrl : ?Text;
    factorRatings : FactorRatings;
    status : Status;
    marker : Marker;
    isPrototype : Bool;
  };

  /// Recommendation modes for the catalog.
  public type RecommendationMode = {
    #highestRated;
    #closingSoon;
    #university;
    #bestValue;
    #skills;
  };

  /// Filter criteria for the opportunity catalog. All fields are optional;
  /// absent fields are not applied.
  public type OpportunityFilter = {
    category : ?Category;
    cost : ?CostFilter;
    status : ?Status;
  };

  /// One factor's contribution to the overall rating.
  public type FactorScore = {
    name : Text;
    rating : Float; // 0-5
    weight : Float; // 0.0-1.0
  };

  /// Breakdown of how an opportunity's overall score was computed.
  public type RatingExplanation = {
    overall : Float; // rounded to one decimal
    factors : [FactorScore];
  };

  /// A user's selected interest categories (multi-select).
  public type InterestSelection = [Category];
};
