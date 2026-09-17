import List "mo:core/List";
import Map "mo:core/Map";
import Set "mo:core/Set";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type Category = {
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

  type Status = {
    #open;
    #closingSoon;
    #closed;
  };

  type FactorRatings = {
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

  type Marker = {
    x : Float;
    y : Float;
  };

  /// The previous opportunity shape still carried a `distanceKm` field. The app
  /// does not know the user's location, so distance is removed from the model.
  type OldOpportunity = {
    id : Nat;
    title : Text;
    organizer : Text;
    category : Category;
    description : Text;
    venue : Text;
    location : Text;
    date : Nat;
    duration : Text;
    ageRange : Text;
    cost : Text;
    deadline : Nat;
    registrationUrl : ?Text;
    applyUrl : ?Text;
    factorRatings : FactorRatings;
    status : Status;
    distanceKm : Float;
    marker : Marker;
    isPrototype : Bool;
  };

  /// The current opportunity shape, without `distanceKm`.
  type NewOpportunity = {
    id : Nat;
    title : Text;
    organizer : Text;
    category : Category;
    description : Text;
    venue : Text;
    location : Text;
    date : Nat;
    duration : Text;
    ageRange : Text;
    cost : Text;
    deadline : Nat;
    registrationUrl : ?Text;
    applyUrl : ?Text;
    factorRatings : FactorRatings;
    status : Status;
    marker : Marker;
    isPrototype : Bool;
  };

  type UserId = Principal;

  type Organizer = {
    id : UserId;
    name : Text;
    createdAt : Nat;
  };

  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    opportunities : List.List<OldOpportunity>;
    savedLists : Map.Map<UserId, Set.Set<Nat>>;
    interests : Map.Map<UserId, [Category]>;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    opportunities : List.List<NewOpportunity>;
    savedLists : Map.Map<UserId, Set.Set<Nat>>;
    interests : Map.Map<UserId, [Category]>;
    organizers : Map.Map<UserId, Organizer>;
    organizerEvents : Map.Map<UserId, [Nat]>;
    eventState : { var nextEventId : Nat };
  };

  public func migration(old : OldActor) : NewActor {
    {
      accessControlState = old.accessControlState;
      opportunities = old.opportunities.map(func o = {
        id = o.id;
        title = o.title;
        organizer = o.organizer;
        category = o.category;
        description = o.description;
        venue = o.venue;
        location = o.location;
        date = o.date;
        duration = o.duration;
        ageRange = o.ageRange;
        cost = o.cost;
        deadline = o.deadline;
        registrationUrl = o.registrationUrl;
        applyUrl = o.applyUrl;
        factorRatings = o.factorRatings;
        status = o.status;
        marker = o.marker;
        isPrototype = o.isPrototype;
      });
      savedLists = old.savedLists;
      interests = old.interests;
      organizers = Map.empty();
      organizerEvents = Map.empty();
      eventState = { var nextEventId = 43 };
    };
  };
};
