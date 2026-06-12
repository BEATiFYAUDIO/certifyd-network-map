import assert from "node:assert/strict";
import {
  areaProviderCountLabel,
  areaProviderSummaries,
  mappableAreas,
  resolveNodeLocation
} from "../src/lib/locationResolver";
import type { NetworkMapNode } from "../src/lib/network";

function node(overrides: Partial<NetworkMapNode>): NetworkMapNode {
  return {
    nodeId: "node:test",
    displayName: "Test Provider",
    operator: "Test Operator",
    roles: ["creator", "identity", "content", "commerce", "settlement", "proof"],
    location: {
      country: "Canada",
      region: "Ontario",
      city: "Innisfil",
      displayLocation: "Innisfil, Ontario",
      precision: "city",
      source: "operator_declared"
    },
    overallStatus: "limited",
    services: {
      identity: { status: "ready" },
      content: { status: "ready" },
      commerce: { status: "limited" },
      settlement: { status: "limited" },
      proofs: { status: "ready" }
    },
    readiness: {
      provisioned: { status: "limited" },
      durable: { status: "ready" },
      reachable: { status: "ready" }
    },
    trust: {
      operatorVerified: true,
      proofCapable: true,
      proofCount: 1
    },
    connect: {
      providerNodeId: "node:test",
      providerPublicKey: "ed25519:test",
      providerProfileId: "profile:test",
      providerCanonicalUrl: "https://example.test",
      capabilities: {
        identity: true,
        content: true,
        commerce: true,
        settlement: true,
        proofs: true
      }
    },
    ...overrides
  };
}

const innisfil = node({});
const resolved = resolveNodeLocation(innisfil);

assert.deepEqual(resolved, {
  longitude: -79.6,
  latitude: 44.3,
  zoom: 6,
  label: "Innisfil, Ontario"
});

const abbreviatedInnisfil = node({
  location: {
    country: "Canada",
    region: "ON",
    displayLocation: "Innisfil, ON",
    precision: "region",
    source: "browser_confirmed"
  }
});

assert.deepEqual(resolveNodeLocation(abbreviatedInnisfil), {
  longitude: -79.6,
  latitude: 44.3,
  zoom: 6,
  label: "Innisfil, Ontario"
});

const areas = mappableAreas([
  node({ nodeId: "node:one", displayName: "Provider One", operator: "Operator One" }),
  node({
    nodeId: "node:two",
    displayName: "Provider Two",
    operator: "Operator Two",
    location: {
      country: "Canada",
      region: "ON",
      displayLocation: "Innisfil, ON",
      precision: "region",
      source: "browser_confirmed"
    }
  })
]);

assert.equal(areas.length, 1);
assert.equal(areas[0].label, "Innisfil, Ontario");
assert.equal(areas[0].clusterCount, 2);
assert.equal(areaProviderCountLabel(areas[0]), "2 sovereign providers");

const summaries = areaProviderSummaries(areas[0]);
assert.deepEqual(
  summaries.map((summary) => summary.displayName),
  ["Provider One", "Provider Two"]
);
assert.deepEqual(
  summaries.map((summary) => summary.operator),
  ["Operator One", "Operator Two"]
);

console.log("location resolver validation passed");
