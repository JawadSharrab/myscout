import List "mo:core/List";
import Map "mo:core/Map";
import Types "../types/organizer-events";
import Catalog "../types/catalog";
import Common "../types/common";

module {
  /// Register the caller as an organizer. Returns the new organizer profile.
  public func signUpAsOrganizer(
    organizers : Map.Map<Common.UserId, Types.Organizer>,
    caller : Common.UserId,
    name : Text,
    now : Common.Timestamp,
  ) : Types.Organizer {
    let organizer : Types.Organizer = {
      id = caller;
      name;
      createdAt = now;
    };
    organizers.add(caller, organizer);
    organizer
  };

  /// Whether the caller is a registered organizer.
  public func isOrganizer(
    organizers : Map.Map<Common.UserId, Types.Organizer>,
    caller : Common.UserId,
  ) : Bool {
    organizers.get(caller) != null;
  };

  /// Return the caller's organizer profile, if any.
  public func getOrganizer(
    organizers : Map.Map<Common.UserId, Types.Organizer>,
    caller : Common.UserId,
  ) : ?Types.Organizer {
    organizers.get(caller);
  };

  /// Create a new event from the organizer's input, add it to the catalog,
  /// and record its id under the organizer's created events. Returns the
  /// stored event.
  public func createEvent(
    opportunities : List.List<Catalog.Opportunity>,
    organizerEvents : Map.Map<Common.UserId, [Common.OpportunityId]>,
    organizer : Types.Organizer,
    input : Types.EventInput,
    nextId : Common.OpportunityId,
    now : Common.Timestamp,
  ) : Catalog.Opportunity {
    ignore now;
    let event : Catalog.Opportunity = {
      id = nextId;
      title = input.title;
      organizer = organizer.name;
      category = input.category;
      description = input.description;
      venue = input.venue;
      location = input.location;
      date = input.date;
      duration = "";
      ageRange = "";
      cost = input.cost;
      deadline = input.deadline;
      registrationUrl = null;
      applyUrl = null;
      factorRatings = {
        uniApplicationValue = 0.0;
        skillDevelopment = 0.0;
        worthYourTime = 0.0;
        recognition = 0.0;
        leadership = 0.0;
        networking = 0.0;
        difficulty = 0.0;
        timeCommitment = 0.0;
        priceValue = 0.0;
        relevance = 0.0;
      };
      status = #open;
      marker = { x = 0.0; y = 0.0 };
      isPrototype = false;
    };
    opportunities.add(event);
    let current = switch (organizerEvents.get(organizer.id)) {
      case (?ids) ids;
      case null [];
    };
    organizerEvents.add(organizer.id, current.concat([nextId]));
    event
  };

  /// Return the events created by the given organizer.
  public func listMyEvents(
    opportunities : List.List<Catalog.Opportunity>,
    organizerEvents : Map.Map<Common.UserId, [Common.OpportunityId]>,
    caller : Common.UserId,
  ) : [Catalog.Opportunity] {
    let ids = switch (organizerEvents.get(caller)) {
      case (?ids) ids;
      case null [];
    };
    opportunities.toArray().filter(func o = ids.any(func id = id == o.id));
  };
};
