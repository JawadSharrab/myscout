import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/organizer-events";
import Catalog "../types/catalog";
import Common "../types/common";
import OrgLib "../lib/organizer-events";

mixin (
  accessControlState : AccessControl.AccessControlState,
  opportunities : List.List<Catalog.Opportunity>,
  organizers : Map.Map<Common.UserId, Types.Organizer>,
  organizerEvents : Map.Map<Common.UserId, [Common.OpportunityId]>,
  eventState : { var nextEventId : Common.OpportunityId },
) {
  /// Sign up the caller as an organizer. Requires a signed-in caller.
  public shared ({ caller }) func signUpAsOrganizer(name : Text) : async Types.Organizer {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in users can sign up as an organizer");
    };
    OrgLib.signUpAsOrganizer(organizers, caller, name, Time.now().toNat());
  };

  /// Whether the caller is a registered organizer. Requires a signed-in caller.
  public query ({ caller }) func isOrganizer() : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in users can check organizer status");
    };
    OrgLib.isOrganizer(organizers, caller);
  };

  /// Return the caller's organizer profile, if any. Requires a signed-in caller.
  public query ({ caller }) func getOrganizerProfile() : async ?Types.Organizer {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in users can view organizer profile");
    };
    OrgLib.getOrganizer(organizers, caller);
  };

  /// Create a new event. Requires a signed-in organizer.
  public shared ({ caller }) func createEvent(input : Types.EventInput) : async Catalog.Opportunity {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in users can create events");
    };
    let organizer = OrgLib.getOrganizer(organizers, caller)
      ?? Runtime.trap("Unauthorized: Only organizers can create events");
    let event = OrgLib.createEvent(opportunities, organizerEvents, organizer, input, eventState.nextEventId, Time.now().toNat());
    eventState.nextEventId += 1;
    event
  };

  /// Return the events created by the caller. Requires a signed-in organizer.
  public query ({ caller }) func listMyEvents() : async [Catalog.Opportunity] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in users can view their events");
    };
    if (not OrgLib.isOrganizer(organizers, caller)) {
      Runtime.trap("Unauthorized: Only organizers can view their events");
    };
    OrgLib.listMyEvents(opportunities, organizerEvents, caller);
  };
};
