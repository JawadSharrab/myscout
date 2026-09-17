import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import OQL "mo:caffeineai-oql";
import Entity "mo:caffeineai-oql/Entity";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import List "mo:core/List";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Types "types/catalog";
import Common "types/common";
import OrgTypes "types/organizer-events";
import CatalogApi "mixins/catalog-api";
import OrganizerEventsApi "mixins/organizer-events-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  let opportunities : List.List<Types.Opportunity>;
  let savedLists : Map.Map<Common.UserId, Set.Set<Common.OpportunityId>>;
  let interests : Map.Map<Common.UserId, [Types.Category]>;
  let organizers : Map.Map<Common.UserId, OrgTypes.Organizer>;
  let organizerEvents : Map.Map<Common.UserId, [Common.OpportunityId]>;
  let eventState : { var nextEventId : Common.OpportunityId };

  include MixinAuthorization(accessControlState, null);

  func categoryToText(c : Types.Category) : Text {
    switch (c) {
      case (#academic) "academic";
      case (#arts) "arts";
      case (#athletics) "athletics";
      case (#business) "business";
      case (#coding) "coding";
      case (#community) "community";
      case (#competition) "competition";
      case (#conference) "conference";
      case (#creative) "creative";
      case (#culture) "culture";
      case (#debate) "debate";
      case (#design) "design";
      case (#entrepreneurship) "entrepreneurship";
      case (#environment) "environment";
      case (#health) "health";
      case (#internship) "internship";
      case (#leadership) "leadership";
      case (#scholarship) "scholarship";
      case (#volunteering) "volunteering";
    };
  };

  func statusToText(s : Types.Status) : Text {
    switch (s) {
      case (#open) "open";
      case (#closingSoon) "closing-soon";
      case (#closed) "closed";
    };
  };

  func categoriesToText(cs : [Types.Category]) : Text {
    cs.map(categoryToText).values().join(",");
  };

  /// Organizer-created events are stored in the same catalog list as the
  /// seeded opportunities; they carry ids from 43 onward (the seeded catalog
  /// occupies ids 1-42).
  func isOrganizerEvent(o : Types.Opportunity) : Bool {
    o.id >= 43;
  };

  transient let anyP = Principal.fromText("aaaaa-aa");

  include Expose({
    entities = [
      OQL.Entity.manual<Types.Opportunity>("opportunity", func () = opportunities.values(), "Opportunity", "id")
        .sample({
          id = 0;
          title = "";
          organizer = "";
          category = #academic;
          description = "";
          venue = "";
          location = "";
          date = 0;
          duration = "";
          ageRange = "";
          cost = "";
          deadline = 0;
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
        })
        .payload("id", func o = o.id)
        .payload("title", func o = o.title)
        .payload("organizer", func o = o.organizer)
        .payload("category", func o = categoryToText(o.category))
        .payload("status", func o = statusToText(o.status))
        .payload("cost", func o = o.cost)
        .payload("date", func o = o.date)
        .payload("deadline", func o = o.deadline)
        .public_()
        .build(),
      OQL.Entity.manual<Types.Opportunity>("event", func () = opportunities.toArray().filter(isOrganizerEvent).values(), "Event", "id")
        .sample({
          id = 0;
          title = "";
          organizer = "";
          category = #academic;
          description = "";
          venue = "";
          location = "";
          date = 0;
          duration = "";
          ageRange = "";
          cost = "";
          deadline = 0;
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
        })
        .payload("id", func o = o.id)
        .payload("title", func o = o.title)
        .payload("organizer", func o = o.organizer)
        .payload("category", func o = categoryToText(o.category))
        .payload("status", func o = statusToText(o.status))
        .payload("cost", func o = o.cost)
        .payload("date", func o = o.date)
        .payload("deadline", func o = o.deadline)
        .public_()
        .build(),
      OQL.Entity.manual<(Common.UserId, [Types.Category])>("interest", func () = interests.entries(), "Interest", "user")
        .sample((anyP, [#academic]))
        .payload("user", func ((u, _)) = u)
        .payload("categories", func ((_, c)) = categoriesToText(c))
        .ownedBy("user")
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<(Common.UserId, Set.Set<Common.OpportunityId>)>("savedOpportunity", func () = savedLists.entries(), "SavedOpportunity", "user")
        .sample((anyP, Set.empty<Common.OpportunityId>()))
        .payload("user", func ((u, _)) = u)
        .payload("savedCount", func ((_, s)) = s.size())
        .payload("opportunityIds", func ((_, s)) = s.toArray().map(func id = id.toText()).values().join(","))
        .ownedBy("user")
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<(Common.UserId, OrgTypes.Organizer)>("organizer", func () = organizers.entries(), "Organizer", "id")
        .sample((anyP, { id = anyP; name = ""; createdAt = 0 }))
        .payload("id", func ((u, _)) = u)
        .payload("name", func ((_, org)) = org.name)
        .payload("createdAt", func ((_, org)) = org.createdAt)
        .ownedBy("id")
        .controllerOrScoped()
        .build(),
    ];
  });

  include CatalogApi(accessControlState, opportunities, savedLists, interests);
  include OrganizerEventsApi(accessControlState, opportunities, organizers, organizerEvents, eventState);
  include ApiDocMixin();
};
