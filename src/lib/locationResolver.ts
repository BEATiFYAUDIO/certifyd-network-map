import { isMapEligibleNode, isProvisionableNode, type NetworkMapNode, type NetworkMapStatus } from "./network";

export type MappableArea = {
  id: string;
  longitude: number;
  latitude: number;
  label: string;
  nodes: NetworkMapNode[];
  status: NetworkMapStatus;
  clusterCount: number;
};

type KnownLocation = {
  longitude: number;
  latitude: number;
  zoom: number;
  label?: string;
};

const KNOWN_LOCATIONS: Record<string, KnownLocation> = {
  "innisfil, ontario, canada": { longitude: -79.6, latitude: 44.3, zoom: 6, label: "Innisfil, Ontario" },
  "innisfil, ontario": { longitude: -79.6, latitude: 44.3, zoom: 6, label: "Innisfil, Ontario" },
  "simcoe county, ontario, canada": { longitude: -79.8661, latitude: 44.5834, zoom: 6, label: "Simcoe County, Ontario" },
  "simcoe county, ontario": { longitude: -79.8661, latitude: 44.5834, zoom: 6, label: "Simcoe County, Ontario" },
  "ontario, canada": { longitude: -85.3232, latitude: 50.0007, zoom: 4, label: "Ontario, Canada" },
  ontario: { longitude: -85.3232, latitude: 50.0007, zoom: 4, label: "Ontario, Canada" },
  canada: { longitude: -106.3468, latitude: 56.1304, zoom: 3, label: "Canada" }
};

export const STATUS_COLORS: Record<NetworkMapStatus, string> = {
  ready: "#4ade80",
  limited: "#f59e0b",
  disabled: "#ef4444",
  offline: "#94a3b8",
  unknown: "#cbd5e1"
};

export function normalizeLocationKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ");
}

export function resolveNodeLocation(node: NetworkMapNode): KnownLocation | null {
  const location = node.location;
  if (!location) return null;

  const candidates = [
    location.displayLocation,
    [location.city, location.region, location.country].filter(Boolean).join(", "),
    [location.region, location.country].filter(Boolean).join(", "),
    location.country
  ]
    .filter((value): value is string => Boolean(value && value.trim()))
    .map(normalizeLocationKey);

  for (const candidate of candidates) {
    const match = KNOWN_LOCATIONS[candidate];
    if (match) return match;
  }

  return null;
}

function publicAreaKey(node: NetworkMapNode): string {
  const location = node.location;
  return normalizeLocationKey(
    location?.displayLocation ||
      [location?.city, location?.region, location?.country].filter(Boolean).join(", ")
  );
}

function publicLocationLabel(node: NetworkMapNode, resolved: KnownLocation): string {
  const location = node.location;
  const declaredLabel = location?.displayLocation || [location?.city, location?.region, location?.country].filter(Boolean).join(", ");
  return resolved.label || declaredLabel || "Approximate public area";
}

const STATUS_SEVERITY: Record<NetworkMapStatus, number> = {
  ready: 0,
  unknown: 1,
  limited: 2,
  disabled: 3,
  offline: 4
};

function areaStatus(nodes: NetworkMapNode[]): NetworkMapStatus {
  return nodes.reduce<NetworkMapStatus>((current, node) => {
    return STATUS_SEVERITY[node.overallStatus] > STATUS_SEVERITY[current] ? node.overallStatus : current;
  }, "ready");
}

export function mappableAreas(nodes: NetworkMapNode[]): MappableArea[] {
  const areas = new Map<string, MappableArea>();

  for (const node of nodes.filter(isMapEligibleNode)) {
    const resolved = resolveNodeLocation(node);
    if (!resolved) continue;

    const label = publicLocationLabel(node, resolved);
    const id = publicAreaKey(node);
    const existing = areas.get(id);

    if (existing) {
      existing.nodes.push(node);
      existing.clusterCount = existing.nodes.length;
      existing.status = areaStatus(existing.nodes);
      continue;
    }

    areas.set(id, {
      id,
      longitude: resolved.longitude,
      latitude: resolved.latitude,
      label,
      nodes: [node],
      status: node.overallStatus,
      clusterCount: 1
    });
  }

  return Array.from(areas.values());
}

export function areaProviderCountLabel(area: MappableArea): string {
  return `${area.clusterCount} sovereign provider${area.clusterCount === 1 ? "" : "s"}`;
}

export function areaProviderSummaries(area: MappableArea) {
  return area.nodes.map((node) => ({
    nodeId: node.nodeId,
    displayName: node.displayName,
    operator: node.operator,
    overallStatus: node.overallStatus,
    commerceStatus: node.services.commerce.status,
    proofsStatus: node.services.proofs.status,
    provisionable: isProvisionableNode(node)
  }));
}

export function initialViewForAreas(areas: MappableArea[]) {
  if (!areas.length) {
    return { longitude: -96.8, latitude: 55.2, zoom: 2.7 };
  }
  if (areas.length === 1) {
    return {
      longitude: areas[0].longitude - 5.5,
      latitude: areas[0].latitude + 1.6,
      zoom: 4
    };
  }
  const longitude = areas.reduce((sum, item) => sum + item.longitude, 0) / areas.length;
  const latitude = areas.reduce((sum, item) => sum + item.latitude, 0) / areas.length;
  return { longitude, latitude, zoom: areas.length < 6 ? 4 : 3.3 };
}
