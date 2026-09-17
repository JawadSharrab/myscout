import { HttpAgent } from "@icp-sdk/core/agent";
import { readFileSync } from "fs";
import { createRequire } from "module";
const require = createRequire("/app/src/frontend/");
const { idlFactory } = await import("/app/src/frontend/src/declarations/backend.did.js").catch(async e => {
  // fall back to require
  return require("/app/src/frontend/src/declarations/backend.did.js");
});
import { Actor } from "@icp-sdk/core/agent";
const canisterId = readFileSync("/tmp/pocketic-canister-id", "utf-8").trim();
const gwPort = readFileSync("/tmp/pocketic-gateway-port", "utf-8").trim();
const agent = await HttpAgent.create({ host: `http://127.0.0.1:${gwPort}` });
await agent.fetchRootKey();
const actor = Actor.createActor(idlFactory, { agent, canisterId });
try {
  const catalog = await actor.getCatalog();
  console.log("catalog length:", catalog.length);
  if (catalog.length > 0) {
    console.log("first:", catalog[0].title, "| organizer:", catalog[0].organizer, "| cost:", catalog[0].cost);
    console.log("last:", catalog[catalog.length-1].title);
  }
} catch (e) {
  console.error("getCatalog failed:", String(e).slice(0, 400));
}
process.exit(0);
