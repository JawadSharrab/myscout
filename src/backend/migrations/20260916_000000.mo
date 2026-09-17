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

  type Opportunity = {
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

  type UserId = Principal;

  type OldActor = {};

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    opportunities : List.List<Opportunity>;
    savedLists : Map.Map<UserId, Set.Set<Nat>>;
    interests : Map.Map<UserId, [Category]>;
  };

  public func migration(_old : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      opportunities = List.fromArray<Opportunity>([
        {
          id = 1;
          title = "Amman Model United Nations";
          organizer = "Amman International Academy";
          category = #academic;
          description = "A high-energy two-day simulation for students ready to negotiate, research and speak with purpose. Delegates work in committees on live regional issues, then defend their resolutions in a formal General Assembly.";
          venue = "Amman International Academy";
          location = "Dabouq, Amman";
          date = 1792238400000000000;
          duration = "2 days";
          ageRange = "15–20";
          cost = "35 JOD";
          deadline = 1791201600000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4.5;
            skillDevelopment = 4.5;
            worthYourTime = 4.4;
            recognition = 4.2;
            leadership = 4.1;
            networking = 4.5;
            difficulty = 3.8;
            timeCommitment = 3.6;
            priceValue = 4.2;
            relevance = 4.6;
          };
          status = #open;
          distanceKm = 7.4;
          marker = { x = 26.0; y = 32.0 };
          isPrototype = false;
        },
        {
          id = 2;
          title = "Makers of Jordan: Future Lab";
          organizer = "ZINC at King Hussein Business Park";
          category = #academic;
          description = "A hands-on afternoon with local builders, designers and founders. Learn rapid prototyping, test a small idea and leave with a team-built object you can keep iterating.";
          venue = "ZINC, King Hussein Business Park";
          location = "Al Madina Al Munawwara St.";
          date = 1790424000000000000;
          duration = "4 hours";
          ageRange = "16–20";
          cost = "Free";
          deadline = 1789905600000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4.1;
            skillDevelopment = 4.6;
            worthYourTime = 4.2;
            recognition = 3.3;
            leadership = 3.9;
            networking = 4.4;
            difficulty = 3.4;
            timeCommitment = 4.7;
            priceValue = 5;
            relevance = 4.7;
          };
          status = #closingSoon;
          distanceKm = 5.1;
          marker = { x = 38.0; y = 23.0 };
          isPrototype = false;
        },
        {
          id = 3;
          title = "The Knowledge Initiative Debate Open";
          organizer = "The Knowledge Initiative";
          category = #debate;
          description = "An accessible British Parliamentary debate open with coaching rounds for first-time speakers. Bring curiosity, not a perfect record; feedback is built into every round.";
          venue = "Shoman Cultural Centre";
          location = "Jabal Amman";
          date = 1791115200000000000;
          duration = "1 day";
          ageRange = "15–20";
          cost = "10 JOD";
          deadline = 1790769600000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 3.8;
            skillDevelopment = 4.6;
            worthYourTime = 4.2;
            recognition = 3.4;
            leadership = 4.1;
            networking = 4.2;
            difficulty = 4.1;
            timeCommitment = 4.2;
            priceValue = 4.8;
            relevance = 4.4;
          };
          status = #open;
          distanceKm = 2.8;
          marker = { x = 48.0; y = 51.0 };
          isPrototype = false;
        },
        {
          id = 4;
          title = "Wadi Al-Seer Food Forest Day";
          organizer = "Nahno Jordan";
          category = #volunteering;
          description = "Spend a useful Saturday planting and tending a community food forest. The day includes a short ecology briefing, team work and lunch around the fire.";
          venue = "Wadi Al-Seer Community Farm";
          location = "Wadi Al-Seer";
          date = 1789819200000000000;
          duration = "6 hours";
          ageRange = "15–20";
          cost = "Free";
          deadline = 1789560000000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4.1;
            skillDevelopment = 3.8;
            worthYourTime = 4.3;
            recognition = 3.1;
            leadership = 4.1;
            networking = 4.3;
            difficulty = 2.4;
            timeCommitment = 4.2;
            priceValue = 5;
            relevance = 4.4;
          };
          status = #closingSoon;
          distanceKm = 9.8;
          marker = { x = 18.0; y = 60.0 };
          isPrototype = false;
        },
        {
          id = 5;
          title = "Girls Code Amman: Build Night";
          organizer = "Girls in Tech Jordan";
          category = #competition;
          description = "A friendly build night where small teams make a digital prototype for a real community prompt. Mentors help you move from a rough idea to a clear, clickable demo.";
          venue = "Luminus Technical University College";
          location = "Marka, Amman";
          date = 1792843200000000000;
          duration = "5 hours";
          ageRange = "15–20";
          cost = "Free";
          deadline = 1792065600000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4.5;
            skillDevelopment = 4.6;
            worthYourTime = 4.5;
            recognition = 3.8;
            leadership = 4.3;
            networking = 4.6;
            difficulty = 3.9;
            timeCommitment = 4.1;
            priceValue = 5;
            relevance = 4.7;
          };
          status = #open;
          distanceKm = 8.2;
          marker = { x = 74.0; y = 40.0 };
          isPrototype = false;
        },
        {
          id = 6;
          title = "Write Amman: Street Notes";
          organizer = "Abdul Hameed Shoman Foundation";
          category = #arts;
          description = "A one-day creative writing studio about noticing the city. Walk, collect fragments, then shape them into a short piece with two published Jordanian writers.";
          venue = "Shoman Public Library";
          location = "Jabal Amman";
          date = 1793620800000000000;
          duration = "3 hours";
          ageRange = "15–20";
          cost = "Free";
          deadline = 1792929600000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 3.7;
            skillDevelopment = 4.3;
            worthYourTime = 4;
            recognition = 3.2;
            leadership = 3.4;
            networking = 4;
            difficulty = 2.8;
            timeCommitment = 4.8;
            priceValue = 5;
            relevance = 4.5;
          };
          status = #open;
          distanceKm = 3.1;
          marker = { x = 53.0; y = 63.0 };
          isPrototype = false;
        },
        {
          id = 7;
          title = "Jordan Youth Leadership Forum";
          organizer = "Crown Prince Foundation";
          category = #leadership;
          description = "A focused forum for students who want to lead without performing leadership. Hear from young Jordanian changemakers, workshop a local challenge and build a 30-day action plan.";
          venue = "King Hussein bin Talal Convention Centre";
          location = "Dead Sea (Amman area)";
          date = 1794830400000000000;
          duration = "1 day";
          ageRange = "16–20";
          cost = "Free";
          deadline = 1793707200000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4.6;
            skillDevelopment = 4.3;
            worthYourTime = 4.5;
            recognition = 4.1;
            leadership = 4.6;
            networking = 4.5;
            difficulty = 3.1;
            timeCommitment = 4.4;
            priceValue = 5;
            relevance = 4.7;
          };
          status = #open;
          distanceKm = 29.4;
          marker = { x = 58.0; y = 86.0 };
          isPrototype = false;
        },
        {
          id = 8;
          title = "Amman 10K Youth Run";
          organizer = "Run Jordan";
          category = #athletics;
          description = "A welcoming timed run through the city with a dedicated youth wave. Train with the community, chase a personal best or simply make your Saturday feel bigger.";
          venue = "Al Hussein Public Parks";
          location = "Al Hussein Gardens";
          date = 1791720000000000000;
          duration = "Morning";
          ageRange = "15–20";
          cost = "15 JOD";
          deadline = 1790856000000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 3.1;
            skillDevelopment = 3.3;
            worthYourTime = 3.8;
            recognition = 3.1;
            leadership = 3.1;
            networking = 4.2;
            difficulty = 3.7;
            timeCommitment = 4.6;
            priceValue = 4.1;
            relevance = 3.9;
          };
          status = #open;
          distanceKm = 6.7;
          marker = { x = 34.0; y = 13.0 };
          isPrototype = false;
        },
        {
          id = 9;
          title = "Design for Good: Public Space Sprint";
          organizer = "Makan Art Space";
          category = #conference;
          description = "A compact design sprint exploring how a corner of Amman could work better for young people. Teams sketch, interview and present one practical public-space idea.";
          venue = "Makan Art Space";
          location = "Jabal Weibdeh";
          date = 1794225600000000000;
          duration = "7 hours";
          ageRange = "16–20";
          cost = "12 JOD";
          deadline = 1793534400000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4.2;
            skillDevelopment = 4.6;
            worthYourTime = 4.3;
            recognition = 3.4;
            leadership = 4.3;
            networking = 4.4;
            difficulty = 3.6;
            timeCommitment = 3.8;
            priceValue = 4.6;
            relevance = 4.7;
          };
          status = #open;
          distanceKm = 3.9;
          marker = { x = 57.0; y = 46.0 };
          isPrototype = false;
        },
        {
          id = 10;
          title = "Jordan Robotics Cup — Junior Track";
          organizer = "Jordan Engineers Association";
          category = #competition;
          description = "Build, test and drive a robot through an obstacle course in a one-day junior competition. Teams can bring a working build or join a guided challenge on site.";
          venue = "Jordan Engineers Association";
          location = "Shmeisani, Amman";
          date = 1796558400000000000;
          duration = "1 day";
          ageRange = "15–19";
          cost = "20 JOD";
          deadline = 1795348800000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4.8;
            skillDevelopment = 4.7;
            worthYourTime = 4.6;
            recognition = 4.4;
            leadership = 4.1;
            networking = 4.3;
            difficulty = 4.4;
            timeCommitment = 3.2;
            priceValue = 4.4;
            relevance = 4.6;
          };
          status = #open;
          distanceKm = 4.5;
          marker = { x = 65.0; y = 34.0 };
          isPrototype = false;
        },
        {
          id = 11;
          title = "Amman Short Film Night";
          organizer = "Rainbow Street Film Club";
          category = #culture;
          description = "A small, generous screening night for new Jordanian short films followed by an open conversation with directors and editors. Come to watch, stay to ask better questions.";
          venue = "Rainbow Theatre";
          location = "Rainbow Street";
          date = 1797681600000000000;
          duration = "3 hours";
          ageRange = "15–20";
          cost = "5 JOD";
          deadline = 1797595200000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 2.6;
            skillDevelopment = 3.2;
            worthYourTime = 3.4;
            recognition = 2.7;
            leadership = 2.7;
            networking = 3.9;
            difficulty = 1.8;
            timeCommitment = 4.8;
            priceValue = 4.7;
            relevance = 3.8;
          };
          status = #open;
          distanceKm = 2.4;
          marker = { x = 45.0; y = 59.0 };
          isPrototype = false;
        },
        {
          id = 12;
          title = "Winter Community Kitchen";
          organizer = "Tkiyet Um Ali";
          category = #volunteering;
          description = "A practical evening helping prep and pack warm meals for families across Amman. A small way to leave a room warmer than you found it.";
          venue = "Tkiyet Um Ali Community Kitchen";
          location = "Al Muqabalain, Amman";
          date = 1786017600000000000;
          duration = "4 hours";
          ageRange = "15–20";
          cost = "Free";
          deadline = 1785672000000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 3.8;
            skillDevelopment = 3.5;
            worthYourTime = 4.2;
            recognition = 2.6;
            leadership = 3.6;
            networking = 3.9;
            difficulty = 2.2;
            timeCommitment = 4.3;
            priceValue = 5;
            relevance = 4.4;
          };
          status = #closed;
          distanceKm = 11.6;
          marker = { x = 69.0; y = 73.0 };
          isPrototype = false;
        },
        {
          id = 13;
          title = "Amman Logic League";
          organizer = "Demo · North Star Academic Collective";
          category = #academic;
          description = "A timed team challenge built around logic, data interpretation and clear written reasoning. Students receive a score report after the final round.";
          venue = "Al Hussein Cultural Centre";
          location = "Ras Al Ain, Amman";
          date = 1790510400000000000;
          duration = "5 hours";
          ageRange = "15–19";
          cost = "8 JOD";
          deadline = 1789905600000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4.2;
            skillDevelopment = 4.4;
            worthYourTime = 4.1;
            recognition = 3.2;
            leadership = 3.1;
            networking = 3.5;
            difficulty = 4.2;
            timeCommitment = 4.3;
            priceValue = 4.3;
            relevance = 4.4;
          };
          status = #closingSoon;
          distanceKm = 3.6;
          marker = { x = 39.0; y = 42.0 };
          isPrototype = true;
        },
        {
          id = 14;
          title = "Amman Debate Invitational";
          organizer = "Demo · Cedar Debate Society";
          category = #debate;
          description = "A judged British Parliamentary tournament with a novice room and structured feedback after every round. Strong speakers are stretched without leaving first-timers behind.";
          venue = "The University of Jordan";
          location = "University Street, Amman";
          date = 1791633600000000000;
          duration = "1 day";
          ageRange = "15–20";
          cost = "12 JOD";
          deadline = 1790942400000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4.3;
            skillDevelopment = 4.6;
            worthYourTime = 4.2;
            recognition = 3.5;
            leadership = 4;
            networking = 4.2;
            difficulty = 4.3;
            timeCommitment = 4;
            priceValue = 4.1;
            relevance = 4.5;
          };
          status = #open;
          distanceKm = 8.8;
          marker = { x = 61.0; y = 25.0 };
          isPrototype = true;
        },
        {
          id = 15;
          title = "Youth Policy Lab: Water & Cities";
          organizer = "Demo · Civic Futures Jordan";
          category = #leadership;
          description = "A three-session policy lab where students investigate a local water challenge, interview stakeholders and present a practical recommendation to a review panel.";
          venue = "Innovation Hub Amman";
          location = "King Hussein Business Park";
          date = 1792324800000000000;
          duration = "3 sessions";
          ageRange = "16–20";
          cost = "Free";
          deadline = 1791460800000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4.6;
            skillDevelopment = 4.5;
            worthYourTime = 4.4;
            recognition = 3.3;
            leadership = 4.7;
            networking = 4.2;
            difficulty = 3.9;
            timeCommitment = 3.3;
            priceValue = 5;
            relevance = 4.8;
          };
          status = #open;
          distanceKm = 6.2;
          marker = { x = 33.0; y = 17.0 };
          isPrototype = true;
        },
        {
          id = 16;
          title = "Code for Community Sprint";
          organizer = "Demo · Open Door Code Lab";
          category = #coding;
          description = "A weekend team sprint for students who want to build a small web tool for a community brief. Mentors help teams scope, prototype and demo their work.";
          venue = "TechWorks Studio";
          location = "Jabal Al Hussein, Amman";
          date = 1792843200000000000;
          duration = "2 days";
          ageRange = "15–20";
          cost = "Free";
          deadline = 1791979200000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4.5;
            skillDevelopment = 4.7;
            worthYourTime = 4.4;
            recognition = 3;
            leadership = 4.1;
            networking = 4.5;
            difficulty = 4;
            timeCommitment = 3.1;
            priceValue = 5;
            relevance = 4.7;
          };
          status = #open;
          distanceKm = 4.2;
          marker = { x = 48.0; y = 31.0 };
          isPrototype = true;
        },
        {
          id = 17;
          title = "Student Startup Sprint";
          organizer = "Demo · First Pitch Amman";
          category = #entrepreneurship;
          description = "A practical introduction to customer interviews, problem framing and pitching. Teams leave with a one-page concept and a short presentation, not a promise of funding.";
          venue = "The Tank by Umniah";
          location = "King Hussein Business Park";
          date = 1794052800000000000;
          duration = "1 day";
          ageRange = "16–20";
          cost = "15 JOD";
          deadline = 1793188800000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4.1;
            skillDevelopment = 4.3;
            worthYourTime = 4;
            recognition = 2.9;
            leadership = 4.2;
            networking = 4.3;
            difficulty = 3.6;
            timeCommitment = 4.1;
            priceValue = 3.7;
            relevance = 4.2;
          };
          status = #open;
          distanceKm = 6.1;
          marker = { x = 30.0; y = 36.0 };
          isPrototype = true;
        },
        {
          id = 18;
          title = "Research Question Studio";
          organizer = "Demo · Amman Inquiry Project";
          category = #academic;
          description = "A focused workshop for students learning how to turn a broad interest into a researchable question, a simple method and a short annotated bibliography.";
          venue = "Shoman Public Library";
          location = "Jabal Amman";
          date = 1790769600000000000;
          duration = "3 hours";
          ageRange = "16–20";
          cost = "Free";
          deadline = 1790337600000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4;
            skillDevelopment = 4.5;
            worthYourTime = 4.1;
            recognition = 2.5;
            leadership = 2.9;
            networking = 3.6;
            difficulty = 2.7;
            timeCommitment = 4.7;
            priceValue = 5;
            relevance = 4.6;
          };
          status = #closingSoon;
          distanceKm = 3.1;
          marker = { x = 54.0; y = 68.0 };
          isPrototype = true;
        },
        {
          id = 19;
          title = "Makers Design Sprint";
          organizer = "Demo · Workshop 27";
          category = #design;
          description = "A short design sprint around an everyday access problem. Students interview, sketch, test and present a prototype with guidance from working designers.";
          venue = "Makerspace Amman";
          location = "Al Madina Al Munawwara St.";
          date = 1793448000000000000;
          duration = "6 hours";
          ageRange = "15–20";
          cost = "10 JOD";
          deadline = 1792670400000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4;
            skillDevelopment = 4.6;
            worthYourTime = 4.2;
            recognition = 2.8;
            leadership = 3.8;
            networking = 4.1;
            difficulty = 3.2;
            timeCommitment = 4;
            priceValue = 4.2;
            relevance = 4.7;
          };
          status = #open;
          distanceKm = 5.3;
          marker = { x = 71.0; y = 28.0 };
          isPrototype = true;
        },
        {
          id = 20;
          title = "Public Speaking Atelier";
          organizer = "Demo · Speak Clearly Amman";
          category = #debate;
          description = "A small-group practice room for students who want to become clearer, calmer speakers. Each participant records a short talk and receives specific coaching.";
          venue = "The Learning Lounge";
          location = "Sweifieh, Amman";
          date = 1791028800000000000;
          duration = "4 hours";
          ageRange = "15–20";
          cost = "8 JOD";
          deadline = 1790424000000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 3.7;
            skillDevelopment = 4.4;
            worthYourTime = 4;
            recognition = 2.4;
            leadership = 3.8;
            networking = 3.4;
            difficulty = 3.1;
            timeCommitment = 4.5;
            priceValue = 4.2;
            relevance = 4.5;
          };
          status = #open;
          distanceKm = 7.5;
          marker = { x = 80.0; y = 48.0 };
          isPrototype = true;
        },
        {
          id = 21;
          title = "Green Amman Weekend";
          organizer = "Demo · Neighbourhood Ecology Network";
          category = #community;
          description = "A hands-on community service weekend mapping shade, litter and planting needs around a public space before working with residents on a small improvement.";
          venue = "Al Hussein Public Parks";
          location = "Al Hussein, Amman";
          date = 1792238400000000000;
          duration = "2 days";
          ageRange = "15–20";
          cost = "Free";
          deadline = 1791633600000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 3.9;
            skillDevelopment = 3.7;
            worthYourTime = 4.1;
            recognition = 2.6;
            leadership = 4;
            networking = 4;
            difficulty = 2.6;
            timeCommitment = 3.4;
            priceValue = 5;
            relevance = 4.1;
          };
          status = #open;
          distanceKm = 7.1;
          marker = { x = 19.0; y = 53.0 };
          isPrototype = true;
        },
        {
          id = 22;
          title = "Future Cities Student Conference";
          organizer = "Demo · Urban Tomorrow Forum";
          category = #conference;
          description = "A one-day student conference on transport, public space and climate adaptation, with short talks and a challenge session built around Amman.";
          venue = "Royal Cultural Center";
          location = "Shmeisani, Amman";
          date = 1794657600000000000;
          duration = "1 day";
          ageRange = "15–20";
          cost = "5 JOD";
          deadline = 1793880000000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 3.5;
            skillDevelopment = 3.6;
            worthYourTime = 3.8;
            recognition = 2.7;
            leadership = 3.2;
            networking = 4;
            difficulty = 2.4;
            timeCommitment = 4.5;
            priceValue = 4.8;
            relevance = 4.4;
          };
          status = #open;
          distanceKm = 4.7;
          marker = { x = 64.0; y = 54.0 };
          isPrototype = true;
        },
        {
          id = 23;
          title = "Women in STEM: Build a Better Brief";
          organizer = "Demo · Orbit STEM Circle";
          category = #academic;
          description = "A practical day of short experiments, engineering stories and a team challenge for students curious about science and technical problem-solving.";
          venue = "Princess Sumaya University campus";
          location = "Al Jubaiha, Amman";
          date = 1791547200000000000;
          duration = "1 day";
          ageRange = "15–20";
          cost = "Free";
          deadline = 1790856000000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 3.8;
            skillDevelopment = 4.2;
            worthYourTime = 4;
            recognition = 2.8;
            leadership = 3.4;
            networking = 4.1;
            difficulty = 3.1;
            timeCommitment = 4.1;
            priceValue = 5;
            relevance = 4.5;
          };
          status = #open;
          distanceKm = 10.4;
          marker = { x = 77.0; y = 20.0 };
          isPrototype = true;
        },
        {
          id = 24;
          title = "Student Journal Workshop";
          organizer = "Demo · Paper Lantern Editors";
          category = #creative;
          description = "Learn to pitch, edit and publish a short reported piece with an editorial team. The focus is on curiosity, evidence and useful feedback.";
          venue = "Dar Al-Anda";
          location = "Jabal Al-Weibdeh, Amman";
          date = 1792843200000000000;
          duration = "4 hours";
          ageRange = "15–20";
          cost = "7 JOD";
          deadline = 1792238400000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 3.9;
            skillDevelopment = 4.5;
            worthYourTime = 4.2;
            recognition = 2.4;
            leadership = 3.2;
            networking = 3.8;
            difficulty = 2.8;
            timeCommitment = 4.2;
            priceValue = 4.3;
            relevance = 4.7;
          };
          status = #open;
          distanceKm = 1.9;
          marker = { x = 41.0; y = 73.0 };
          isPrototype = true;
        },
        {
          id = 25;
          title = "Beginner Climb Club Day";
          organizer = "Demo · Limestone Outdoor Club";
          category = #athletics;
          description = "An encouraging introduction to indoor climbing with safety basics, route reading and a low-pressure challenge ladder for first-timers.";
          venue = "Climb Amman";
          location = "Abdoun, Amman";
          date = 1790424000000000000;
          duration = "3 hours";
          ageRange = "15–20";
          cost = "12 JOD";
          deadline = 1789819200000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 2.7;
            skillDevelopment = 3.7;
            worthYourTime = 3.8;
            recognition = 2.1;
            leadership = 2.8;
            networking = 3.9;
            difficulty = 3.4;
            timeCommitment = 4.6;
            priceValue = 3.9;
            relevance = 3.3;
          };
          status = #closingSoon;
          distanceKm = 5.8;
          marker = { x = 84.0; y = 67.0 };
          isPrototype = true;
        },
        {
          id = 26;
          title = "Service Learning Workshop";
          organizer = "Demo · Hands On Amman";
          category = #creative;
          description = "A practical session on choosing a community project, setting a measurable goal and reflecting on impact without turning service into a line on a CV.";
          venue = "Youth Hub Downtown";
          location = "Downtown Amman";
          date = 1792152000000000000;
          duration = "3 hours";
          ageRange = "15–20";
          cost = "Free";
          deadline = 1791547200000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4.1;
            skillDevelopment = 4.1;
            worthYourTime = 4.3;
            recognition = 2.2;
            leadership = 4.2;
            networking = 3.8;
            difficulty = 2.5;
            timeCommitment = 4.5;
            priceValue = 5;
            relevance = 4.5;
          };
          status = #open;
          distanceKm = 2.2;
          marker = { x = 52.0; y = 45.0 };
          isPrototype = true;
        },
        {
          id = 27;
          title = "Global Health MUN Simulation";
          organizer = "Demo · Meridian MUN Network";
          category = #academic;
          description = "A compact committee simulation on health equity and crisis response, designed for students who want a first serious taste of MUN research and negotiation.";
          venue = "Amman National School";
          location = "Khalda, Amman";
          date = 1795262400000000000;
          duration = "1 day";
          ageRange = "15–20";
          cost = "18 JOD";
          deadline = 1794312000000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4.2;
            skillDevelopment = 4.3;
            worthYourTime = 4;
            recognition = 3;
            leadership = 3.9;
            networking = 4.1;
            difficulty = 3.8;
            timeCommitment = 4.2;
            priceValue = 3.7;
            relevance = 4.6;
          };
          status = #open;
          distanceKm = 9.6;
          marker = { x = 25.0; y = 30.0 };
          isPrototype = true;
        },
        {
          id = 28;
          title = "Jordan Math Challenge — Open Round";
          organizer = "Demo · Quant Jordan";
          category = #academic;
          description = "An individual problem-solving round for students who enjoy unfamiliar questions, careful proofs and comparing approaches with other young mathematicians.";
          venue = "The University of Jordan";
          location = "University Street, Amman";
          date = 1795867200000000000;
          duration = "4 hours";
          ageRange = "15–20";
          cost = "5 JOD";
          deadline = 1794916800000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4.5;
            skillDevelopment = 4.7;
            worthYourTime = 4.2;
            recognition = 3.2;
            leadership = 2.2;
            networking = 3.3;
            difficulty = 4.7;
            timeCommitment = 4.4;
            priceValue = 4.8;
            relevance = 4.4;
          };
          status = #open;
          distanceKm = 8.8;
          marker = { x = 68.0; y = 12.0 };
          isPrototype = true;
        },
        {
          id = 29;
          title = "Young Founders Pitch Night";
          organizer = "Demo · Seedling Ventures Lab";
          category = #entrepreneurship;
          description = "A supportive pitch night where students explain a problem, show a small prototype and answer questions from a volunteer panel.";
          venue = "ZINC, King Hussein Business Park";
          location = "Al Madina Al Munawwara St.";
          date = 1796472000000000000;
          duration = "4 hours";
          ageRange = "16–20";
          cost = "10 JOD";
          deadline = 1795694400000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4.1;
            skillDevelopment = 4.2;
            worthYourTime = 3.9;
            recognition = 2.5;
            leadership = 4.1;
            networking = 4.5;
            difficulty = 3.4;
            timeCommitment = 4.2;
            priceValue = 4.1;
            relevance = 4.2;
          };
          status = #open;
          distanceKm = 6.3;
          marker = { x = 36.0; y = 39.0 };
          isPrototype = true;
        },
        {
          id = 30;
          title = "Robotics Build Clinic";
          organizer = "Demo · Circuit House Jordan";
          category = #coding;
          description = "A guided clinic for teams preparing a basic robot: sensors, control logic and documentation are all part of the challenge.";
          venue = "Circuit House Lab";
          location = "Marka, Amman";
          date = 1793361600000000000;
          duration = "6 hours";
          ageRange = "15–19";
          cost = "15 JOD";
          deadline = 1792411200000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4.6;
            skillDevelopment = 4.8;
            worthYourTime = 4.4;
            recognition = 3.1;
            leadership = 3.7;
            networking = 4;
            difficulty = 4.2;
            timeCommitment = 3.5;
            priceValue = 3.6;
            relevance = 4.8;
          };
          status = #open;
          distanceKm = 8.2;
          marker = { x = 73.0; y = 38.0 };
          isPrototype = true;
        },
        {
          id = 31;
          title = "Climate Data Lab";
          organizer = "Demo · Field Notes Research Group";
          category = #academic;
          description = "Work with a small public dataset to ask a climate question, make a clear chart and explain what the evidence can and cannot tell you.";
          venue = "Orange Jordan Lab";
          location = "Al Abdali, Amman";
          date = 1794052800000000000;
          duration = "5 hours";
          ageRange = "16–20";
          cost = "Free";
          deadline = 1793275200000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4.4;
            skillDevelopment = 4.6;
            worthYourTime = 4.2;
            recognition = 2.6;
            leadership = 3;
            networking = 3.7;
            difficulty = 3.8;
            timeCommitment = 3.8;
            priceValue = 5;
            relevance = 4.8;
          };
          status = #open;
          distanceKm = 4.4;
          marker = { x = 58.0; y = 23.0 };
          isPrototype = true;
        },
        {
          id = 32;
          title = "Campus Voices Showcase";
          organizer = "Demo · The Speaking Room";
          category = #debate;
          description = "Students shape a five-minute talk on a question they care about, workshop it with peers and present it to a small audience.";
          venue = "The Rainbow Theatre";
          location = "Rainbow Street, Amman";
          date = 1794657600000000000;
          duration = "1 day";
          ageRange = "15–20";
          cost = "Free";
          deadline = 1793793600000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 3.9;
            skillDevelopment = 4.5;
            worthYourTime = 4.1;
            recognition = 2.5;
            leadership = 3.8;
            networking = 4.1;
            difficulty = 3.3;
            timeCommitment = 3.9;
            priceValue = 5;
            relevance = 4.6;
          };
          status = #open;
          distanceKm = 2.5;
          marker = { x = 47.0; y = 55.0 };
          isPrototype = true;
        },
        {
          id = 33;
          title = "Community Garden Saturday";
          organizer = "Demo · Shmeisani Neighbourhood Table";
          category = #volunteering;
          description = "Help revive a small shared garden through planting, composting and a short planning session with residents about what happens next.";
          venue = "Shmeisani Community Garden";
          location = "Shmeisani, Amman";
          date = 1791028800000000000;
          duration = "5 hours";
          ageRange = "15–20";
          cost = "Free";
          deadline = 1790510400000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 3.6;
            skillDevelopment = 3.5;
            worthYourTime = 4;
            recognition = 2.1;
            leadership = 3.8;
            networking = 4;
            difficulty = 2.1;
            timeCommitment = 4.2;
            priceValue = 5;
            relevance = 3.9;
          };
          status = #open;
          distanceKm = 4.9;
          marker = { x = 63.0; y = 62.0 };
          isPrototype = true;
        },
        {
          id = 34;
          title = "Design Portfolio Clinic";
          organizer = "Demo · Studio North Amman";
          category = #design;
          description = "A critique-led session for students building a first portfolio. Bring two projects and leave with a clearer case-study story for each one.";
          venue = "Studio North";
          location = "Jabal Al-Weibdeh, Amman";
          date = 1795262400000000000;
          duration = "4 hours";
          ageRange = "16–20";
          cost = "12 JOD";
          deadline = 1794484800000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4.3;
            skillDevelopment = 4.5;
            worthYourTime = 4.2;
            recognition = 2.7;
            leadership = 3.2;
            networking = 4;
            difficulty = 3;
            timeCommitment = 4.1;
            priceValue = 3.8;
            relevance = 4.9;
          };
          status = #open;
          distanceKm = 1.8;
          marker = { x = 37.0; y = 76.0 };
          isPrototype = true;
        },
        {
          id = 35;
          title = "Amman Chess Open — Youth Board";
          organizer = "Demo · Jordan Board Collective";
          category = #athletics;
          description = "A friendly youth tournament with timed rounds, a quiet analysis corner and a short closing lesson on reviewing your own games.";
          venue = "Sports City Club";
          location = "Al Hussein Sports City, Amman";
          date = 1792843200000000000;
          duration = "1 day";
          ageRange = "15–20";
          cost = "6 JOD";
          deadline = 1792065600000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 3;
            skillDevelopment = 4;
            worthYourTime = 3.8;
            recognition = 2.8;
            leadership = 2.6;
            networking = 3.8;
            difficulty = 4.1;
            timeCommitment = 3.8;
            priceValue = 4.6;
            relevance = 3.5;
          };
          status = #open;
          distanceKm = 8.1;
          marker = { x = 88.0; y = 27.0 };
          isPrototype = true;
        },
        {
          id = 36;
          title = "Digital Storytelling Lab";
          organizer = "Demo · Frame by Frame Amman";
          category = #arts;
          description = "A one-day lab on visual narrative, interview technique and simple editing. Students leave with a one-minute story draft.";
          venue = "Film House Amman";
          location = "Jabal Amman";
          date = 1795867200000000000;
          duration = "1 day";
          ageRange = "15–20";
          cost = "10 JOD";
          deadline = 1795003200000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 3.4;
            skillDevelopment = 4.2;
            worthYourTime = 4;
            recognition = 2.4;
            leadership = 3.1;
            networking = 3.9;
            difficulty = 2.9;
            timeCommitment = 4;
            priceValue = 4.1;
            relevance = 4.5;
          };
          status = #open;
          distanceKm = 3.2;
          marker = { x = 55.0; y = 80.0 };
          isPrototype = true;
        },
        {
          id = 37;
          title = "Career Conversations: Real First Steps";
          organizer = "Demo · Pathways Youth Network";
          category = #creative;
          description = "A candid workshop on finding a first project, asking for feedback and turning curiosity into an experiment before choosing a university path.";
          venue = "Crown Prince Foundation Space";
          location = "Abdali, Amman";
          date = 1791633600000000000;
          duration = "3 hours";
          ageRange = "15–20";
          cost = "Free";
          deadline = 1791115200000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 3.3;
            skillDevelopment = 3.6;
            worthYourTime = 3.7;
            recognition = 2.1;
            leadership = 3.1;
            networking = 4;
            difficulty = 1.8;
            timeCommitment = 4.8;
            priceValue = 5;
            relevance = 4.2;
          };
          status = #open;
          distanceKm = 4.2;
          marker = { x = 69.0; y = 49.0 };
          isPrototype = true;
        },
        {
          id = 38;
          title = "Student Civic Assembly";
          organizer = "Demo · Common Ground Amman";
          category = #leadership;
          description = "A facilitated student assembly where participants examine a local issue, practice consensus-building and publish a shared set of next steps.";
          venue = "Civic Lab Amman";
          location = "Downtown Amman";
          date = 1797076800000000000;
          duration = "1 day";
          ageRange = "16–20";
          cost = "Free";
          deadline = 1796212800000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4.5;
            skillDevelopment = 4.4;
            worthYourTime = 4.2;
            recognition = 2.5;
            leadership = 4.6;
            networking = 4.3;
            difficulty = 3.5;
            timeCommitment = 3.9;
            priceValue = 5;
            relevance = 4.7;
          };
          status = #open;
          distanceKm = 2.4;
          marker = { x = 28.0; y = 58.0 };
          isPrototype = true;
        },
        {
          id = 39;
          title = "Physics Problem-Solving Room";
          organizer = "Demo · Vector Study Circle";
          category = #academic;
          description = "A quiet, collaborative session for students who enjoy hard physics questions and explaining their reasoning to others.";
          venue = "The Learning Lounge";
          location = "Sweifieh, Amman";
          date = 1796472000000000000;
          duration = "4 hours";
          ageRange = "15–20";
          cost = "Free";
          deadline = 1795780800000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4.2;
            skillDevelopment = 4.5;
            worthYourTime = 4;
            recognition = 2.2;
            leadership = 2.6;
            networking = 3.4;
            difficulty = 4.5;
            timeCommitment = 4.2;
            priceValue = 5;
            relevance = 4.5;
          };
          status = #open;
          distanceKm = 7.6;
          marker = { x = 79.0; y = 71.0 };
          isPrototype = true;
        },
        {
          id = 40;
          title = "Young Curators: Build an Exhibition";
          organizer = "Demo · Small Room Arts Collective";
          category = #arts;
          description = "Students select a theme, make a small curatorial plan and install a collaborative wall exhibition with a local artist.";
          venue = "Dar Al-Anda";
          location = "Jabal Al-Weibdeh, Amman";
          date = 1797681600000000000;
          duration = "2 days";
          ageRange = "15–20";
          cost = "15 JOD";
          deadline = 1796731200000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 3.8;
            skillDevelopment = 4.3;
            worthYourTime = 4.1;
            recognition = 2.5;
            leadership = 4;
            networking = 4.2;
            difficulty = 3.1;
            timeCommitment = 3.5;
            priceValue = 3.7;
            relevance = 4.8;
          };
          status = #open;
          distanceKm = 1.7;
          marker = { x = 31.0; y = 86.0 };
          isPrototype = true;
        },
        {
          id = 41;
          title = "Girls Lead Project Camp";
          organizer = "Demo · Levant Youth Initiative";
          category = #leadership;
          description = "A two-day project camp where participants identify a school or neighbourhood issue and plan a small, measurable response with peers.";
          venue = "Youth Hub West Amman";
          location = "Dabouq, Amman";
          date = 1796990400000000000;
          duration = "2 days";
          ageRange = "15–20";
          cost = "10 JOD";
          deadline = 1796040000000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 4.4;
            skillDevelopment = 4.3;
            worthYourTime = 4.2;
            recognition = 2.6;
            leadership = 4.7;
            networking = 4.3;
            difficulty = 3.2;
            timeCommitment = 3.4;
            priceValue = 4.1;
            relevance = 4.7;
          };
          status = #open;
          distanceKm = 7.8;
          marker = { x = 14.0; y = 34.0 };
          isPrototype = true;
        },
        {
          id = 42;
          title = "Language Exchange Facilitation Lab";
          organizer = "Demo · Open Table Amman";
          category = #culture;
          description = "Practice inclusive facilitation by hosting small conversation rounds for students from different language backgrounds.";
          venue = "Jabal Amman Community House";
          location = "Jabal Amman";
          date = 1792238400000000000;
          duration = "3 hours";
          ageRange = "15–20";
          cost = "Free";
          deadline = 1791720000000000000;
          registrationUrl = null;
          applyUrl = null;
          factorRatings = {
            uniApplicationValue = 3.2;
            skillDevelopment = 3.9;
            worthYourTime = 3.8;
            recognition = 1.9;
            leadership = 3.7;
            networking = 4.4;
            difficulty = 2.4;
            timeCommitment = 4.6;
            priceValue = 5;
            relevance = 4;
          };
          status = #open;
          distanceKm = 3.4;
          marker = { x = 45.0; y = 40.0 };
          isPrototype = true;
        },
      ]);
      savedLists = Map.empty();
      interests = Map.empty();
    };
  };
};
