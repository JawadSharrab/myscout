import { PocketIc, createIdentity } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

// A fixed non-anonymous identity to act as the signed-in caller. The backend
// gates organizer methods behind a signed-in (non-anonymous) caller, so the
// tests must present a real identity rather than the default anonymous one.
const ORGANIZER = createIdentity("amman-youth-hub-organizer");

// PocketIC actors expose `setIdentity` to choose who is calling; it is not
// part of the app's generated `_SERVICE` interface.
type PocketicActor = _SERVICE & { setIdentity: (identity: ReturnType<typeof createIdentity>) => void };

let pic: PocketIc | undefined;
let actor: PocketicActor;

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  const installed = await pic.setupCanister<_SERVICE>({ idlFactory, wasm: BACKEND_WASM });
  actor = installed.actor as PocketicActor;
});

afterAll(async () => {
  await pic?.tearDown();
});

it("seeds the full 42-opportunity catalog instead of trapping", async () => {
  const catalog = await actor.getCatalog();
  expect(catalog.length).toBe(42);
  expect(catalog[0]).toMatchObject({ title: "Amman Model United Nations" });
});

it("returns the 19 opportunity categories", async () => {
  const categories = await actor.getCategories();
  expect(categories.length).toBe(19);
});

it("looks up a single opportunity by id", async () => {
  const found = await actor.getOpportunity(1n);
  expect(found).not.toEqual([]);
  expect(found[0]).toMatchObject({ id: 1n, category: { academic: null } });
});

it("returns an empty option for an unknown opportunity id", async () => {
  expect(await actor.getOpportunity(9999n)).toEqual([]);
});

it("searches opportunities by keyword across title and description", async () => {
  const results = await actor.searchOpportunities("debate");
  expect(results.length).toBeGreaterThan(0);
  expect(results.every((o) => o.title.toLowerCase().includes("debate"))).toBe(true);
});

it("filters opportunities by category and status", async () => {
  const results = await actor.filterOpportunities({
    category: [{ academic: null }],
    cost: [],
    status: [{ open: null }],
  });
  expect(results.length).toBeGreaterThan(0);
  expect(results.every((o) => o.category.academic !== undefined)).toBe(true);
});

it("recommends opportunities in a given mode without trapping", async () => {
  const results = await actor.recommend({ highestRated: null });
  expect(results.length).toBe(42);
});

it("returns a factor-rating breakdown for an opportunity", async () => {
  const explanation = await actor.getRatingExplanation(1n);
  expect(explanation).not.toEqual([]);
  expect(explanation[0].factors.length).toBe(10);
  expect(explanation[0].overall).toBeGreaterThan(0);
});

it("signs up as an organizer and reports organizer status", async () => {
  // Present a non-anonymous identity, then register the caller as a signed-in
  // user (the app's sign-in flow does this via _initialize_access_control).
  actor.setIdentity(ORGANIZER);
  await actor._initialize_access_control();
  const profile = await actor.signUpAsOrganizer("Amman Youth Hub");
  expect(profile.name).toBe("Amman Youth Hub");
  expect(await actor.isOrganizer()).toBe(true);
  const fetched = await actor.getOrganizerProfile();
  expect(fetched).not.toEqual([]);
  expect(fetched[0].name).toBe("Amman Youth Hub");
});

it("creates an event that appears in the catalog and my events", async () => {
  actor.setIdentity(ORGANIZER);
  await actor._initialize_access_control();
  await actor.signUpAsOrganizer("Amman Youth Hub");
  const created = await actor.createEvent({
    title: "Amman Design Week 2026",
    venue: "Ras El Ain Gallery",
    cost: "Free",
    date: 1792238400000000000n,
    description: "A week of design talks and workshops.",
    deadline: 1791201600000000000n,
    category: { design: null },
    location: "Jabal Amman, Amman",
  });
  expect(created.title).toBe("Amman Design Week 2026");

  const myEvents = await actor.listMyEvents();
  expect(myEvents.some((e) => e.title === "Amman Design Week 2026")).toBe(true);

  const catalog = await actor.getCatalog();
  expect(catalog.some((e) => e.title === "Amman Design Week 2026")).toBe(true);
});
