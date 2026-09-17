import Common "../types/common";
import Catalog "../types/catalog";

module {
  /// A user who has signed up as an organizer. `id` is the caller's principal;
  /// `name` is the display name shown on the organizer's events.
  public type Organizer = {
    id : Common.UserId;
    name : Text;
    createdAt : Common.Timestamp;
  };

  /// Input for creating a new event. The organizer supplies these fields; the
  /// remaining Opportunity fields (factorRatings, marker, status, isPrototype,
  /// etc.) are derived with defaults when the event is stored.
  public type EventInput = {
    title : Text;
    category : Catalog.Category;
    description : Text;
    venue : Text;
    location : Text;
    date : Common.Timestamp;
    deadline : Common.Timestamp;
    cost : Text;
  };

  /// A stored event. Events are stored in the same catalog list as
  /// opportunities so they appear in the catalog, map, and search results.
  public type Event = Catalog.Opportunity;
};
